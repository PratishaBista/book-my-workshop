using API.Data;
using API.Entities;
using API.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public interface IReviewSeedService
{
    Task<ReviewSeedResult> SeedSampleReviewsAsync(bool force = false, CancellationToken cancellationToken = default);
}

public class ReviewSeedResult
{
    public bool Skipped { get; set; }
    public string Message { get; set; } = string.Empty;
    public int ReviewsCreated { get; set; }
    public int FlaggedCount { get; set; }
    public int MlUnavailableCount { get; set; }
    public List<ReviewSeedItemResult> Items { get; set; } = new();
}

public class ReviewSeedItemResult
{
    public int ReviewId { get; set; }
    public string CommentPreview { get; set; } = string.Empty;
    public bool IsFlagged { get; set; }
    public float OffensiveScore { get; set; }
    public string Source { get; set; } = string.Empty;
}

/// <summary>
/// Seeds workshop reviews and runs the ML profanity detector on each comment.
/// Negative (non-profane) reviews are included to verify the model does not over-flag criticism.
/// Creates eligible bookings (paid, checked-in, completed session) when needed.
/// </summary>
public class ReviewSeedService : IReviewSeedService
{
    private const string SeedBookingCodePrefix = "SEED-REV-";

    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IReviewModerationService _reviewModeration;
    private readonly ILogger<ReviewSeedService> _logger;

    // Profane samples are for local ML moderation testing only (profanity-trained model).
    private static readonly ReviewSample[] Samples =
    {
        new(5, "Absolutely loved this session! The instructor explained every step clearly and I left with a finished piece I'm proud to display."),
        new(4, "Great atmosphere and materials were well prepared. Would happily book again with friends."),
        new(5, "One of the best creative workshops I've attended in Kathmandu. Friendly group and excellent hands-on guidance."),
        new(3, "Decent experience overall. A little crowded near the end but I still picked up useful techniques."),
        // Negative but profanity-free — should stay published
        new(2, "Honestly disappointing. Started late, felt rushed, and I did not learn what was advertised. Would not recommend."),
        new(1, "Overpriced for what you get. Poor pacing and cheap materials. I left early and still regret signing up."),
        // Profanity — should be flagged and hidden from public / admin moderation queue
        new(1, "What the fuck was that? Total shit show from start to finish. Never again."),
        new(1, "This class was bullshit. Don't bother, complete fucking waste of money."),
        new(1, "Fuck this place. Shit instructor, shit materials, never coming back."),
    };

    private sealed record ReviewSample(int Rating, string Comment);

    private sealed record SeedCustomer(string FullName, string Email);

    private static readonly SeedCustomer[] SeedCustomers =
    {
        new("Alex Carter", "review.seed1@bookmyworkshop.local"),
        new("Sam Rivera", "review.seed2@bookmyworkshop.local"),
        new("Jordan Lee", "review.seed3@bookmyworkshop.local"),
        new("Morgan Blake", "review.seed4@bookmyworkshop.local"),
        new("Casey Quinn", "review.seed5@bookmyworkshop.local"),
        new("Riley Brooks", "review.seed6@bookmyworkshop.local"),
        new("Taylor Reed", "review.seed7@bookmyworkshop.local"),
        new("Jamie Fox", "review.seed8@bookmyworkshop.local"),
        new("Drew Hayes", "review.seed9@bookmyworkshop.local"),
    };

    public ReviewSeedService(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        IReviewModerationService reviewModeration,
        ILogger<ReviewSeedService> logger)
    {
        _context = context;
        _userManager = userManager;
        _reviewModeration = reviewModeration;
        _logger = logger;
    }

