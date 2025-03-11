using System.Text.Json.Serialization;

public class UserRelation
{
    [JsonPropertyName("UserId")]
    public required String UserId { get; set; }
    [JsonPropertyName("FriendId")]
    public required String FriendId { get; set; }
    [JsonPropertyName("RelationType")]
    public required string RelationType { get; set; }
    [JsonPropertyName("RequestDate")]
    public required string RequestDate { get; set; }
    [JsonPropertyName("FriendSince")]
    public required string FriendSince { get; set; }
}