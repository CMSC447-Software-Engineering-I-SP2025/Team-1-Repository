using System.Text.Json.Serialization;

public class User
{
    [JsonPropertyName("UserId")]
    public string UserId { get; set; }

    [JsonPropertyName("Name")]
    public string Name { get; set; }

    [JsonPropertyName("Email")]
    public string Email { get; set; }

    [JsonPropertyName("Password")]
    public string Password { get; set; }

    [JsonPropertyName("AccountType")]
    public string AccountType { get; set; }

    // Add a parameterless constructor to satisfy the 'new()' constraint
    public User() { }
}