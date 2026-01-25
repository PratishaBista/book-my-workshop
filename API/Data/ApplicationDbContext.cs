using API.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // Existing DbSets
    public DbSet<Provider> Providers { get; set; }
    public DbSet<Venue> Venues { get; set; }

    // Workshop-related DbSets
    public DbSet<WorkshopCategory> WorkshopCategories { get; set; }
    public DbSet<Workshop> Workshops { get; set; }
    public DbSet<WorkshopPricing> WorkshopPricings { get; set; }
    public DbSet<WorkshopMedia> WorkshopMedia { get; set; }
    public DbSet<WorkshopSchedule> WorkshopSchedules { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<WorkshopReview> WorkshopReviews { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        builder.Entity<ApplicationUser>().ToTable("Users");

        // Provider Slug unique constraint
        builder.Entity<Provider>()
            .HasIndex(p => p.Slug)
            .IsUnique();

        // Workshop Category
        builder.Entity<WorkshopCategory>()
            .HasIndex(c => c.Name)
            .IsUnique();

        // Workshop - Provider relationship
        builder.Entity<Workshop>()
            .HasOne(w => w.Provider)
            .WithMany()
            .HasForeignKey(w => w.ProviderId)
            .OnDelete(DeleteBehavior.Restrict); 

        // Workshop - Venue relationship
        builder.Entity<Workshop>()
            .HasOne(w => w.Venue)
            .WithMany(v => v.Workshops)
            .HasForeignKey(w => w.VenueId)
            .OnDelete(DeleteBehavior.SetNull); 


        // Workshop - Pricing (1:1)
        builder.Entity<WorkshopPricing>()
            .HasOne(p => p.Workshop)
            .WithOne(w => w.Pricing)
            .HasForeignKey<WorkshopPricing>(p => p.WorkshopId)
            .OnDelete(DeleteBehavior.Cascade); 

        // Workshop - Media (1:Many)
        builder.Entity<WorkshopMedia>()
            .HasOne(m => m.Workshop)
            .WithMany(w => w.Media)
            .HasForeignKey(m => m.WorkshopId)
            .OnDelete(DeleteBehavior.Cascade); 

        // Workshop - Schedule (1:Many)
        builder.Entity<WorkshopSchedule>()
            .HasOne(s => s.Workshop)
            .WithMany(w => w.Schedules)
            .HasForeignKey(s => s.WorkshopId)
            .OnDelete(DeleteBehavior.Cascade); 

        // Booking - User relationship
        builder.Entity<Booking>()
            .HasOne(b => b.User)
            .WithMany()
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict); 

        // Booking - WorkshopSchedule relationship
        builder.Entity<Booking>()
            .HasOne(b => b.WorkshopSchedule)
            .WithMany(s => s.Bookings)
            .HasForeignKey(b => b.WorkshopScheduleId)
            .OnDelete(DeleteBehavior.Restrict); 

        // Unique confirmation code
        builder.Entity<Booking>()
            .HasIndex(b => b.ConfirmationCode)
            .IsUnique();

        // Review - Workshop relationship
        builder.Entity<WorkshopReview>()
            .HasOne(r => r.Workshop)
            .WithMany(w => w.Reviews)
            .HasForeignKey(r => r.WorkshopId)
            .OnDelete(DeleteBehavior.Cascade); 
        // Review - User relationship
        builder.Entity<WorkshopReview>()
            .HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict); 

        // Review - Booking relationship (ensures only attendees can review)
        builder.Entity<WorkshopReview>()
            .HasOne(r => r.Booking)
            .WithOne(b => b.Review)
            .HasForeignKey<WorkshopReview>(r => r.BookingId)
            .OnDelete(DeleteBehavior.Restrict);

        // Ensure one review per booking
        builder.Entity<WorkshopReview>()
            .HasIndex(r => r.BookingId)
            .IsUnique();

        // Indexes for performance
        builder.Entity<Workshop>()
            .HasIndex(w => w.Status);


        builder.Entity<WorkshopSchedule>()
            .HasIndex(s => s.StartDateTime);

        builder.Entity<Booking>()
            .HasIndex(b => b.UserId);

        builder.Entity<Booking>()
            .HasIndex(b => new { b.BookingStatus, b.PaymentStatus });

        builder.Entity<Provider>()
            .Property(p => p.Latitude)
            .HasPrecision(18, 10);
        builder.Entity<Provider>()
            .Property(p => p.Longitude)
            .HasPrecision(18, 10);

        builder.Entity<Venue>()
            .Property(v => v.Latitude)
            .HasPrecision(18, 10);
        builder.Entity<Venue>()
            .Property(v => v.Longitude)
            .HasPrecision(18, 10);

        builder.Entity<Workshop>()
            .Property(w => w.Latitude)
            .HasPrecision(18, 10);
        builder.Entity<Workshop>()
            .Property(w => w.Longitude)
            .HasPrecision(18, 10);
    }
}
