namespace BoulderBuddyAPI.Models
{
    public class SearchWithFiltersOptions
    {
        public string State { get; set; }
        public DistanceFromCenterOptions? DistOptions { get; set; }
        public string? MinBrazilianCrux { get; set; }
        public string? MaxBrazilianCrux { get; set; }
        public string? MinEwbank { get; set; }
        public string? MaxEwbank { get; set; }
        public string? MinFont { get; set; }
        public string? MaxFont { get; set; }
        public string? MinFrench { get; set; }
        public string? MaxFrench { get; set; }
        public string? MinUIAA { get; set; }
        public string? MaxUIAA { get; set; }
        public string? MinVscale { get; set; }
        public string? MaxVscale { get; set; }
        public string? MinYDS { get; set; }
        public string? MaxYDS { get; set; }
    }
}
