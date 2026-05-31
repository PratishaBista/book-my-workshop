using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Entities;
using API.Enums;
using API.Repositories;
using AutoMapper;
using Ganss.Xss;
using System.Text.RegularExpressions;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace API.Services;

/// <summary>
/// Workshop service implementation.
/// Contains business logic for workshop management with validation and security.
/// </summary>
public class WorkshopService : IWorkshopService
{
    private readonly IWorkshopRepository _workshopRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IGenericRepository<Provider> _providerRepository;
    private readonly IMapper _mapper;
    private readonly HtmlSanitizer _htmlSanitizer;
    private readonly IMLService _mlService;
    private readonly WorkshopChangeDetector _changeDetector;
    private readonly IGenericRepository<WorkshopModification> _modificationRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IGenericRepository<UserPreference> _userPreferenceRepository;
    private readonly IMemoryCache _cache;

    public WorkshopService(
        IWorkshopRepository workshopRepository,
        ICategoryRepository categoryRepository,
        IScheduleRepository scheduleRepository,
        IGenericRepository<Provider> providerRepository,
        IMapper mapper,
        IMLService mlService,
        WorkshopChangeDetector changeDetector,
        IGenericRepository<WorkshopModification> modificationRepository,
        IBookingRepository bookingRepository,
        IGenericRepository<UserPreference> userPreferenceRepository,
        IMemoryCache cache)
    {
        _workshopRepository = workshopRepository;
        _categoryRepository = categoryRepository;
        _scheduleRepository = scheduleRepository;
        _providerRepository = providerRepository;
        _mapper = mapper;
        _mlService = mlService;
        _changeDetector = changeDetector;
        _modificationRepository = modificationRepository;
        _bookingRepository = bookingRepository;
        _userPreferenceRepository = userPreferenceRepository;
        _cache = cache;
        _htmlSanitizer = new HtmlSanitizer();
    }

    public async Task<WorkshopDetailResponse> CreateWorkshopAsync(int providerId, CreateWorkshopRequest request)
    {
        var provider = await _providerRepository.GetByIdAsync(providerId);
        if (provider == null)
        {
            throw new UnauthorizedAccessException("Provider record not found.");
        }

        // Validate categories exist
        var categories = await _categoryRepository.FindAsync(c => request.CategoryIds.Contains(c.Id) && c.IsActive);
        if (categories.Count() != request.CategoryIds.Count)
        {
            throw new ArgumentException("One or more selected categories are invalid.");
        }

        // Sanitize HTML description
        request.Description = _htmlSanitizer.Sanitize(request.Description);

        // Validate duration
        if (request.Duration <= TimeSpan.Zero)
        {
            throw new ArgumentException("Duration must be greater than zero.");
        }

        // Validate capacity
        if (request.MinCapacity.HasValue && request.MinCapacity.Value > request.MaxCapacity)
        {
            throw new ArgumentException("Minimum capacity cannot be greater than maximum capacity.");
        }

        // Map to workshop entity
        var workshop = _mapper.Map<Workshop>(request);
        workshop.ProviderId = providerId;
        workshop.WorkshopType = WorkshopType.PublicClass;
        workshop.Categories = categories.ToList();
        workshop.Slug = GenerateSlug(request.Title, request.LocationAddress);

        // Create workshop
        await _workshopRepository.AddAsync(workshop);

        // Create pricing
        var pricing = _mapper.Map<WorkshopPricing>(request);
        pricing.WorkshopId = workshop.Id;


        workshop.Pricing = pricing;

        await _workshopRepository.SaveChangesAsync();

        // Return detail response
        return await GetWorkshopByIdAsync(workshop.Id) 
            ?? throw new Exception("Workshop created but failed to retrieve.");
    }

