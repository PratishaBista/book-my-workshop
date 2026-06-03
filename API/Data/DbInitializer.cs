// db initializer seeds initial data into the database when the application starts
// creates roles, default admin/superadmin accounts, and workshop categories
// this class is typically called from program.cs during app startup

using API.Entities;
using API.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public static class DbInitializer
{
    // entry point for seeding (call this from program.cs after building the app)
    // requires usermanager and rolemanager from identity, plus db context for custom entities
    public static async Task SeedAsync(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        ApplicationDbContext context)
    {
        // 1. Seed all four Roles
        await SeedRoleAsync(roleManager, UserRoles.Admin);
        await SeedRoleAsync(roleManager, UserRoles.User);
        await SeedRoleAsync(roleManager, UserRoles.Provider);
        await SeedRoleAsync(roleManager, UserRoles.SuperAdmin);

        // 2. Seed Admin User (general platform admin)
        var adminEmail = "admin@bookmyworkshop.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "Pratisha Bista",
                EmailConfirmed = true // admin doesn't need email verification
            };

            var result = await userManager.CreateAsync(admin, "Admin@123"); // default password (should be changed on first login)
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, UserRoles.Admin);
            }
        }

        // 2.1 Seed SuperAdmin User (system owner with full financial and system access)
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

            var result = await userManager.CreateAsync(superAdmin, "SuperAdmin@123"); // default password - must be changed
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(superAdmin, UserRoles.SuperAdmin);
            }
        }

        // 3. Seed Workshop Categories
        await SeedWorkshopCategoriesAsync(context);
    }

    // helper method to create a role if it doesn't exist
    private static async Task SeedRoleAsync(RoleManager<IdentityRole> roleManager, string roleName)
    {
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            await roleManager.CreateAsync(new IdentityRole(roleName));
        }
    }

    // seeds ten default workshop categories covering common creative workshop types
    // categories include art, cooking, wellness, tech, photography, music, business, language, diy, and kids
    private static async Task SeedWorkshopCategoriesAsync(ApplicationDbContext context)
    {
        // check if categories already exist (prevents duplicate seeding on subsequent app starts)
        if (context.WorkshopCategories.Any())
        {
            return; // categories already seeded, skip
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

