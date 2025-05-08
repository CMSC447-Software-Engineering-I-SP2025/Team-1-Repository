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
        public bool? IsAidType { get; set; }
        public bool? IsAlpineType { get; set; }
        public bool? IsBoulderingType { get; set; }
        public bool? IsIceType { get; set; }
        public bool? IsMixedType { get; set; }
        public bool? IsSnowType { get; set; }
        public bool? IsSportType { get; set; }
        public bool? IsTrType { get; set; }
        public bool? IsTradType { get; set; }
    }
}
