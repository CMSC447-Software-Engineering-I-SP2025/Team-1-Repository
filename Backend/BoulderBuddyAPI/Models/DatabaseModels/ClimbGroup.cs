using System.Text.Json.Serialization;

public class ClimbGroup
{
    [JsonPropertyName("GroupName")]
    public required String GroupName { get; set; }
    [JsonPropertyName("GroupDescription")]
    public required String GroupDescription { get; set; }
    [JsonPropertyName("JoinRequirements")]
    public required string JoinRequirements { get; set; }
    [JsonPropertyName("Price")]
    public string Price { get; set; }
    [JsonPropertyName("GroupType")]
    public required string GroupType { get; set; }
    [JsonPropertyName("GroupOwner")]
    public required string GroupOwner { get; set; }
    [JsonPropertyName("GroupImage")]
    public byte[]? GroupImage { get; set; }
}