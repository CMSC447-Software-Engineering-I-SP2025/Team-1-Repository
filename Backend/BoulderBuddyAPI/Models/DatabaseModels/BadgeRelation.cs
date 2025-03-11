using System.Text.Json.Serialization;

public class BadgeRelation
{
    [JsonPropertyName("UserId")]
    public required String UserId { get; set; }
    [JsonPropertyName("BadgeId")]
    public required String BadgeId { get; set; }
}