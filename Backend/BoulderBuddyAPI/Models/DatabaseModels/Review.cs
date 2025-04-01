using System.Text.Json.Serialization;

public class Review
{
    [JsonPropertyName("UserId")]
    public required long UserId { get; set; }
    
    [JsonPropertyName("RouteId")]
    public required String RouteId { get; set; }

    [JsonPropertyName("Rating")]
    public required long Rating { get; set; }

    [JsonPropertyName("Text")]
    public required string Text { get; set; }
}