using BoulderBuddyAPI.Models.OpenBetaModels;

namespace BoulderBuddyAPI.Services
{
    public interface IOpenBetaQueryService
    {
        public Task<SearchByLocationRootObj> GetAreaClimbs(string rootArea);
    }
}
