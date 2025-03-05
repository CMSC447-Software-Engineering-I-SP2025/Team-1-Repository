using BoulderBuddyAPI.Models.OpenBetaModels;

namespace BoulderBuddyAPI.Services
{
    public class OpenBetaQueryService : IOpenBetaQueryService
    {
        private readonly HttpClient _httpClient;

        public async Task<SearchByLocationRootObj> GetAreaClimbs(string rootArea)
        {
            return null;
        }
    }
}
