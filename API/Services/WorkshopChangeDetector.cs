using API.DTOs.Requests;
using API.Entities;

namespace API.Services;

/// <summary>
/// Detects changes between original workshop and update request.
/// Classifies changes as major (requiring re-approval) or minor (auto-approved).
/// </summary>
public class WorkshopChangeDetector
{
    private static readonly HashSet<string> MajorFields = new()
    {
        nameof(Workshop.Title),
        nameof(Workshop.Subtitle),
        nameof(Workshop.Tagline),
        nameof(Workshop.Duration),
        nameof(Workshop.MaxCapacity),
        nameof(Workshop.MinCapacity),
        nameof(Workshop.LocationAddress),
        nameof(Workshop.LocationName),
        nameof(Workshop.VenueId),
        nameof(Workshop.WorkshopType),
        "CategoryIds",
        "BasePrice",
        "PricingType"
    };

    public (bool hasMajor, bool hasMinor, List<string> changedFields) DetectChanges(
        Workshop original, 
        UpdateWorkshopRequest updated,
        List<int> newCategoryIds)
    {
        var changedFields = new List<string>();
        bool hasMajor = false;
        bool hasMinor = false;

        // Check Title
        if (original.Title != updated.Title)
        {
            changedFields.Add(nameof(Workshop.Title));
            hasMajor = true;
        }

        // Check Subtitle
        if (original.Subtitle != updated.Subtitle)
        {
            changedFields.Add(nameof(Workshop.Subtitle));
            hasMajor = true;
        }

        // Check Tagline
        if (original.Tagline != updated.Tagline)
        {
            changedFields.Add(nameof(Workshop.Tagline));
            hasMajor = true;
        }

        // Check Description
        if (original.Description != updated.Description)
        {
            changedFields.Add(nameof(Workshop.Description));
            hasMinor = true;
        }

        // Check Duration
        if (original.Duration != updated.Duration)
        {
            changedFields.Add(nameof(Workshop.Duration));
            hasMajor = true;
        }

        // Check MaxCapacity
        if (original.MaxCapacity != updated.MaxCapacity)
        {
            changedFields.Add(nameof(Workshop.MaxCapacity));
            hasMajor = true;
        }

        // Check MinCapacity
        if (original.MinCapacity != updated.MinCapacity)
        {
            changedFields.Add(nameof(Workshop.MinCapacity));
            hasMajor = true;
        }

        // Check LocationAddress
        if (original.LocationAddress != updated.LocationAddress)
        {
            changedFields.Add(nameof(Workshop.LocationAddress));
            hasMajor = true;
        }

        // Check LocationName
        if (original.LocationName != updated.LocationName)
        {
            changedFields.Add(nameof(Workshop.LocationName));
            hasMajor = true;
        }

        // Check LocationDetails (minor)
        if (original.LocationDetails != updated.LocationDetails)
        {
            changedFields.Add(nameof(Workshop.LocationDetails));
            hasMinor = true;
        }

        // Check VenueId
        if (original.VenueId != updated.VenueId)
        {
            changedFields.Add(nameof(Workshop.VenueId));
            hasMajor = true;
        }

        // Check VenueDescription (minor)
        if (original.VenueDescription != updated.VenueDescription)
        {
            changedFields.Add(nameof(Workshop.VenueDescription));
            hasMinor = true;
        }

        // Check WorkshopType
        if (original.WorkshopType != updated.WorkshopType)
        {
            changedFields.Add(nameof(Workshop.WorkshopType));
            hasMajor = true;
        }

        // Check WhatToBring (minor)
        if (original.WhatToBring != updated.WhatToBring)
        {
            changedFields.Add(nameof(Workshop.WhatToBring));
            hasMinor = true;
        }

        // Check SkillLevel (minor)
        if (original.SkillLevel != updated.SkillLevel)
        {
            changedFields.Add(nameof(Workshop.SkillLevel));
            hasMinor = true;
        }

        // Check Suitability (minor)
        if (original.Suitability != updated.Suitability)
        {
            changedFields.Add(nameof(Workshop.Suitability));
            hasMinor = true;
        }

        // Check CancellationPolicy (minor)
        if (original.CancellationPolicy != updated.CancellationPolicy)
        {
            changedFields.Add(nameof(Workshop.CancellationPolicy));
            hasMinor = true;
        }

        // Check BookingCutoffHours (minor)
        if (original.BookingCutoffHours != updated.BookingCutoffHours)
        {
            changedFields.Add(nameof(Workshop.BookingCutoffHours));
            hasMinor = true;
        }

        // Check SafetyRequirements (minor)
        if (original.SafetyRequirements != updated.SafetyRequirements)
        {
            changedFields.Add(nameof(Workshop.SafetyRequirements));
            hasMinor = true;
        }

        // Check WhatsIncluded (minor)
        if (original.WhatsIncluded != updated.WhatsIncluded)
        {
            changedFields.Add(nameof(Workshop.WhatsIncluded));
            hasMinor = true;
        }

        // Check Categories (major)
        var originalCategoryIds = original.Categories.Select(c => c.Id).OrderBy(id => id).ToList();
        var updatedCategoryIds = newCategoryIds.OrderBy(id => id).ToList();
        if (!originalCategoryIds.SequenceEqual(updatedCategoryIds))
        {
            changedFields.Add("CategoryIds");
            hasMajor = true;
        }

        // Check Pricing (major)
        if (original.Pricing != null)
        {
            if (original.Pricing.BasePrice != updated.BasePrice)
            {
                changedFields.Add("BasePrice");
                hasMajor = true;
            }

            if (original.Pricing.PricingType != updated.PricingType)
            {
                changedFields.Add("PricingType");
                hasMajor = true;
            }
        }

        // Check Media (minor)
        // Simple count check first
        if (original.Media.Count != updated.Media.Count)
        {
            changedFields.Add("Media");
            hasMinor = true;
        }
        else 
        {
            // If counts match, check if content changed
            // This is a simplified check - rigorous check would compare sets of URLs/PublicIds
            var originalUrls = original.Media.Select(m => m.Url).OrderBy(u => u).ToList();
            var newUrls = updated.Media.Select(m => m.Url).OrderBy(u => u).ToList();
            
            if (!originalUrls.SequenceEqual(newUrls))
            {
                changedFields.Add("Media");
                hasMinor = true;
            }
            else
            {
                // URLs match, check if Primary Image changed
                var originalPrimary = original.Media.FirstOrDefault(m => m.IsPrimary)?.Url;
                var newPrimary = updated.Media.FirstOrDefault(m => m.IsPrimary)?.Url;
                if (originalPrimary != newPrimary)
                {
                    changedFields.Add("Media.IsPrimary");
                    hasMinor = true;
                }
            }
        }

        return (hasMajor, hasMinor, changedFields);
    }
}
