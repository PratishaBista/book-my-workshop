using API.Controllers;
using System.Text.Json;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace API.Services;

public interface IMLService
{
    Task<(string? Category, double? Confidence, bool? IsConfident)> PredictCategoryAsync(string title, string description);
    Task<List<(int Id, double Score)>> PredictSimilaritiesWithScoresAsync(string sourceText, List<(int Id, string Text)> candidates);
    Task<TrustAnalysisResponse?> VerifyInformationConsistencyAsync(string registrationText, string documentText, string? websiteText = null);
}

public class MLService : IMLService
{
    private readonly HttpClient _httpClient;
    private readonly string _pythonApiUrl;
    private readonly ILogger<MLService> _logger;

    public MLService(HttpClient httpClient, IConfiguration configuration, ILogger<MLService> logger)
    {
        _httpClient = httpClient;
        _pythonApiUrl = configuration["MLSettings:PythonApiUrl"] ?? "http://localhost:8000";
        _logger = logger;
    }

    public async Task<(string? Category, double? Confidence, bool? IsConfident)> PredictCategoryAsync(string title, string description)
    {
        try
        {
            var request = new { title = title, description = description };
            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_pythonApiUrl}/predict", content);

            if (response.IsSuccessStatusCode)
            {
                var resultJson = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<MLResponse>(resultJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                
                if (result != null)
                {
                    return (result.Suggested_Category, result.Confidence_Score, result.Is_Confident);
                }
            }
            else 
            {
                _logger.LogWarning($"ML Service failed with status: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling ML Microservice");
        }

        return (null, null, null);
    }

    public async Task<List<(int Id, double Score)>> PredictSimilaritiesWithScoresAsync(string userInterests, List<(int Id, string Text)> candidates)
    {
        try 
        {
            var request = new 
            { 
                user_interests = userInterests, 
                candidates = candidates.Select(c => new { id = c.Id, text = c.Text }).ToList() 
            };

            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_pythonApiUrl}/api/v1/recommend", content);

            if (response.IsSuccessStatusCode)
            {
                var resultJson = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<RecommendationResponse>(resultJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                
                if (result != null && result.Recommendations != null)
                {
                    return result.Recommendations.Select(r => (r.Id, r.Score)).ToList();
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling ML Recommendation Microservice");
        }

        return candidates.Select(c => (c.Id, 0.0)).ToList(); 
    }

    public async Task<TrustAnalysisResponse?> VerifyInformationConsistencyAsync(string registrationText, string documentText, string? websiteText = null)
    {
        try
        {
            var request = new 
            { 
                registration_text = registrationText, 
                document_text = documentText,
                website_text = websiteText
            };

            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_pythonApiUrl}/api/v1/verify-consistency", content);

            if (response.IsSuccessStatusCode)
            {
                var resultJson = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<TrustAnalysisResponse>(resultJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling ML Verification Microservice");
        }

        return null;
    }
}

public class TrustAnalysisResponse
{
    public float OverallScore { get; set; }
    public string Summary { get; set; } = string.Empty;
    public List<TrustCheckResult> Checks { get; set; } = new();
}

public class TrustCheckResult
{
    public string Name { get; set; } = string.Empty;
    public float Score { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool Passed { get; set; }
}

public class RecommendationResponse
{
    public List<RankedItemResponse> Recommendations { get; set; } = new();
}

public class RankedItemResponse
{
    public int Id { get; set; }
    public double Score { get; set; }
}

public class MLResponse
{
    public string Suggested_Category { get; set; } = string.Empty;
    public double Confidence_Score { get; set; }
    public bool Is_Confident { get; set; }
}
