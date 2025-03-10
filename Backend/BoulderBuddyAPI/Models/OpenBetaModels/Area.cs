namespace BoulderBuddyAPI.Models.OpenBetaModels
{
    public class Area
    {
        public string areaName { get; set; }
        public List<Area> children { get; set; }
        public List<Climb> climbs { get; set; }
        public string id { get; set; }
        public AreaMetadata metadata { get; set; }
    }
}
