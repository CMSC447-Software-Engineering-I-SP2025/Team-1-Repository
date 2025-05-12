namespace BoulderBuddyAPI.Models.OpenBetaModels
{
    public class Climb
    {
        public Grades grades { get; set; }
        public string id { get; set; }
        public ClimbMetadata metadata { get; set; }
        public string name { get; set; }
        public string safety { get; set; }
        public ClimbTypes type { get; set; }
    }
}
