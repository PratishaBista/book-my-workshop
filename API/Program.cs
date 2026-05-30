using API.Data;
using API.Entities;
using API.Repositories;
using API.Services;
using API.Enums;
using Amazon.S3;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddSignalR();
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program).Assembly);

// DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.User.RequireUniqueEmail = true;
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddRoles<IdentityRole>()
.AddDefaultTokenProviders();

// Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SuperAdminOnly", policy => 
        policy.RequireRole(UserRoles.SuperAdmin));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.SetIsOriginAllowed(origin => 
              {
                  var host = new Uri(origin).Host;
                  return host == "localhost" || host == "127.0.0.1";
              })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .SetPreflightMaxAge(TimeSpan.FromMinutes(10))
              .AllowCredentials();
    });
});

// Services
builder.Services.AddScoped<TokenService>();

// Repositories
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IWorkshopRepository, WorkshopRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IScheduleRepository, ScheduleRepository>();

// Business Services
builder.Services.AddScoped<IWorkshopService, WorkshopService>();
builder.Services.AddScoped<IMediaService, MediaService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IPaymentService, EsewaPaymentService>();
builder.Services.AddScoped<StripePaymentService>();
builder.Services.AddScoped<IMLService, MLService>();
builder.Services.AddScoped<IReviewModerationService, ReviewModerationService>();
builder.Services.AddScoped<IBookingTicketService, BookingTicketService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<WorkshopChangeDetector>();
builder.Services.AddScoped<IGiftCardService, GiftCardService>();
builder.Services.AddScoped<ISystemLogService, SystemLogService>();
builder.Services.AddScoped<IReviewSeedService, ReviewSeedService>();
builder.Services.AddScoped<IProviderPublicService, ProviderPublicService>();

// AWS S3 / MinIO Configuration
var s3Config = new AmazonS3Config
{
    RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(builder.Configuration["AWS:Region"]),
    ServiceURL = builder.Configuration["AWS:ServiceUrl"],
    ForcePathStyle = builder.Configuration.GetValue<bool>("AWS:ForcePathStyle")
};

builder.Services.AddSingleton<IAmazonS3>(sp => 
    new AmazonS3Client(
        builder.Configuration["AWS:AccessKey"], 
        builder.Configuration["AWS:SecretKey"], 
        s3Config));

builder.Services.AddScoped<IStorageService, S3StorageService>();

builder.Services.AddHostedService<AccountCleanupService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API V1");
        c.RoutePrefix = string.Empty;
    });
}

// Enable CORS
app.UseCors("AllowReactApp");

// Global Exception Handler
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[GLOBAL ERROR]: {ex.Message}");
        Console.WriteLine(ex.StackTrace);

        try
        {
            var logService = context.RequestServices.GetRequiredService<ISystemLogService>();
            await logService.LogErrorAsync("System", ex.Message, ex.StackTrace, context.User?.Identity?.Name);
        }
        catch (Exception logEx)
        {
            Console.WriteLine($"[FAILED TO LOG TO DATABASE]: {logEx.Message}");
        }

        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new { message = "Internal Server Error", detail = ex.Message });
    }
});

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<API.Hubs.NotificationHub>("/hubs/notifications");

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var context = services.GetRequiredService<ApplicationDbContext>();
        
        // Apply migrations automatically
        await context.Database.MigrateAsync();

        var approvedProviders = await context.Providers
            .Where(p => p.Status == ProviderStatus.Approved && !p.IsApproved)
            .ToListAsync();
    
        if (approvedProviders.Any())
        {
            foreach (var p in approvedProviders) p.IsApproved = true;
            await context.SaveChangesAsync();
            Console.WriteLine($"[STARTUP]: Approved {approvedProviders.Count} providers.");
        }

        await DbInitializer.SeedAsync(userManager, roleManager, context);
        Console.WriteLine("[STARTUP]: Database seeding completed.");

        var configuration = services.GetRequiredService<IConfiguration>();
        var seedReviews = configuration.GetValue<bool>("SeedSettings:SeedSampleReviews");
        if (seedReviews)
        {
            var reviewSeeder = services.GetRequiredService<IReviewSeedService>();
            var seedResult = await reviewSeeder.SeedSampleReviewsAsync();
            Console.WriteLine(seedResult.Skipped
                ? $"[STARTUP]: Review seed skipped — {seedResult.Message}"
                : $"[STARTUP]: Review seed — {seedResult.Message}");
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
        Console.WriteLine($"[STARTUP ERROR]: {ex.Message}");
    }
}

app.Run();