    public async Task<WorkshopDetailResponse> UpdateWorkshopAsync(int workshopId, int providerId, UpdateWorkshopRequest request)
    {
        // Get workshop and verify ownership (eager load media)
        var workshop = await _workshopRepository.GetWorkshopWithDetailsAsync(workshopId);
        if (workshop == null)
        {
            throw new KeyNotFoundException("Workshop not found.");
        }

        if (workshop.ProviderId != providerId)
        {
            throw new UnauthorizedAccessException("You do not have permission to update this workshop.");
        }

        // Validate categories
        var categories = await _categoryRepository.FindAsync(c => request.CategoryIds.Contains(c.Id) && c.IsActive);
        if (categories.Count() != request.CategoryIds.Count)
        {
            throw new ArgumentException("One or more selected categories are invalid.");
        }

        // Sanitize description
        request.Description = _htmlSanitizer.Sanitize(request.Description);

        // Validate duration
        if (request.Duration <= TimeSpan.Zero)
        {
            throw new ArgumentException("Duration must be greater than zero.");
        }

        // Store original major fields in case they need to be reverted
        var originalTitle = workshop.Title;
        var originalTagline = workshop.Tagline;
        var originalSubtitle = workshop.Subtitle;
        var originalDuration = workshop.Duration;
        var originalMaxCapacity = workshop.MaxCapacity;
        var originalMinCapacity = workshop.MinCapacity;
        var originalAddress = workshop.LocationAddress;
        var originalLocName = workshop.LocationName;
        var originalVenueId = workshop.VenueId;
        var originalType = workshop.WorkshopType;
        var originalCategories = workshop.Categories.ToList();
        var originalPrice = workshop.Pricing?.BasePrice ?? 0;

        // Detect changes before mapping
        var (hasMajor, hasMinor, changedFields) = _changeDetector.DetectChanges(workshop, request, request.CategoryIds);

        // Map updates (Media is ignored in mapper)
        _mapper.Map(request, workshop);

        // Apply Approval Logic: Major changes to a Published workshop should NOT be visible immediately
        if (workshop.Status == WorkshopStatus.Published && hasMajor)
        {
            // 1. Create a modification record to store the "New" data
            var modification = new WorkshopModification
            {
                WorkshopId = workshop.Id,
                ModifiedFields = JsonSerializer.Serialize(changedFields),
                PendingData = JsonSerializer.Serialize(request),
                PreviousStatus = WorkshopStatus.Published,
                NewStatus = WorkshopStatus.Published,
                HasMajorChanges = true,
                CreatedAt = DateTime.UtcNow
            };
            await _modificationRepository.AddAsync(modification);

            // 2. REVERT the major fields on the main entity so the public page stays the same
            workshop.Title = originalTitle;
            workshop.Tagline = originalTagline;
            workshop.Subtitle = originalSubtitle;
            workshop.Duration = originalDuration;
            workshop.MaxCapacity = originalMaxCapacity;
            workshop.MinCapacity = originalMinCapacity;
            workshop.LocationAddress = originalAddress;
            workshop.LocationName = originalLocName;
            workshop.VenueId = originalVenueId;
            workshop.WorkshopType = originalType;
            workshop.Categories = originalCategories;
            if (workshop.Pricing != null) workshop.Pricing.BasePrice = originalPrice;

            // 3. Set flags
            workshop.HasPendingModifications = true;
        }
        
        // Handle Media updates manually 
        workshop.Media.Clear();
        foreach (var m in request.Media)
        {
            var mediaEntity = _mapper.Map<WorkshopMedia>(m);
            mediaEntity.WorkshopId = workshop.Id;
            workshop.Media.Add(mediaEntity);
        }

        if (workshop.Status != WorkshopStatus.Published || !hasMajor)
        {
            workshop.Categories = categories.ToList();
            workshop.Slug = GenerateSlug(request.Title, request.LocationAddress);
        }
        workshop.UpdatedAt = DateTime.UtcNow;



        if (workshop.Pricing != null)
        {
            _mapper.Map(request, workshop.Pricing);
            workshop.Pricing.UpdatedAt = DateTime.UtcNow;
        }

        _workshopRepository.Update(workshop);
        await _workshopRepository.SaveChangesAsync();

        return await GetWorkshopByIdAsync(workshopId) 
            ?? throw new Exception("Workshop updated but failed to retrieve.");
    }

    public async Task<bool> DeleteWorkshopAsync(int workshopId, int providerId)
    {
        var workshop = await _workshopRepository.GetByIdAsync(workshopId);
        if (workshop == null)
        {
            return false;
        }

        if (workshop.ProviderId != providerId)
        {
            throw new UnauthorizedAccessException("You do not have permission to delete this workshop.");
        }

        // Soft delete
        workshop.IsActive = false;
        _workshopRepository.Update(workshop);
        await _workshopRepository.SaveChangesAsync();

        return true;
    }

    public async Task<WorkshopDetailResponse?> GetWorkshopBySlugAsync(string slug, string? userId = null)
    {
        var workshops = await _workshopRepository.FindAsync(w => w.Slug == slug && w.IsActive);
        var workshopEntity = workshops.FirstOrDefault();
        
        if (workshopEntity == null) return null;
        
        return await GetWorkshopByIdAsync(workshopEntity.Id, userId);
    }

