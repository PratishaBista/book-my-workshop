using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;

namespace API.Services;

/// <summary>
/// Media service implementation using Cloudinary.
/// Handles image and video uploads with validation.
/// </summary>
public class MediaService : IMediaService
{
    private readonly Cloudinary _cloudinary;
    private readonly ILogger<MediaService> _logger;
    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10MB

    private static readonly string[] AllowedImageTypes = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private static readonly string[] AllowedVideoTypes = { ".mp4", ".mov", ".avi", ".webm" };

    public MediaService(IConfiguration configuration, ILogger<MediaService> logger)
    {
        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"];

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
        _logger = logger;
    }

    public async Task<string> UploadImageAsync(IFormFile file, string folder = "workshops")
    {
        ValidateFile(file, AllowedImageTypes);

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, file.OpenReadStream()),
            Folder = folder,
            Transformation = new Transformation().Quality("auto").FetchFormat("auto")
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error != null)
        {
            _logger.LogError($"Cloudinary upload error: {uploadResult.Error.Message}");
            throw new Exception($"Image upload failed: {uploadResult.Error.Message}");
        }

        return uploadResult.SecureUrl.ToString();
    }

    public async Task<string> UploadVideoAsync(IFormFile file, string folder = "workshops")
    {
        ValidateFile(file, AllowedVideoTypes);

        var uploadParams = new VideoUploadParams
        {
            File = new FileDescription(file.FileName, file.OpenReadStream()),
            Folder = folder
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error != null)
        {
            _logger.LogError($"Cloudinary upload error: {uploadResult.Error.Message}");
            throw new Exception($"Video upload failed: {uploadResult.Error.Message}");
        }

        return uploadResult.SecureUrl.ToString();
    }

    public async Task<(string Url, string PublicId)> UploadMediaAsync(IFormFile file, string folder = "workshops")
    {
        var extension = Path.GetExtension(file.FileName).ToLower();
        
        if (AllowedImageTypes.Contains(extension))
        {
            ValidateFile(file, AllowedImageTypes);
            
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, file.OpenReadStream()),
                Folder = folder,
                Transformation = new Transformation().Quality("auto").FetchFormat("auto")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                _logger.LogError($"Cloudinary upload error: {uploadResult.Error.Message}");
                throw new Exception($"Upload failed: {uploadResult.Error.Message}");
            }

            return (uploadResult.SecureUrl.ToString(), uploadResult.PublicId);
        }
        else if (AllowedVideoTypes.Contains(extension))
        {
            ValidateFile(file, AllowedVideoTypes);
            
            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(file.FileName, file.OpenReadStream()),
                Folder = folder
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                _logger.LogError($"Cloudinary upload error: {uploadResult.Error.Message}");
                throw new Exception($"Upload failed: {uploadResult.Error.Message}");
            }

            return (uploadResult.SecureUrl.ToString(), uploadResult.PublicId);
        }
        else
        {
            throw new ArgumentException($"Unsupported file type: {extension}");
        }
    }

    public async Task<bool> DeleteMediaAsync(string publicId)
    {
        if (string.IsNullOrWhiteSpace(publicId))
        {
            return false;
        }

        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deleteParams);

        return result.Result == "ok";
    }

    private void ValidateFile(IFormFile file, string[] allowedExtensions)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is empty or null.");
        }

        if (file.Length > MaxFileSizeBytes)
        {
            throw new ArgumentException($"File size exceeds maximum allowed size of {MaxFileSizeBytes / (1024 * 1024)}MB.");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            throw new ArgumentException($"File type '{extension}' is not allowed. Allowed types: {string.Join(", ", allowedExtensions)}");
        }
    }
}
