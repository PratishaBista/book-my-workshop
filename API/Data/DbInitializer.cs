using API.Entities;
using API.Enums;
using Microsoft.AspNetCore.Identity;

namespace API.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
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
                FullName = "System Administrator",
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(admin, "Admin@123"); // Strong password
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, UserRoles.Admin);
            }
        }
    }

    private static async Task SeedRoleAsync(RoleManager<IdentityRole> roleManager, string roleName)
    {
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            await roleManager.CreateAsync(new IdentityRole(roleName));
        }
    }
}
