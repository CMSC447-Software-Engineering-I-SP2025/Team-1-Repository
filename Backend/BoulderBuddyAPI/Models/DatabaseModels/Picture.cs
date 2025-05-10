using System.Text.Json.Serialization;

public class Picture
{
    [JsonPropertyName("PictureId")]
    public required int PictureId { get; set; }
    [JsonPropertyName("UserId")]
    public required string UserId { get; set; }
    [JsonPropertyName("RouteId")]
    public required string RouteId { get; set; }
    [JsonPropertyName("Image")]
    public required byte[] Image { get; set; }
    [JsonPropertyName("UploadDate")]
    public required DateTime UploadDate { get; set; }
}