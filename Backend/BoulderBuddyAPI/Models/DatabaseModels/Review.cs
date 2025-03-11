using System.Text.Json.Serialization;

public class Review
{
    [JsonPropertyName("UserId")]
    public required String UserId { get; set; }

    [JsonPropertyName("RouteId")]
    public required String RouteId { get; set; }

    [JsonPropertyName("Rating")]
    public required string Rating { get; set; }

    [JsonPropertyName("Text")]
    public required string Text { get; set; }
}