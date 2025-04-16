using System.Text.Json.Serialization;

public class BadgeRelation
{
    [JsonPropertyName("UserId")]
    public required string UserId { get; set; }
    [JsonPropertyName("BadgeId")]
    public required long BadgeId { get; set; }
}