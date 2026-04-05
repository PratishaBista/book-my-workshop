using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace API.Services;

public interface IStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, bool isPrivate = false);
    Task<string> GetPresignedUrlAsync(string key, int expirationMinutes = 10);
    Task DeleteFileAsync(string key);
}

public class S3StorageService : IStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly string? _serviceUrl;

    public S3StorageService(IAmazonS3 s3Client, IConfiguration configuration)
    {
        _s3Client = s3Client;
        _bucketName = configuration["AWS:BucketName"] ?? "bookmyworkshop-vault";
        _serviceUrl = configuration["AWS:ServiceUrl"];
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, bool isPrivate = false)
    {
        var key = $"{Guid.NewGuid()}_{fileName}";
        
        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = fileStream,
            ContentType = contentType,
            // CannedACL.Private ensures no one can see it without a signed URL
            CannedACL = isPrivate ? S3CannedACL.Private : S3CannedACL.PublicRead
        };

        await _s3Client.PutObjectAsync(request);

       // (MinIO) or real S3
        if (!string.IsNullOrEmpty(_serviceUrl))
        {
            return $"{_serviceUrl}/{_bucketName}/{key}";
        }
        
        return key; 
    }

    public async Task<string> GetPresignedUrlAsync(string key, int expirationMinutes = 10)
    {
        if (key.StartsWith("http"))
        {
            key = key.Split('/').Last();
        }

        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Expires = DateTime.UtcNow.AddMinutes(expirationMinutes)
        };

        return await Task.Run(() => _s3Client.GetPreSignedURL(request));
    }

    public async Task DeleteFileAsync(string key)
    {
         if (key.StartsWith("http"))
        {
            key = key.Split('/').Last();
        }

        var request = new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = key
        };

        await _s3Client.DeleteObjectAsync(request);
    }
}
