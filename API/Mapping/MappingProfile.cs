using API.DTOs.Requests;
using API.DTOs.Responses;
using API.Entities;
using API.Enums;
using AutoMapper;

namespace API.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Workshop mappings
        CreateMap<CreateWorkshopRequest, Workshop>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ProviderId, opt => opt.Ignore())
            .ForMember(dest => dest.Provider, opt => opt.Ignore())
            .ForMember(dest => dest.Category, opt => opt.Ignore())
            .ForMember(dest => dest.Pricing, opt => opt.Ignore())
            .ForMember(dest => dest.Media, opt => opt.MapFrom(src => src.Media))
            .ForMember(dest => dest.Schedules, opt => opt.Ignore())
            .ForMember(dest => dest.Reviews, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => WorkshopStatus.Draft))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<UpdateWorkshopRequest, Workshop>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ProviderId, opt => opt.Ignore())
            .ForMember(dest => dest.Provider, opt => opt.Ignore())
            .ForMember(dest => dest.Category, opt => opt.Ignore())
            .ForMember(dest => dest.Pricing, opt => opt.Ignore())
            .ForMember(dest => dest.Media, opt => opt.Ignore())
            .ForMember(dest => dest.Schedules, opt => opt.Ignore())
            .ForMember(dest => dest.Reviews, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<Workshop, WorkshopListResponse>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
            .ForMember(dest => dest.ProviderBusinessName, opt => opt.MapFrom(src => src.Provider.BusinessName))
            .ForMember(dest => dest.BasePrice, opt => opt.MapFrom(src => src.Pricing != null ? src.Pricing.BasePrice : 0))
            .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.Pricing != null ? src.Pricing.Currency : "NPR"))
            .ForMember(dest => dest.PrimaryImageUrl, opt => opt.MapFrom(src => src.Media.FirstOrDefault(m => m.IsPrimary) != null ? src.Media.FirstOrDefault(m => m.IsPrimary)!.Url : src.Media.OrderBy(m => m.DisplayOrder).FirstOrDefault() != null ? src.Media.OrderBy(m => m.DisplayOrder).FirstOrDefault()!.Url : null))
            .ForMember(dest => dest.AverageRating, opt => opt.MapFrom(src => src.Reviews.Any() ? src.Reviews.Average(r => (double)r.Rating) : (double?)null))
            .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => src.Reviews.Count))
            .ForMember(dest => dest.HasUpcomingSchedules, opt => opt.MapFrom(src => src.Schedules.Any(s => s.StartDateTime > DateTime.UtcNow && s.Status == ScheduleStatus.Upcoming)))
            .ForMember(dest => dest.NextScheduleDate, opt => opt.MapFrom(src => src.Schedules.Where(s => s.StartDateTime > DateTime.UtcNow && s.Status == ScheduleStatus.Upcoming).OrderBy(s => s.StartDateTime).Select(s => (DateTime?)s.StartDateTime).FirstOrDefault()));

        CreateMap<Workshop, WorkshopDetailResponse>()
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category))
            .ForMember(dest => dest.Provider, opt => opt.MapFrom(src => src.Provider))
            .ForMember(dest => dest.Pricing, opt => opt.MapFrom(src => src.Pricing))
            .ForMember(dest => dest.Media, opt => opt.MapFrom(src => src.Media.OrderBy(m => m.DisplayOrder)))
            .ForMember(dest => dest.UpcomingSchedules, opt => opt.MapFrom(src => src.Schedules.Where(s => s.StartDateTime > DateTime.UtcNow && s.Status == ScheduleStatus.Upcoming).OrderBy(s => s.StartDateTime)))
            .ForMember(dest => dest.Reviews, opt => opt.MapFrom(src => src.Reviews.OrderByDescending(r => r.CreatedAt)))
            .ForMember(dest => dest.AverageRating, opt => opt.MapFrom(src => src.Reviews.Any() ? src.Reviews.Average(r => (double)r.Rating) : (double?)null))
            .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => src.Reviews.Count));

        // Category mappings
        CreateMap<WorkshopCategory, CategoryResponse>();
        CreateMap<CreateCategoryRequest, WorkshopCategory>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Workshops, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        // Provider mappings
        CreateMap<Provider, ProviderResponse>();

        // Pricing mappings
        CreateMap<CreateWorkshopRequest, WorkshopPricing>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.WorkshopId, opt => opt.Ignore())
            .ForMember(dest => dest.Workshop, opt => opt.Ignore())
            .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => "NPR"))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<UpdateWorkshopRequest, WorkshopPricing>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.WorkshopId, opt => opt.Ignore())
            .ForMember(dest => dest.Workshop, opt => opt.Ignore())
            .ForMember(dest => dest.Currency, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<WorkshopPricing, PricingResponse>();

        // Media mappings
        CreateMap<WorkshopMedia, MediaResponse>();

        // Schedule mappings
        CreateMap<AddScheduleRequest, WorkshopSchedule>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.WorkshopId, opt => opt.Ignore())
            .ForMember(dest => dest.Workshop, opt => opt.Ignore())
            .ForMember(dest => dest.Bookings, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => ScheduleStatus.Upcoming))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<WorkshopSchedule, ScheduleResponse>()
            .ForMember(dest => dest.IsSoldOut, opt => opt.MapFrom(src => src.IsSoldOut));

        CreateMap<WorkshopSchedule, ScheduleInfoResponse>();

        // Booking mappings
        CreateMap<CreateBookingRequest, Booking>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.WorkshopSchedule, opt => opt.Ignore())
            .ForMember(dest => dest.TotalAmount, opt => opt.Ignore())
            .ForMember(dest => dest.BookingStatus, opt => opt.MapFrom(src => BookingStatus.Pending))
            .ForMember(dest => dest.PaymentStatus, opt => opt.MapFrom(src => PaymentStatus.Pending))
            .ForMember(dest => dest.ConfirmationCode, opt => opt.Ignore())
            .ForMember(dest => dest.BookingDate, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Review, opt => opt.Ignore());

        CreateMap<Booking, BookingResponse>()
            .ForMember(dest => dest.Schedule, opt => opt.MapFrom(src => src.WorkshopSchedule))
            .ForMember(dest => dest.Workshop, opt => opt.MapFrom(src => src.WorkshopSchedule.Workshop))
            .ForMember(dest => dest.CanReview, opt => opt.Ignore())
            .ForMember(dest => dest.HasReviewed, opt => opt.MapFrom(src => src.Review != null));

        CreateMap<WorkshopMediaRequest, WorkshopMedia>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.WorkshopId, opt => opt.Ignore())
            .ForMember(dest => dest.Workshop, opt => opt.Ignore())
            .ForMember(dest => dest.UploadedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<Workshop, WorkshopInfoResponse>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
            .ForMember(dest => dest.PrimaryImageUrl, opt => opt.MapFrom(src => src.Media.FirstOrDefault(m => m.IsPrimary) != null ? src.Media.FirstOrDefault(m => m.IsPrimary)!.Url : src.Media.OrderBy(m => m.DisplayOrder).FirstOrDefault() != null ? src.Media.OrderBy(m => m.DisplayOrder).FirstOrDefault()!.Url : null));

        // Review mappings
        CreateMap<AddReviewRequest, WorkshopReview>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.WorkshopId, opt => opt.Ignore())
            .ForMember(dest => dest.Workshop, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.Booking, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<WorkshopReview, ReviewResponse>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName))
            .ForMember(dest => dest.IsVerifiedAttendee, opt => opt.MapFrom(src => src.IsVerifiedAttendee));
    }
}
