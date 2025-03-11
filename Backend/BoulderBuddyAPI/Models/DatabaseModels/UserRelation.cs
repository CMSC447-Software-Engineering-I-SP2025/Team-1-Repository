using System.Text.Json.Serialization;

public class UserRelation
{
    [JsonPropertyName("User1Id")]
    public required String User1Id { get; set; }
    [JsonPropertyName("User2Id")]
    public required String User2Id { get; set; }
    [JsonPropertyName("RelationType")]
    public required string RelationType { get; set; }
    [JsonPropertyName("RequestDate")]
    public required string RequestDate { get; set; }
    [JsonPropertyName("FriendSince")]
    public required string FriendSince { get; set; }
}