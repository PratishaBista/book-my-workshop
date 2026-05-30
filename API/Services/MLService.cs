using API.Controllers;
using System.Text.Json;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace API.Services;

public interface IMLService
{
    Task<List<(int Id, double Score)>> PredictSimilaritiesWithScoresAsync(string sourceText, List<(int Id, string Text)> candidates);
    Task<(bool IsOffensive, float OffensiveScore)?> AnalyzeReviewSentimentAsync(string comment);
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

    public async Task<(bool IsOffensive, float OffensiveScore)?> AnalyzeReviewSentimentAsync(string comment)
    {
        try
        {
            var request = new { text = comment };
            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_pythonApiUrl}/api/v1/analyze-review", content);

            if (response.IsSuccessStatusCode)
            {
                var resultJson = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<ReviewSentimentResponse>(resultJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (result != null)
                {
                    return (result.IsOffensive, result.OffensiveScore);
                }
            }
            else
            {
                _logger.LogWarning($"Review sentiment service failed with status: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling review sentiment microservice");
        }

        return null;
    }
}

public class ReviewSentimentResponse
{
    public bool IsOffensive { get; set; }
    public float OffensiveScore { get; set; }
    public string Label { get; set; } = string.Empty;
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

