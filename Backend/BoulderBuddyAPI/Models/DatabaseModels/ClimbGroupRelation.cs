using System.Text.Json.Serialization;

public class ClimbGroupRelation
{
    [JsonPropertyName("GroupId")]
    public required String GroupId { get; set; }
    [JsonPropertyName("UserId")]
    public required String UserId { get; set; }
    [JsonPropertyName("RelationType")]
    public required string RelationType { get; set; }
    [JsonPropertyName("RequestDate")]
    public required string RequestDate { get; set; }
    [JsonPropertyName("MemberSince")]
    public required string MemberSince { get; set; }
}