    public async Task<ReviewSeedResult> SeedSampleReviewsAsync(bool force = false, CancellationToken cancellationToken = default)
    {
        var result = new ReviewSeedResult();

        if (!force && await _context.Bookings.AnyAsync(
                b => b.ConfirmationCode.StartsWith(SeedBookingCodePrefix), cancellationToken))
        {
            result.Skipped = true;
            result.Message = "Sample reviews already seeded. Pass force=true to seed again.";
            return result;
        }

        if (force)
        {
            await RemovePreviousSeedDataAsync(cancellationToken);
        }

        var workshop = await _context.Workshops
            .Include(w => w.Pricing)
            .Include(w => w.Schedules)
            .Where(w => w.Status == WorkshopStatus.Published && w.IsActive)
            .OrderBy(w => w.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (workshop == null)
        {
            result.Message = "No published workshop found. Publish at least one workshop before seeding reviews.";
            return result;
        }

        var schedule = await EnsureCompletedScheduleAsync(workshop, cancellationToken);
        var price = workshop.Pricing?.BasePrice ?? 1500m;

        var eligibleBookings = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.WorkshopSchedule)
            .Where(b => b.WorkshopSchedule.WorkshopId == workshop.Id
                        && b.BookingStatus == BookingStatus.Confirmed
                        && b.PaymentStatus == PaymentStatus.Paid
                        && b.AttendanceStatus == AttendanceStatus.CheckedIn
                        && b.WorkshopSchedule.Status == ScheduleStatus.Completed
                        && !_context.WorkshopReviews.Any(r => r.BookingId == b.Id))
            .Take(Samples.Length)
            .ToListAsync(cancellationToken);

        var bookingSlots = new List<(Booking Booking, ReviewSample Sample)>();

        for (var i = 0; i < Samples.Length; i++)
        {
            var sample = Samples[i];
            if (i < eligibleBookings.Count)
            {
                bookingSlots.Add((eligibleBookings[i], sample));
                continue;
            }

            var customerIndex = i - eligibleBookings.Count;
            if (customerIndex >= SeedCustomers.Length)
                break;

            var customer = SeedCustomers[customerIndex];
            var user = await EnsureSeedCustomerAsync(customer, cancellationToken);
            var booking = await CreateEligibleSeedBookingAsync(
                user.Id,
                schedule,
                price,
                customerIndex,
                cancellationToken);
            bookingSlots.Add((booking, sample));
        }

        foreach (var (booking, sample) in bookingSlots)
        {
            var (isFlagged, offensiveScore, source) = await _reviewModeration.AnalyzeAsync(sample.Comment);

            if (source == "none")
            {
                result.MlUnavailableCount++;
                _logger.LogWarning(
                    "No profanity signal for seed review (ML down and lexicon miss). Text: {Preview}",
                    sample.Comment.Length > 40 ? sample.Comment[..40] + "…" : sample.Comment);
            }
            else if (source.StartsWith("lexicon", StringComparison.Ordinal))
            {
                _logger.LogInformation("Seed review flagged via {Source}", source);
            }

            var review = new WorkshopReview
            {
                WorkshopId = workshop.Id,
                UserId = booking.UserId,
                BookingId = booking.Id,
                Rating = sample.Rating,
                Comment = sample.Comment,
                IsFlagged = isFlagged,
                OffensiveScore = offensiveScore,
                CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 14)),
            };

            _context.WorkshopReviews.Add(review);
            await _context.SaveChangesAsync(cancellationToken);

            result.ReviewsCreated++;
            if (isFlagged) result.FlaggedCount++;

