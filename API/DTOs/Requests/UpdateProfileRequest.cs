namespace API.Dtos.Requests;

public class UpdateProfileRequest
{
    public string? FullName { get; set; }
    public string? Bio { get; set; }
    public string? Pronouns { get; set; }
    public string? Location { get; set; }
    public string? Website { get; set; }
    public string? FunFact { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? ProfileUsername { get; set; }
}
