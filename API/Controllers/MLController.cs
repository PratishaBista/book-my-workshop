using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;

namespace API.Controllers;

[ApiController]
[Route("api/ml")]
[Authorize]
public class MLController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly string _pythonApiUrl;

    public MLController(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _pythonApiUrl = _configuration["MLSettings:PythonApiUrl"] ?? "http://localhost:8000";
    }

    [HttpPost("suggest-category")]
    public async Task<IActionResult> SuggestCategory([FromBody] MLRequest request)
    {
        try
        {
            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_pythonApiUrl}/predict", content);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                return Ok(result);
            }

            return StatusCode((int)response.StatusCode, "Error communication with ML Microservice");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"ML Error: {ex.Message}");
        }
    }
}

public class MLRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
