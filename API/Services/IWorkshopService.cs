using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Entities;

namespace API.Services;

/// <summary>
/// Workshop service interface.
/// Defines business logic operations for workshop management.
/// </summary>
public interface IWorkshopService
{
    // Workshop CRUD
    Task<WorkshopDetailResponse> CreateWorkshopAsync(int providerId, CreateWorkshopRequest request);
    Task<WorkshopDetailResponse> UpdateWorkshopAsync(int workshopId, int providerId, UpdateWorkshopRequest request);
    Task<bool> DeleteWorkshopAsync(int workshopId, int providerId);
    Task<WorkshopDetailResponse?> GetWorkshopByIdAsync(int id);
    Task<IEnumerable<WorkshopListResponse>> GetAllPublishedWorkshopsAsync();
    Task<IEnumerable<WorkshopListResponse>> GetWorkshopsByCategoryAsync(int categoryId);
    Task<IEnumerable<WorkshopListResponse>> GetProviderWorkshopsAsync(int providerId);
    Task<IEnumerable<WorkshopListResponse>> SearchWorkshopsAsync(string? searchTerm, int? categoryId, string? location);
    Task<IEnumerable<WorkshopListResponse>> GetFeaturedWorkshopsAsync(int count = 6);
    
    // Workshop Publishing
    Task<bool> PublishWorkshopAsync(int workshopId, int providerId);
    Task<bool> UnpublishWorkshopAsync(int workshopId, int providerId);
    
    // Schedule Management
    Task<ScheduleResponse> AddScheduleAsync(int workshopId, int providerId, AddScheduleRequest request);
    Task<ScheduleResponse> UpdateScheduleAsync(int workshopId, int scheduleId, int providerId, AddScheduleRequest request);
    Task<bool> DeleteScheduleAsync(int workshopId, int scheduleId, int providerId);
    Task<IEnumerable<ScheduleResponse>> GetWorkshopSchedulesAsync(int workshopId);
}
