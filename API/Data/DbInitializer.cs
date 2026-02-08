using API.Entities;
using API.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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
        await SeedRoleAsync(roleManager, UserRoles.SuperAdmin);

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

        // 2.1 Seed SuperAdmin User
        var superAdminEmail = "velvetscarfsoda@gmail.com";
        var superAdminUser = await userManager.FindByEmailAsync(superAdminEmail);

        if (superAdminUser == null)
        {
            var superAdmin = new ApplicationUser
            {
                UserName = superAdminEmail,
                Email = superAdminEmail,
                FullName = "System Owner",
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(superAdmin, "SuperAdmin@123"); 
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(superAdmin, UserRoles.SuperAdmin);
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
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "Cooking & Baking",
                Description = "Culinary workshops including cooking, baking, and food preparation",
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "Wellness & Fitness",
                Description = "Yoga, meditation, fitness, and wellness workshops",
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "Technology & Programming",
                Description = "Coding, web development, app development, and tech workshops",
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "Photography & Videography",
                Description = "Photography, videography, and visual media workshops",
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "Music & Dance",
                Description = "Musical instruments, singing, dancing, and performance workshops",
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "Business & Entrepreneurship",
                Description = "Business skills, entrepreneurship, and professional development",
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "Language Learning",
                Description = "Foreign language learning and communication skills",
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "DIY & Home Improvement",
                Description = "Do-it-yourself projects, woodworking, and home improvement",
                IsActive = true
            },
            new WorkshopCategory
            {
                Name = "Kids & Family",
                Description = "Workshops designed specifically for children and families",
                IsActive = true
            }
        };

        await context.WorkshopCategories.AddRangeAsync(categories);
        await context.SaveChangesAsync();
    }
}

