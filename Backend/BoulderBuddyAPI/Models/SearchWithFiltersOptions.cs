namespace BoulderBuddyAPI.Models
{
    public class SearchWithFiltersOptions
    {
        public string State { get; set; }
        public string? SearchTerm { get; set; }
        public DistanceFromCenterOptions? DistOptions { get; set; }
        public string? MinFont { get; set; }
        public string? MaxFont { get; set; }
        public string? MinFrench { get; set; }
        public string? MaxFrench { get; set; }
        public string? MinVscale { get; set; }
        public string? MaxVscale { get; set; }
        public string? MinYDS { get; set; }
        public string? MaxYDS { get; set; }
    }
}
