using System.Text.Json.Serialization;

public class Recommendation
{
    [JsonPropertyName("RouteId")]
    public required String RouteId { get; set; }
}