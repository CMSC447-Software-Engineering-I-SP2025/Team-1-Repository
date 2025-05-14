using BoulderBuddyAPI.Models.OpenBetaModels;

namespace BoulderBuddyAPI.Services
{
    public interface IOpenBetaQueryService
    {
        public Task<List<Area>> QuerySubAreasInArea(string rootArea);
        public Task<Climb> QueryClimbByClimbID(string climbID);
        public Task<Area> QueryAreaByAreaID(string rootAreaID);
    }
}
