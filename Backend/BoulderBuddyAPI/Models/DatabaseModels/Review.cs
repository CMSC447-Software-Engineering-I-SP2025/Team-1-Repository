using System.Text.Json.Serialization;

public class Review
{
    [JsonPropertyName("UserId")]
    public required string UserId { get; set; }

    [JsonPropertyName("UserName")]
    public string? UserName { get; set; }

    [JsonPropertyName("RouteId")]
    public required string RouteId { get; set; }

    [JsonPropertyName("Rating")]
    public required long Rating { get; set; }

    [JsonPropertyName("Text")]
    public required string Text { get; set; }
    
}