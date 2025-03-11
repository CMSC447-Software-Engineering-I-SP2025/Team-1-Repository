using System.Text.Json.Serialization;

public class User
{
    [JsonPropertyName("UserId")]
    public required string UserId { get; set; }

    [JsonPropertyName("Name")]
    public required string Name { get; set; }

    [JsonPropertyName("Email")]
    public required string Email { get; set; }

    [JsonPropertyName("Password")]
    public required string Password { get; set; }

    [JsonPropertyName("AccountType")]
    public required string AccountType { get; set; }
}