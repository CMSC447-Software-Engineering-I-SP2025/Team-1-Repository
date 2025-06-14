using System.Text.Json.Serialization;

public class ClimbGroupRelation
{
    [JsonPropertyName("GroupId")]
    public required long GroupId { get; set; }
    [JsonPropertyName("GroupName")]
    public required string GroupName { get; set; }
    [JsonPropertyName("UserId")]
    public required string UserId { get; set; }
    [JsonPropertyName("RelationType")]
    public required string RelationType { get; set; }
    [JsonPropertyName("InviteDate")]
    public required string InviteDate { get; set; }
    [JsonPropertyName("RequestDate")]
    public required string RequestDate { get; set; }
    [JsonPropertyName("MemberSince")]
    public required string MemberSince { get; set; }
}