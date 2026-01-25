using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Entities;
using API.Enums;
using API.Repositories;
using AutoMapper;
using Ganss.Xss;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

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

    public WorkshopService(
        IWorkshopRepository workshopRepository,
        ICategoryRepository categoryRepository,
        IScheduleRepository scheduleRepository,
        IGenericRepository<Provider> providerRepository,
        IMapper mapper,
        IMLService mlService)
    {
        _workshopRepository = workshopRepository;
        _categoryRepository = categoryRepository;
        _scheduleRepository = scheduleRepository;
        _providerRepository = providerRepository;
        _mapper = mapper;
        _mlService = mlService;
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
        workshop.Categories = categories.ToList();
        workshop.Slug = GenerateSlug(request.Title, request.LocationAddress);

        // Create workshop
        await _workshopRepository.AddAsync(workshop);

        // Create pricing
        var pricing = _mapper.Map<WorkshopPricing>(request);
        pricing.WorkshopId = workshop.Id;
        try 
        {
            var (category, confidence, isConfident) = await _mlService.PredictCategoryAsync(workshop.Title, workshop.Description);
            if (category != null)
            {
                workshop.AISuggestedCategory = category;
                workshop.AIConfidenceScore = confidence;
                workshop.AIIsConfident = isConfident;
            }
        }
        catch (Exception ex) 
        {
            Console.WriteLine($"ML Error during creation: {ex.Message}");
        }

        workshop.Pricing = pricing;

        await _workshopRepository.SaveChangesAsync();

        // Return detail response
        return await GetWorkshopByIdAsync(workshop.Id) 
            ?? throw new Exception("Workshop created but failed to retrieve.");
    }

    public async Task<WorkshopDetailResponse> UpdateWorkshopAsync(int workshopId, int providerId, UpdateWorkshopRequest request)
    {
        // Get workshop and verify ownership
        var workshop = await _workshopRepository.GetByIdAsync(workshopId);
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

        // Map updates
        _mapper.Map(request, workshop);
        workshop.Categories = categories.ToList();
        workshop.UpdatedAt = DateTime.UtcNow;
        workshop.Slug = GenerateSlug(request.Title, request.LocationAddress);

        // Perform ML Classification on Update
        try 
        {
            var (category, confidence, isConfident) = await _mlService.PredictCategoryAsync(workshop.Title, workshop.Description);
            if (category != null)
            {
                workshop.AISuggestedCategory = category;
                workshop.AIConfidenceScore = confidence;
                workshop.AIIsConfident = isConfident;
            }
        }
        catch (Exception ex) 
        {
            Console.WriteLine($"ML Error during update: {ex.Message}");
        }

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

    public async Task<WorkshopDetailResponse?> GetWorkshopBySlugAsync(string slug)
    {
        var workshops = await _workshopRepository.FindAsync(w => w.Slug == slug && w.IsActive);
        var workshopEntity = workshops.FirstOrDefault();
        
        if (workshopEntity == null) return null;
        
        return await GetWorkshopByIdAsync(workshopEntity.Id);
    }

    public async Task<WorkshopDetailResponse?> GetWorkshopByIdAsync(int id)
    {
        var workshop = await _workshopRepository.GetWorkshopWithDetailsAsync(id);
        if (workshop == null)
        {
            return null;
        }

        return _mapper.Map<WorkshopDetailResponse>(workshop);
    }

    public async Task<IEnumerable<WorkshopListResponse>> GetAllPublishedWorkshopsAsync()
    {
        var workshops = await _workshopRepository.GetPublishedWorkshopsAsync();
        return _mapper.Map<IEnumerable<WorkshopListResponse>>(workshops);
    }

    public async Task<IEnumerable<WorkshopListResponse>> GetWorkshopsByCategoryAsync(int categoryId)
    {
        var workshops = await _workshopRepository.GetWorkshopsByCategoryAsync(categoryId);
        return _mapper.Map<IEnumerable<WorkshopListResponse>>(workshops);
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
        var workshops = await _workshopRepository.GetFeaturedWorkshopsAsync(count);
        return _mapper.Map<IEnumerable<WorkshopListResponse>>(workshops);
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

        var (pCategory, pConfidence, pIsConfident) = await _mlService.PredictCategoryAsync(workshop.Title, workshop.Description);
        if (pCategory != null)
        {
            workshop.AISuggestedCategory = pCategory;
            workshop.AIConfidenceScore = pConfidence;
            workshop.AIIsConfident = pIsConfident;
        }

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

        await _scheduleRepository.AddAsync(schedule);
        await _scheduleRepository.SaveChangesAsync();

        return _mapper.Map<ScheduleResponse>(schedule);
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
        schedule.AvailableSeats = request.AvailableSeats;

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

    public async Task<IEnumerable<WorkshopListResponse>> GetRelatedWorkshopsAsync(int id, int count = 5)
    {
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
            
            var combined = sameProviderList.Concat(rankedList).DistinctBy(w => w.Id).Take(count);
            return combined;
        }

        return sameProviderList.Take(count);
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
