using System.Text.Json.Serialization;

public class Route
{
    [JsonPropertyName("RouteId")]
    public required string RouteId { get; set; }

    [JsonPropertyName("Name")]
    public required string Name { get; set; }

    [JsonPropertyName("Grade")]
    public required string Grade { get; set; }

    [JsonPropertyName("Longitude")]
    public required string Longitude { get; set; }

    [JsonPropertyName("Latitude")]
    public required string Latitude { get; set; }

    [JsonPropertyName("Picture")]
    public byte[]? Picture { get; set; }
}