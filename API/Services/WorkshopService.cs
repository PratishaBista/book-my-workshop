using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Entities;
using API.Enums;
using API.Repositories;
using AutoMapper;
using Ganss.Xss;

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

    public WorkshopService(
        IWorkshopRepository workshopRepository,
        ICategoryRepository categoryRepository,
        IScheduleRepository scheduleRepository,
        IGenericRepository<Provider> providerRepository,
        IMapper mapper)
    {
        _workshopRepository = workshopRepository;
        _categoryRepository = categoryRepository;
        _scheduleRepository = scheduleRepository;
        _providerRepository = providerRepository;
        _mapper = mapper;
        _htmlSanitizer = new HtmlSanitizer();
    }

    public async Task<WorkshopDetailResponse> CreateWorkshopAsync(int providerId, CreateWorkshopRequest request)
    {
        // Validate provider is approved
        var provider = await _providerRepository.GetByIdAsync(providerId);
        if (provider == null || !provider.IsApproved)
        {
            throw new UnauthorizedAccessException("Provider is not approved to create workshops.");
        }

        // Validate category exists
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
        if (category == null || !category.IsActive)
        {
            throw new ArgumentException("Invalid category selected.");
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

        // Validate category
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId);
        if (category == null || !category.IsActive)
        {
            throw new ArgumentException("Invalid category selected.");
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
        workshop.UpdatedAt = DateTime.UtcNow;

        // Update pricing
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

        workshop.Status = WorkshopStatus.Published;
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
}
