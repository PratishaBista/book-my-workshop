using Microsoft.AspNetCore.Http;

namespace API.Services;

/// <summary>
/// Media service interface for file uploads and management.
/// Handles Cloudinary integration.
/// </summary>
public interface IMediaService
{
    Task<string> UploadImageAsync(IFormFile file, string folder = "workshops");
    Task<string> UploadVideoAsync(IFormFile file, string folder = "workshops");
    Task<bool> DeleteMediaAsync(string publicId);
    Task<(string Url, string PublicId)> UploadMediaAsync(IFormFile file, string folder = "workshops");
}