    public async Task<WorkshopDetailResponse?> GetWorkshopByIdAsync(int id, string? userId = null)
    {
        var workshop = await _workshopRepository.GetWorkshopWithDetailsAsync(id);
        if (workshop == null)
        {
            return null;
        }

        var response = _mapper.Map<WorkshopDetailResponse>(workshop);

        if (!string.IsNullOrEmpty(userId))
        {
            response.BookedScheduleIds = await _bookingRepository.GetBookedScheduleIdsForUserAsync(userId, id);
            response.PendingPaymentScheduleIds =
                await _bookingRepository.GetPendingPaymentScheduleIdsForUserAsync(userId, id);
        }

        return response;
    }

    public async Task<IEnumerable<WorkshopListResponse>> GetAllPublishedWorkshopsAsync()
    {
        if (_cache.TryGetValue("CacheKey_AllPublished", out IEnumerable<WorkshopListResponse>? cachedWorkshops))
        {
            return cachedWorkshops!;
        }

        var workshops = await _workshopRepository.GetPublishedWorkshopsAsync();
        var result = _mapper.Map<IEnumerable<WorkshopListResponse>>(workshops);

        _cache.Set("CacheKey_AllPublished", result, TimeSpan.FromMinutes(5));

        return result;
    }

    public async Task<IEnumerable<WorkshopListResponse>> GetWorkshopsByCategoryAsync(int categoryId)
    {
        string cacheKey = $"CacheKey_Category_{categoryId}";
        if (_cache.TryGetValue(cacheKey, out IEnumerable<WorkshopListResponse>? cachedWorkshops))
        {
            return cachedWorkshops!;
        }

        var workshops = await _workshopRepository.GetWorkshopsByCategoryAsync(categoryId);
        var result = _mapper.Map<IEnumerable<WorkshopListResponse>>(workshops);

        _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));

        return result;
    }

    public async Task<IEnumerable<WorkshopListResponse>> GetProviderWorkshopsAsync(int providerId)
    {
        var workshops = await _workshopRepository.GetWorkshopsByProviderAsync(providerId);
        return _mapper.Map<IEnumerable<WorkshopListResponse>>(workshops);
    }

    public async Task<IEnumerable<WorkshopListResponse>> SearchWorkshopsAsync(string? searchTerm, int? categoryId, string? location)
    {
        var workshops = await _workshopRepository.SearchWorkshopsAsync(searchTerm ?? string.Empty, categoryId, location);
        return _mapper.Map<IEnumerable<WorkshopListResponse>>(workshops);
    }

    public async Task<IEnumerable<WorkshopListResponse>> GetFeaturedWorkshopsAsync(int count = 6)
    {
        string cacheKey = $"CacheKey_FeaturedWorkshops_{count}";
        if (_cache.TryGetValue(cacheKey, out IEnumerable<WorkshopListResponse>? cachedWorkshops))
        {
            return cachedWorkshops!;
        }

        var workshops = await _workshopRepository.GetFeaturedWorkshopsAsync(count);
        var result = _mapper.Map<IEnumerable<WorkshopListResponse>>(workshops);

        _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));

        return result;
    }

    public async Task<bool> PublishWorkshopAsync(int workshopId, int providerId)
    {
        var workshop = await _workshopRepository.GetByIdAsync(workshopId);
        if (workshop == null)
        {
            return false;
        }

        if (workshop.ProviderId != providerId)
        {
            throw new UnauthorizedAccessException("You do not have permission to publish this workshop.");
        }

        // Move to review stage rather than straight to published
        workshop.Status = WorkshopStatus.PendingReview;
        workshop.UpdatedAt = DateTime.UtcNow;



        _workshopRepository.Update(workshop);
        await _workshopRepository.SaveChangesAsync();

        return true;
    }

    public async Task<bool> UnpublishWorkshopAsync(int workshopId, int providerId)
    {
        var workshop = await _workshopRepository.GetByIdAsync(workshopId);
        if (workshop == null)
        {
            return false;
        }

        if (workshop.ProviderId != providerId)
        {
            throw new UnauthorizedAccessException("You do not have permission to unpublish this workshop.");
        }

        workshop.Status = WorkshopStatus.Draft;
        workshop.UpdatedAt = DateTime.UtcNow;
        _workshopRepository.Update(workshop);
        await _workshopRepository.SaveChangesAsync();

        return true;
    }

    public async Task<ScheduleResponse> AddScheduleAsync(int workshopId, int providerId, AddScheduleRequest request)
    {
        // Verify workshop ownership
        var isOwner = await _workshopRepository.IsWorkshopOwnedByProviderAsync(workshopId, providerId);
        if (!isOwner)
        {
            throw new UnauthorizedAccessException("You do not have permission to add schedules to this workshop.");
        }

        // Validate dates
        if (request.StartDateTime <= DateTime.UtcNow)
        {
            throw new ArgumentException("Start date must be in the future.");
        }

        if (request.EndDateTime <= request.StartDateTime)
        {
            throw new ArgumentException("End date must be after start date.");
        }

        var schedule = _mapper.Map<WorkshopSchedule>(request);
        schedule.WorkshopId = workshopId;
        schedule.MaxCapacity = request.AvailableSeats; // Set initial max capacity
        schedule.AvailableSeats = request.AvailableSeats; // Set starting availability

        await _scheduleRepository.AddAsync(schedule);
        await _scheduleRepository.SaveChangesAsync();

        return _mapper.Map<ScheduleResponse>(schedule);
    }

    public async Task<IEnumerable<ScheduleResponse>> AddSchedulesBulkAsync(int workshopId, int providerId, IEnumerable<AddScheduleRequest> requests)
    {
        var isOwner = await _workshopRepository.IsWorkshopOwnedByProviderAsync(workshopId, providerId);
        if (!isOwner) throw new UnauthorizedAccessException("Not authorized to add schedules to this workshop.");

        var schedules = new List<WorkshopSchedule>();
        foreach (var request in requests)
        {
            var schedule = _mapper.Map<WorkshopSchedule>(request);
            schedule.WorkshopId = workshopId;
            schedule.MaxCapacity = request.AvailableSeats;
            schedule.AvailableSeats = request.AvailableSeats;
            schedules.Add(schedule);
        }

        await _scheduleRepository.AddRangeAsync(schedules);
        await _scheduleRepository.SaveChangesAsync();
        return _mapper.Map<IEnumerable<ScheduleResponse>>(schedules);
    }

    public async Task<ScheduleResponse> UpdateScheduleAsync(int workshopId, int scheduleId, int providerId, AddScheduleRequest request)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(scheduleId);
        if (schedule == null || schedule.WorkshopId != workshopId)
        {
            throw new KeyNotFoundException("Schedule not found.");
        }

        var isOwner = await _workshopRepository.IsWorkshopOwnedByProviderAsync(workshopId, providerId);
        if (!isOwner)
        {
            throw new UnauthorizedAccessException("You do not have permission to update this schedule.");
        }

        // Validate dates
        if (request.EndDateTime <= request.StartDateTime)
        {
            throw new ArgumentException("End date must be after start date.");
        }

        schedule.StartDateTime = request.StartDateTime;
        schedule.EndDateTime = request.EndDateTime;
        
        // Calculate the difference if capacity is being updated
        int bookedSeats = schedule.MaxCapacity - schedule.AvailableSeats;
        schedule.MaxCapacity = request.AvailableSeats;
        schedule.AvailableSeats = Math.Max(0, request.AvailableSeats - bookedSeats);

        _scheduleRepository.Update(schedule);
        await _scheduleRepository.SaveChangesAsync();

        return _mapper.Map<ScheduleResponse>(schedule);
    }

    public async Task<bool> DeleteScheduleAsync(int workshopId, int scheduleId, int providerId)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(scheduleId);
        if (schedule == null || schedule.WorkshopId != workshopId)
        {
            return false;
        }

        var isOwner = await _workshopRepository.IsWorkshopOwnedByProviderAsync(workshopId, providerId);
        if (!isOwner)
        {
            throw new UnauthorizedAccessException("You do not have permission to delete this schedule.");
        }

        // Mark as cancelled instead of deleting
        schedule.Status = ScheduleStatus.Cancelled;
        _scheduleRepository.Update(schedule);
        await _scheduleRepository.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<ScheduleResponse>> GetWorkshopSchedulesAsync(int workshopId)
    {
        var schedules = await _scheduleRepository.GetUpcomingSchedulesForWorkshopAsync(workshopId);
        return _mapper.Map<IEnumerable<ScheduleResponse>>(schedules);
    }

    public async Task<IEnumerable<ScheduleResponse>> GetProviderSchedulesAsync(int providerId)
    {
        var schedules = await _scheduleRepository.GetProviderUpcomingSchedulesAsync(providerId);
        return _mapper.Map<IEnumerable<ScheduleResponse>>(schedules);
    }

    public async Task<IEnumerable<ScheduleWithBookingsResponse>> GetProviderSchedulesWithBookingsAsync(int providerId)
    {
        var schedules = await _scheduleRepository.GetProviderSchedulesWithBookingsAsync(providerId);
        
        var response = schedules.Select(s => new ScheduleWithBookingsResponse
        {
            Id = s.Id,
            WorkshopId = s.WorkshopId,
            WorkshopTitle = s.Workshop?.Title ?? string.Empty,
            BasePrice = s.Workshop?.Pricing?.BasePrice ?? 0,
            StartDateTime = s.StartDateTime,
            EndDateTime = s.EndDateTime,
            MaxCapacity = s.MaxCapacity,
            AvailableSeats = s.AvailableSeats,
            IsSoldOut = s.AvailableSeats <= 0,
            Status = s.Status,
            Bookings = s.Bookings?
                .Where(b => b.BookingStatus == BookingStatus.Confirmed
                    && b.PaymentStatus == PaymentStatus.Paid
                    && !b.ConfirmationCode.StartsWith("SEED-REV-", StringComparison.Ordinal))
                .Select(b => new BookingAttendeeResponse
                {
                    Id = b.Id,
                    GuestName = b.User?.FullName ?? "Unknown",
                    GuestEmail = b.User?.Email,
                    NumberOfSeats = b.NumberOfSeats,
                    ConfirmationCode = b.ConfirmationCode,
                    BookingStatus = b.BookingStatus,
                    PaymentStatus = b.PaymentStatus,
                    BookingDate = b.BookingDate,
                    AttendanceStatus = b.AttendanceStatus,
                    CheckedInAt = b.CheckedInAt
                }).ToList() ?? new List<BookingAttendeeResponse>()
        });

        return response;
    }

    public async Task<bool> MarkScheduleCompleteAsync(int providerId, int scheduleId)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(scheduleId);
        
        if (schedule == null)
            return false;

        var workshop = await _workshopRepository.GetByIdAsync(schedule.WorkshopId);
        if (workshop == null || workshop.ProviderId != providerId)
            throw new UnauthorizedAccessException("You don't have permission to modify this schedule.");

        if (schedule.Status == ScheduleStatus.Completed)
            throw new InvalidOperationException("This session is already marked as complete.");

        if (schedule.Status == ScheduleStatus.Cancelled)
            throw new InvalidOperationException("Cancelled sessions cannot be marked complete.");

        if (schedule.EndDateTime > DateTime.UtcNow)
            throw new InvalidOperationException(
                "You can only mark a session complete after its scheduled end time has passed.");

        var scheduleWithBookings = await _scheduleRepository.GetScheduleWithBookingsAsync(scheduleId);
        if (scheduleWithBookings?.Bookings != null)
        {
            foreach (var booking in scheduleWithBookings.Bookings.Where(b =>
                         b.BookingStatus == BookingStatus.Confirmed
                         && b.PaymentStatus == PaymentStatus.Paid
                         && b.AttendanceStatus == AttendanceStatus.Pending))
            {
                booking.AttendanceStatus = AttendanceStatus.NoShow;
                _bookingRepository.Update(booking);
            }
        }

        schedule.Status = ScheduleStatus.Completed;
        _scheduleRepository.Update(schedule);
        await _scheduleRepository.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<WorkshopListResponse>> GetRelatedWorkshopsAsync(int id, int count = 5)
    {
        string cacheKey = $"CacheKey_RelatedWorkshops_{id}_{count}";
        if (_cache.TryGetValue(cacheKey, out IEnumerable<WorkshopListResponse>? cachedRelated))
        {
            return cachedRelated!;
        }

        var sourceWorkshop = await _workshopRepository.GetWorkshopWithDetailsAsync(id);
        if (sourceWorkshop == null) return Enumerable.Empty<WorkshopListResponse>();

        var sameProviderWorkshops = await _workshopRepository.FindAsync(w => 
            w.ProviderId == sourceWorkshop.ProviderId && 
            w.Id != id && 
            w.Status == WorkshopStatus.Published && 
            w.IsActive);
        
        var sameProviderList = _mapper.Map<List<WorkshopListResponse>>(sameProviderWorkshops);

        var otherCandidates = await _workshopRepository.FindAsync(w => 
            w.ProviderId != sourceWorkshop.ProviderId && 
            w.Status == WorkshopStatus.Published && 
            w.IsActive);

        IEnumerable<WorkshopListResponse> finalResult;

        if (otherCandidates.Any())
        {
            var sourceText = $"{sourceWorkshop.Title}. {sourceWorkshop.Tagline}. {sourceWorkshop.Description}";
            var candidatesData = otherCandidates.Select(c => (c.Id, $"{c.Title}. {c.Tagline}. {c.Description}")).ToList();

            var rankedResults = await _mlService.PredictSimilaritiesWithScoresAsync(sourceText, candidatesData);

            var highQualityIds = rankedResults
                .Where(r => r.Score >= 0.45) 
                .Select(r => r.Id)
                .ToList();

            var rankedCandidates = otherCandidates
                .Where(c => highQualityIds.Contains(c.Id))
                .OrderBy(c => {
                    var index = highQualityIds.IndexOf(c.Id);
                    return index == -1 ? int.MaxValue : index;
                })
                .Take(count);

            var rankedList = _mapper.Map<List<WorkshopListResponse>>(rankedCandidates);
            
            foreach(var item in rankedList)
            {
                var match = rankedResults.FirstOrDefault(r => r.Id == item.Id);
                item.RecommendationScore = match.Score;
            }
            
            finalResult = sameProviderList.Concat(rankedList).DistinctBy(w => w.Id).Take(count);
        }
        else
        {
            finalResult = sameProviderList.Take(count);
        }

        _cache.Set(cacheKey, finalResult, TimeSpan.FromMinutes(15));
        return finalResult;
    }

    public async Task<IEnumerable<WorkshopListResponse>> GetRecommendedWorkshopsForUserAsync(string userId, int count = 6)
    {
        string cacheKey = $"CacheKey_Recommendations_{userId}_{count}";
        if (_cache.TryGetValue(cacheKey, out IEnumerable<WorkshopListResponse>? cachedWorkshops))
        {
            return cachedWorkshops!;
        }

        // Get User Interest Categories
        var userPrefs = await _userPreferenceRepository.FindAsync(up => up.UserId == userId);
        
        if (!userPrefs.Any())
        {
            // If no interests, return empty to avoid duplicate featured sessions
            return Enumerable.Empty<WorkshopListResponse>();
        }

        var categoryIds = userPrefs.Select(p => p.CategoryId).ToList();
        var userCategories = await _categoryRepository.FindAsync(c => categoryIds.Contains(c.Id));

        // Create "User Profile Text" (Combined names of all interested categories)
        var userInterestText = string.Join(" ", userCategories.Select(c => c.Name));

        // Get all published workshops as candidates
        var allWorkshops = await _workshopRepository.GetPublishedWorkshopsAsync();
        var candidates = allWorkshops
            .Select(w => (w.Id, $"{w.Title}. {w.Tagline}. {w.Description}"))
            .ToList();

        // Call Custom ML Service to Rank
        var rankedResults = await _mlService.PredictSimilaritiesWithScoresAsync(userInterestText, candidates);

        // Select the top N items (only those with positive similarity)
        var topIds = rankedResults
            .Where(r => r.Score > 0) // Filter out non-matching workshops
            .OrderByDescending(r => r.Score)
            .Take(count)
            .Select(r => r.Id)
            .ToList();

        if (!topIds.Any())
        {
            return Enumerable.Empty<WorkshopListResponse>();
        }

        var recommendedWorkshops = allWorkshops
            .Where(w => topIds.Contains(w.Id))
            .ToList()
            .OrderBy(w => {
                var index = topIds.IndexOf(w.Id);
                return index == -1 ? int.MaxValue : index;
            });

        var results = _mapper.Map<List<WorkshopListResponse>>(recommendedWorkshops);
        
        foreach (var item in results)
        {
            var match = rankedResults.FirstOrDefault(r => r.Id == item.Id);
            item.RecommendationScore = match.Score;
        }

        _cache.Set(cacheKey, results, TimeSpan.FromMinutes(15));

        return results;
    }

    private string GenerateSlug(string title, string address)
    {
        var raw = $"{title} {address}".ToLower();
        var str = Regex.Replace(raw, @"[^a-z0-9\s-]", "");
        str = Regex.Replace(str, @"\s+", " ").Trim();
        str = Regex.Replace(str, @"\s", "-");
        return str;
    }
}
