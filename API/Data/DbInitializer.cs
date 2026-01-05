using API.Entities;
using API.Enums;
using Microsoft.AspNetCore.Identity;

namespace API.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(
        UserManager<ApplicationUser> userManager, 
        RoleManager<IdentityRole> roleManager,
        ApplicationDbContext context)
    {
        // 1. Seed Roles
        await SeedRoleAsync(roleManager, UserRoles.Admin);
        await SeedRoleAsync(roleManager, UserRoles.User);
        await SeedRoleAsync(roleManager, UserRoles.Provider);

        // 2. Seed Admin User
        var adminEmail = "admin@bookmyworkshop.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "Pratisha Bista",
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(admin, "Admin@123"); 
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, UserRoles.Admin);
            }
        }

        // 3. Seed Workshop Categories
        await SeedWorkshopCategoriesAsync(context);
    }

    private static async Task SeedRoleAsync(RoleManager<IdentityRole> roleManager, string roleName)
    {
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            await roleManager.CreateAsync(new IdentityRole(roleName));
        }
    }

    private static async Task SeedWorkshopCategoriesAsync(ApplicationDbContext context)
    {
        // Check if categories already exist
        if (context.WorkshopCategories.Any())
        {
            return; // Categories already seeded
        }

        var categories = new List<WorkshopCategory>
        {
            new WorkshopCategory
            {
                Name = "Art & Craft",
                Description = "Painting, drawing, pottery, sculpture, and other artistic workshops",
                DisplayOrder = 1,
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "Cooking & Baking",
                Description = "Culinary workshops including cooking, baking, and food preparation",
                DisplayOrder = 2,
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "Wellness & Fitness",
                Description = "Yoga, meditation, fitness, and wellness workshops",
                DisplayOrder = 3,
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "Technology & Programming",
                Description = "Coding, web development, app development, and tech workshops",
                DisplayOrder = 4,
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "Photography & Videography",
                Description = "Photography, videography, and visual media workshops",
                DisplayOrder = 5,
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "Music & Dance",
                Description = "Musical instruments, singing, dancing, and performance workshops",
                DisplayOrder = 6,
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "Business & Entrepreneurship",
                Description = "Business skills, entrepreneurship, and professional development",
                DisplayOrder = 7,
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "Language Learning",
                Description = "Foreign language learning and communication skills",
                DisplayOrder = 8,
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "DIY & Home Improvement",
                Description = "Do-it-yourself projects, woodworking, and home improvement",
                DisplayOrder = 9,
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "Kids & Family",
                Description = "Workshops designed specifically for children and families",
                DisplayOrder = 10,
                IsActive = true
            }
        };

        await context.WorkshopCategories.AddRangeAsync(categories);
        await context.SaveChangesAsync();
    }
}

