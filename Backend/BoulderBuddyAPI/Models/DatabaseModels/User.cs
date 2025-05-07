using System.Reflection.Metadata;
using System.Text.Json.Serialization;

public class User
{
    [JsonPropertyName("UserId")]
    public string UserId { get; set; }
    [JsonPropertyName("UserName")]
    public string UserName { get; set; }
    [JsonPropertyName("ProfileImage")]
    public Blob ProfileImage { get; set; } 

    [JsonPropertyName("FirstName")]
    public string FirstName { get; set; }

    [JsonPropertyName("LastName")]
    public string LastName { get; set; }

    [JsonPropertyName("Email")]
    public string Email { get; set; }

    [JsonPropertyName("PhoneNumber")]
    public string PhoneNumber { get; set; }

    [JsonPropertyName("BoulderGradeLowerLimit")]
    public string BoulderGradeLowerLimit { get; set; }

    [JsonPropertyName("BoulderGradeUpperLimit")]
    public string BoulderGradeUpperLimit { get; set; }

    [JsonPropertyName("RopeClimberLowerLimit")]
    public string RopeClimberLowerLimit { get; set; }

    [JsonPropertyName("RopeClimberUpperLimit")]
    public string RopeClimberUpperLimit { get; set; }

    [JsonPropertyName("Bio")]
    public string Bio { get; set; }

    // Add a parameterless constructor to satisfy the 'new()' constraint
    public User() { }
}