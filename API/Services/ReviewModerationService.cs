using System.Text.RegularExpressions;

namespace API.Services;

public interface IReviewModerationService
{
  Task<(bool IsFlagged, float OffensiveScore, string Source)> AnalyzeAsync(string comment);
}

/// <summary>
/// Combines ML profanity model + explicit word list so swear words are flagged even when the Python service is down.
/// Negative reviews without profanity should pass through.
/// </summary>
public partial class ReviewModerationService : IReviewModerationService
{
  private readonly IMLService _mlService;
  private readonly ILogger<ReviewModerationService> _logger;

  public ReviewModerationService(IMLService mlService, ILogger<ReviewModerationService> logger)
  {
    _mlService = mlService;
    _logger = logger;
  }

  public async Task<(bool IsFlagged, float OffensiveScore, string Source)> AnalyzeAsync(string comment)
  {
    var text = (comment ?? string.Empty).Trim();
    if (string.IsNullOrEmpty(text))
      return (false, 0f, "empty");

    var (lexiconHit, matchedTerm) = LexiconProfanityDetector.ContainsProfanity(text);
    var lexiconScore = lexiconHit ? 0.95f : 0f;

    float mlScore = 0f;
    var mlFlagged = false;
    var mlAvailable = false;

    var mlResult = await _mlService.AnalyzeReviewSentimentAsync(text);
    if (mlResult != null)
    {
      mlAvailable = true;
      mlFlagged = mlResult.Value.IsOffensive;
      mlScore = mlResult.Value.OffensiveScore;
    }
    else
    {
      _logger.LogWarning(
        "ML profanity service unavailable for review moderation. Using lexicon fallback only. Ensure Python API is running at MLSettings:PythonApiUrl.");
    }

    var isFlagged = lexiconHit || mlFlagged;
    var offensiveScore = Math.Max(lexiconScore, mlScore);

    var source = lexiconHit && mlFlagged
      ? "lexicon+ml"
      : lexiconHit
        ? $"lexicon({matchedTerm})"
        : mlAvailable
          ? "ml"
          : "none";

    return (isFlagged, offensiveScore, source);
  }
}

/// <summary>Fast profanity word / pattern check aligned with training targets.</summary>
public static partial class LexiconProfanityDetector
{
  // Core swear terms — negative but clean reviews must not match these.
  private static readonly string[] ProfaneTerms =
  {
    "fuck", "fucker", "fucking", "fucked", "motherfucker",
    "shit", "shitty", "bullshit", "horseshit", "dipshit",
    "bitch", "bitches", "bastard", "asshole", "arsehole",
    "cunt", "dick", "dickhead", "cock", "pussy",
    "whore", "slut", "wanker", "bollocks",
    "nigger", "nigga", "faggot", "fag", "retard",
  };

  private static readonly HashSet<string> TokenSet = new(ProfaneTerms, StringComparer.OrdinalIgnoreCase);

  [GeneratedRegex(
    @"\b(fuck(?:ing|ed|er|s)?|motherfuck(?:er|ing)|shit(?:ty|s)?|bullshit|bitch(?:es)?|bastard|asshole|arsehole|cunt|dick(?:head|s)?|cock|pussy|whore|slut|wanker|bollocks|nigg(?:er|a)|fagg?(?:ot)?|retard)\b",
    RegexOptions.IgnoreCase | RegexOptions.CultureInvariant | RegexOptions.Compiled)]
  private static partial Regex ProfanityPattern();

  public static (bool Hit, string? MatchedTerm) ContainsProfanity(string text)
  {
    if (string.IsNullOrWhiteSpace(text))
      return (false, null);

    var match = ProfanityPattern().Match(text);
    if (match.Success)
      return (true, match.Value.ToLowerInvariant());

    foreach (var token in Tokenize(text))
    {
      if (TokenSet.Contains(token))
        return (true, token.ToLowerInvariant());
    }

    return (false, null);
  }

  private static IEnumerable<string> Tokenize(string text)
  {
    return text.Split([' ', '\n', '\r', '\t', '.', ',', '!', '?', ';', ':', '"', '\''], StringSplitOptions.RemoveEmptyEntries);
  }
}