            result.Items.Add(new ReviewSeedItemResult
            {
                ReviewId = review.Id,
                CommentPreview = sample.Comment.Length > 60 ? sample.Comment[..60] + "…" : sample.Comment,
                IsFlagged = isFlagged,
                OffensiveScore = offensiveScore,
                Source = booking.ConfirmationCode.StartsWith(SeedBookingCodePrefix) ? "seed-booking" : "existing-booking",
            });
        }

        result.Message = result.ReviewsCreated == 0
            ? "No reviews were created."
            : $"Created {result.ReviewsCreated} review(s) on workshop \"{workshop.Title}\" ({result.FlaggedCount} flagged by ML).";

        _logger.LogInformation("Review seed completed: {Message}", result.Message);
        return result;
    }

    private async Task RemovePreviousSeedDataAsync(CancellationToken cancellationToken)
    {
        var seedBookingIds = await _context.Bookings
            .Where(b => b.ConfirmationCode.StartsWith(SeedBookingCodePrefix))
            .Select(b => b.Id)
            .ToListAsync(cancellationToken);

        if (seedBookingIds.Count == 0)
            return;

        var seedReviews = await _context.WorkshopReviews
            .Where(r => seedBookingIds.Contains(r.BookingId))
            .ToListAsync(cancellationToken);

        _context.WorkshopReviews.RemoveRange(seedReviews);
        var seedBookings = await _context.Bookings
            .Where(b => seedBookingIds.Contains(b.Id))
            .ToListAsync(cancellationToken);
        _context.Bookings.RemoveRange(seedBookings);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<WorkshopSchedule> EnsureCompletedScheduleAsync(Workshop workshop, CancellationToken cancellationToken)
    {
        var schedule = workshop.Schedules
            .OrderByDescending(s => s.Status == ScheduleStatus.Completed)
            .ThenBy(s => s.StartDateTime)
            .FirstOrDefault();

        if (schedule == null)
        {
            schedule = new WorkshopSchedule
            {
                WorkshopId = workshop.Id,
                StartDateTime = DateTime.UtcNow.AddDays(-14),
                EndDateTime = DateTime.UtcNow.AddDays(-14).AddHours(2),
                MaxCapacity = 20,
                AvailableSeats = 12,
                Status = ScheduleStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-30),
            };
            _context.WorkshopSchedules.Add(schedule);
            await _context.SaveChangesAsync(cancellationToken);
            workshop.Schedules.Add(schedule);
            return schedule;
        }

        if (schedule.Status != ScheduleStatus.Completed)
        {
            schedule.Status = ScheduleStatus.Completed;
            if (schedule.StartDateTime > DateTime.UtcNow)
            {
                schedule.StartDateTime = DateTime.UtcNow.AddDays(-7);
                schedule.EndDateTime = DateTime.UtcNow.AddDays(-7).AddHours(2);
            }
            await _context.SaveChangesAsync(cancellationToken);
        }

        return schedule;
    }

    private async Task<ApplicationUser> EnsureSeedCustomerAsync(SeedCustomer customer, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(customer.Email);
        if (user != null)
            return user;

        user = new ApplicationUser
        {
            UserName = customer.Email,
            Email = customer.Email,
            FullName = customer.FullName,
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-2),
        };

        var createResult = await _userManager.CreateAsync(user, "ReviewSeed@123");
        if (!createResult.Succeeded)
        {
            throw new InvalidOperationException(
                $"Failed to create seed user {customer.Email}: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
        }

        await _userManager.AddToRoleAsync(user, UserRoles.User);
        return user;
    }

    private async Task<Booking> CreateEligibleSeedBookingAsync(
        string userId,
        WorkshopSchedule schedule,
        decimal totalAmount,
        int seedIndex,
        CancellationToken cancellationToken)
    {
        var booking = new Booking
        {
            UserId = userId,
            WorkshopScheduleId = schedule.Id,
            NumberOfSeats = 1,
            TotalAmount = totalAmount,
            WalletAmountUsed = 0,
            BookingStatus = BookingStatus.Confirmed,
            PaymentStatus = PaymentStatus.Paid,
            PaymentGateway = "Seed",
            TransactionId = $"seed-txn-{seedIndex + 1}",
            PaymentCompletedAt = DateTime.UtcNow.AddDays(-10),
            ConfirmationCode = $"{SeedBookingCodePrefix}{seedIndex + 1:D3}",
            BookingDate = DateTime.UtcNow.AddDays(-12),
            AttendanceStatus = AttendanceStatus.CheckedIn,
            CheckedInAt = DateTime.UtcNow.AddDays(-8),
            PlatformFee = Math.Round(totalAmount * 0.1m, 2),
            VatOnCommission = 0,
            HostEarnings = Math.Round(totalAmount * 0.9m, 2),
            PayoutStatus = PayoutStatus.Escrow,
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync(cancellationToken);
        return booking;
    }
}
