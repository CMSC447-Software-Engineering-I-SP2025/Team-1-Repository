using System.Text.Json.Serialization;

public class UserRelation
{
    [JsonPropertyName("User1Id")]
    public required string User1Id { get; set; }
    [JsonPropertyName("User2Id")]
    public required string User2Id { get; set; }
    [JsonPropertyName("User1Name")]
    public required string User1Name { get; set; }
    [JsonPropertyName("User2Name")]
    public required string User2Name { get; set; }
    [JsonPropertyName("RelationType")]
    public required string RelationType { get; set; }
    [JsonPropertyName("RequestDate")]
    public required string RequestDate { get; set; }
    [JsonPropertyName("FriendSince")]
    public required string FriendSince { get; set; }
}