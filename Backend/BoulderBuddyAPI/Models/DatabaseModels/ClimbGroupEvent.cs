using System.Text.Json.Serialization;

public class ClimbGroupEvent
{
    [JsonPropertyName("EventId")]
    public required long EventId { get; set; }
    [JsonPropertyName("GroupId")]
    public required long GroupId { get; set; }
    [JsonPropertyName("EventName")]
    public required String EventName { get; set; }
    [JsonPropertyName("EventDescription")]
    public required string EventDescription { get; set; }
    [JsonPropertyName("EventDate")]
    public required string EventDate { get; set; }
    [JsonPropertyName("EventTime")]
    public required string EventTime { get; set; }
    [JsonPropertyName("EventLocation")]
    public required string EventLocation { get; set; }
    [JsonPropertyName("EventImage")]
    public byte[]? EventImage { get; set; }
}