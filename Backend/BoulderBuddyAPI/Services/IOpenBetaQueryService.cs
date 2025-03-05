using BoulderBuddyAPI.Models.OpenBetaModels;

namespace BoulderBuddyAPI.Services
{
    public interface IOpenBetaQueryService
    {
        public Task<List<Area>> QueryClimbsInArea(string rootArea);
    }
}
