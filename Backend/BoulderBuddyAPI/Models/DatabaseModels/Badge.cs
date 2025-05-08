using System.Text.Json.Serialization;

public class Badge
{
    
    [JsonPropertyName("BadgeID")]
    public required int BadgeID { get; set; }
    [JsonPropertyName("BadgeName")]
    public required String BadgeName { get; set; }
    [JsonPropertyName("BadgeDescription")]
    public required String BadgeDescription { get; set; }
    [JsonPropertyName("BadgeRequirement")]
    public required string BadgeRequirement { get; set; }
    [JsonPropertyName("BadgeRarity")]
    public required string BadgeRarity { get; set; }
    [JsonPropertyName("BadgeImage")]
    public byte[]? BadgeImage { get; set; }
}