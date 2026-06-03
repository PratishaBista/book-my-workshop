// application db context is the main database configuration class
// inherits from identitydbcontext to integrate asp.net core identity with our custom user entity
// configures all entity relationships, indexes, and constraints for the workshop booking platform

using API.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // core business entities
    public DbSet<Provider> Providers { get; set; }
    public DbSet<Venue> Venues { get; set; }

    // workshop management entities
    public DbSet<WorkshopCategory> WorkshopCategories { get; set; }
    public DbSet<Workshop> Workshops { get; set; }
    public DbSet<WorkshopPricing> WorkshopPricings { get; set; }
    public DbSet<WorkshopMedia> WorkshopMedia { get; set; }
    public DbSet<WorkshopSchedule> WorkshopSchedules { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<WorkshopReview> WorkshopReviews { get; set; }
    public DbSet<WorkshopModification> WorkshopModifications { get; set; }

    // user preferences and settings
    public DbSet<UserPreference> UserPreferences { get; set; }
    public DbSet<PlatformSettings> PlatformSettings { get; set; }

    // communication and content
    public DbSet<NewsletterSubscription> NewsletterSubscriptions { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<JournalArticle> JournalArticles { get; set; }
    public DbSet<ContactMessage> ContactMessages { get; set; }

    // financial entities (gift cards and wallet)
    public DbSet<GiftCard> GiftCards { get; set; }
    public DbSet<Wallet> Wallets { get; set; }
    public DbSet<WalletTransaction> WalletTransactions { get; set; }

    // audit and logging
    public DbSet<SystemLog> SystemLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // call base to configure identity tables (users, roles, etc.)
        base.OnModelCreating(builder);

        // map identity user table to custom name (optional, keeps naming consistent)
        builder.Entity<ApplicationUser>().ToTable("Users");

        // provider unique slug constraint (for seo-friendly urls like /providers/studio-name)
        builder.Entity<Provider>()
            .HasIndex(p => p.Slug)
            .IsUnique();

        // category name must be unique to avoid duplicates
        builder.Entity<WorkshopCategory>()
            .HasIndex(c => c.Name)
            .IsUnique();

        // journal article slug must be unique for seo urls
        builder.Entity<JournalArticle>()
            .HasIndex(j => j.Slug)
            .IsUnique();

        // workshop - provider relationship: restrict delete to prevent orphaned workshops
        // if a provider is deleted, their workshops remain but become orphaned (manual cleanup needed)
        builder.Entity<Workshop>()
            .HasOne(w => w.Provider)
            .WithMany()
            .HasForeignKey(w => w.ProviderId)
            .OnDelete(DeleteBehavior.Restrict);

        // workshop - venue relationship: set null if venue deleted
        // allows workshop to remain but location info becomes incomplete
        builder.Entity<Workshop>()
            .HasOne(w => w.Venue)
            .WithMany(v => v.Workshops)
            .HasForeignKey(w => w.VenueId)
            .OnDelete(DeleteBehavior.SetNull);


        // workshop - pricing: one-to-one relationship with cascade delete
        // when workshop is deleted, its pricing record is also removed
        builder.Entity<WorkshopPricing>()
            .HasOne(p => p.Workshop)
            .WithOne(w => w.Pricing)
            .HasForeignKey<WorkshopPricing>(p => p.WorkshopId)
            .OnDelete(DeleteBehavior.Cascade);

        // workshop - media: one-to-many with cascade delete
        // when workshop is deleted, all associated media records are removed
        builder.Entity<WorkshopMedia>()
            .HasOne(m => m.Workshop)
            .WithMany(w => w.Media)
            .HasForeignKey(m => m.WorkshopId)
            .OnDelete(DeleteBehavior.Cascade);

        // workshop - schedule: one-to-many with cascade delete
        builder.Entity<WorkshopSchedule>()
            .HasOne(s => s.Workshop)
            .WithMany(w => w.Schedules)
            .HasForeignKey(s => s.WorkshopId)
            .OnDelete(DeleteBehavior.Cascade);

        // booking - user: restrict delete to preserve booking history
        // prevents accidental deletion of users with bookings
        builder.Entity<Booking>()
            .HasOne(b => b.User)
            .WithMany()
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // booking - schedule: restrict delete to preserve booking integrity
        // prevents deletion of schedules that have associated bookings
        builder.Entity<Booking>()
            .HasOne(b => b.WorkshopSchedule)
            .WithMany(s => s.Bookings)
            .HasForeignKey(b => b.WorkshopScheduleId)
            .OnDelete(DeleteBehavior.Restrict);

        // each booking gets a unique confirmation code for qr scanning and customer support
        builder.Entity<Booking>()
            .HasIndex(b => b.ConfirmationCode)
            .IsUnique();

        // review - workshop: cascade delete removes reviews when workshop is deleted
        builder.Entity<WorkshopReview>()
            .HasOne(r => r.Workshop)
            .WithMany(w => w.Reviews)
            .HasForeignKey(r => r.WorkshopId)
            .OnDelete(DeleteBehavior.Cascade);

        // review - user: restrict delete to keep reviews even if user is deleted (anonymized)
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

        // Workshop - Modification (1:Many)
        builder.Entity<WorkshopModification>()
            .HasOne(m => m.Workshop)
            .WithMany()
            .HasForeignKey(m => m.WorkshopId)
            .OnDelete(DeleteBehavior.Cascade);

        // performance indexes for frequently queried fields
        builder.Entity<Workshop>()
            .HasIndex(w => w.Status);  // filtering by published/draft/pending


        builder.Entity<WorkshopSchedule>()
            .HasIndex(s => s.StartDateTime); // date range queries

        builder.Entity<Booking>()
            .HasIndex(b => b.UserId); // user's booking history

        builder.Entity<Booking>()
            .HasIndex(b => new { b.BookingStatus, b.PaymentStatus }); // dashboard filters

        // precision for geo-coordinates (latitude/longitude)
        // hasprecision(18,10) means up to 8 decimal places (centimeter accuracy) which is sufficient for gps
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

        // user preferences: many-to-many between users and categories
        builder.Entity<UserPreference>()
            .HasOne(up => up.User)
            .WithMany(u => u.Preferences)
            .HasForeignKey(up => up.UserId)
            .OnDelete(DeleteBehavior.Cascade); // delete preferences when user is deleted

        builder.Entity<UserPreference>()
            .HasOne(up => up.Category)
            .WithMany()
            .HasForeignKey(up => up.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);  // delete preferences when category is deleted

        // prevent duplicate preferences (user can only select a category once)
        builder.Entity<UserPreference>()
            .HasIndex(up => new { up.UserId, up.CategoryId })
            .IsUnique();

        // each email can only subscribe once
        builder.Entity<NewsletterSubscription>()
            .HasIndex(ns => ns.Email)
            .IsUnique();

        // gift card relationships
        builder.Entity<GiftCard>()
            .HasOne(gc => gc.SenderUser)
            .WithMany()
            .HasForeignKey(gc => gc.SenderUserId)
            .OnDelete(DeleteBehavior.Restrict); // keep gift card history even if claimant deleted

        builder.Entity<GiftCard>()
            .HasOne(gc => gc.ClaimedByUser)
            .WithMany()
            .HasForeignKey(gc => gc.ClaimedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // each user has exactly one wallet (one-to-one mapped via userid)
        builder.Entity<Wallet>()
            .HasOne(w => w.User)
            .WithMany()
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.Cascade); // delete wallet when user is deleted

        // wallet transactions history
        builder.Entity<WalletTransaction>()
            .HasOne(wt => wt.Wallet)
            .WithMany()
            .HasForeignKey(wt => wt.WalletId)
            .OnDelete(DeleteBehavior.Cascade); // delete transactions when wallet is deleted

        // optional links to gift cards and bookings for audit trail
        builder.Entity<WalletTransaction>()
            .HasOne(wt => wt.GiftCard)
            .WithMany()
            .HasForeignKey(wt => wt.GiftCardId)
            .OnDelete(DeleteBehavior.SetNull); // preserve transaction record even if gift card deleted

        builder.Entity<WalletTransaction>()
            .HasOne(wt => wt.Booking)
            .WithMany()
            .HasForeignKey(wt => wt.BookingId)
            .OnDelete(DeleteBehavior.SetNull); // preserve transaction record even if booking deleted
    }
}
