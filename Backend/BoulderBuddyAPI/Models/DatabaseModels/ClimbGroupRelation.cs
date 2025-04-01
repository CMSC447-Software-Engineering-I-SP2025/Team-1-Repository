using System.Text.Json.Serialization;

public class ClimbGroupRelation
{
    [JsonPropertyName("GroupId")]
    public required long GroupId { get; set; }
    [JsonPropertyName("UserId")]
    public required long UserId { get; set; }
    [JsonPropertyName("RelationType")]
    public required string RelationType { get; set; }
    [JsonPropertyName("InviteDate")]
    public required string RequestDate { get; set; }
    [JsonPropertyName("MemberSince")]
    public required string MemberSince { get; set; }
}