using System.Text.Json.Serialization;

public class ClimbGroup
{
    [JsonPropertyName("GroupId")]
    public int GroupId { get; set; }
    [JsonPropertyName("GroupName")]
    public required string GroupName { get; set; }
    [JsonPropertyName("GroupDescription")]
    public required string GroupDescription { get; set; }
    [JsonPropertyName("JoinRequirements")]
    public required string JoinRequirements { get; set; }
    [JsonPropertyName("Price")]
    public required double Price { get; set; }
    [JsonPropertyName("GroupType")]
    public required string GroupType { get; set; }
    [JsonPropertyName("GroupOwner")]
    public required string GroupOwner { get; set; }
    [JsonPropertyName("GroupImage")]
    public byte[]? GroupImage { get; set; }
}