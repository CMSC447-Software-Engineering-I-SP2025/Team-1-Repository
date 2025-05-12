using BoulderBuddyAPI.Models;
using BoulderBuddyAPI.Models.OpenBetaModels;
using BoulderBuddyAPI.Services;
using Microsoft.Extensions.Logging;
using Moq;
using RichardSzalay.MockHttp;
using System.Text.Json;

namespace BoulderBuddyAPI.Tests.Services
{
    public class OpenBetaQueryServiceTests
    {
        [Fact]
        public async Task QuerySubAreasInArea_GivenValidRootArea_ReturnsSubAreaListWithClimbs()
        {
            var service = ArrangeTestableObject("TestResources/DelawareResponse.json"); //arrange
            var subareas = await service.QuerySubAreasInArea("Delaware"); //act

            Assert.Equal(5, subareas.Count); //expecting 5 subareas based on the json file
            Assert.Contains(subareas, a => a.areaName == "Alapocas Run State Park"); //expected to contain this subarea
            Assert.Equal(2, subareas.Count(a => a.climbs.Count > 0)); //expected to have at least one area with climbs
        }

        [Fact]
        public async Task QuerySubAreasInArea_ReadsFromCache()
        {
            var service = ArrangeTestableObject("TestResources/DelawareResponse.json");

            //start this test with an OpenBeta query, not a cache hit
            var expectedDirPath = $"cached_responses_test\\{DateTime.Now.ToString("yyyyMMdd")}";
            if (Directory.Exists(expectedDirPath))
                Directory.Delete(expectedDirPath, true);

            //act (1)
            var subareas1 = await service.QuerySubAreasInArea("Delaware"); //expecting OpenBeta query

            //caching requires the creation of file and directory (since directory was previously deleted)
            Assert.True(Directory.Exists(expectedDirPath));
            Assert.True(Path.Exists($"{expectedDirPath}\\Delaware.json"));

            //act (2)
            var subareas2 = await service.QuerySubAreasInArea("Delaware"); //expecting cache hit

            //the response from the first search should be read by the second
            Assert.Equal(subareas1.Count, subareas2.Count);
            Assert.Equivalent(subareas1, subareas2);
        }

        [Fact]
        public async Task QuerySubAreasInArea_GivenInvalidRootArea_ThrowsArgumentException()
        {
            var service = ArrangeTestableObject("TestResources/DelawareResponse.json"); //arrange
            
            //example invalid inputs
            await Assert.ThrowsAsync<ArgumentException>(() => service.QuerySubAreasInArea("Mississippi"));
            await Assert.ThrowsAsync<ArgumentException>(() => service.QuerySubAreasInArea("Hawaii"));
            await Assert.ThrowsAsync<ArgumentException>(() => service.QuerySubAreasInArea(""));
            await Assert.ThrowsAsync<ArgumentException>(() => service.QuerySubAreasInArea("DELAWARE")); //case sensitive
            await Assert.ThrowsAsync<ArgumentException>(() => service.QuerySubAreasInArea(null));
        }
        [Fact]
        public async Task QueryAreaByAreaID_GivenValidRootArea_ReturnsAreaWithClimbs()
        {
            var service = ArrangeTestableObject("TestResources/AreaResponse_ccee8a41-32ec-5a26-96f6-f8c2743423e3.json"); //arrange
            var area = await service.QueryAreaByAreaID("ccee8a41-32ec-5a26-96f6-f8c2743423e3"); //act

            //read expected output from file
            var jsonString = File.ReadAllText("TestResources/Area_ccee8a41-32ec-5a26-96f6-f8c2743423e3.json");
            var expectedReturn = JsonSerializer.Deserialize<Area>(jsonString);

            //assert deep equivalence
            Assert.Equivalent(expectedReturn, area);
        }

        [Fact]
        public async Task QueryAreaByAreaID_ReadsFromCache()
        {
            var service = ArrangeTestableObject("TestResources/AreaResponse_ccee8a41-32ec-5a26-96f6-f8c2743423e3.json");

            //start this test with an OpenBeta query, not a cache hit
            var expectedDirPath = $"cached_responses_test\\{DateTime.Now.ToString("yyyyMMdd")}";
            if (Directory.Exists(expectedDirPath))
                Directory.Delete(expectedDirPath, true);

            //act (1)
            var area1 = await service.QueryAreaByAreaID("ccee8a41-32ec-5a26-96f6-f8c2743423e3"); //expecting OpenBeta query

            //caching requires the creation of file and directory (since directory was previously deleted)
            Assert.True(Directory.Exists(expectedDirPath));
            Assert.True(Path.Exists($"{expectedDirPath}\\ccee8a41-32ec-5a26-96f6-f8c2743423e3.json"));

            //act (2)
            var area2 = await service.QueryAreaByAreaID("ccee8a41-32ec-5a26-96f6-f8c2743423e3"); //expecting cache hit

            //the response from the first search should be read by the second
            Assert.Equivalent(area1, area2);
        }

        [Fact]
        public async Task QueryAreaByAreaID_GivenInvalidRootArea_ThrowsArgumentException()
        {
            var service = ArrangeTestableObject("TestResources/DelawareResponse.json"); //arrange

            //example invalid inputs
            await Assert.ThrowsAsync<ArgumentException>(() => service.QueryAreaByAreaID("string"));
            await Assert.ThrowsAsync<ArgumentException>(() => service.QueryAreaByAreaID(""));
            await Assert.ThrowsAsync<ArgumentException>(() => service.QueryAreaByAreaID(null));
        }

        //create OpenBetaQueryService object using a mocked HttpClient that returns json content read from given file path
        private OpenBetaQueryService ArrangeTestableObject(string queryResponseJsonFilePath)
        {
            //build example query response for one area in Delaware
            var jsonString = File.ReadAllText(queryResponseJsonFilePath);
            var responseContent = JsonSerializer.Deserialize<SearchByLocationRootObj>(jsonString);

            var mockLogger = new Mock<ILogger<OpenBetaQueryService>>();
            var config = new OpenBetaConfig()
            {
                OpenBetaEndpoint = "UNUSED",
                SupportedRootAreas = ["Delaware", "Maryland"],
                CacheDirectory = "cached_responses_test"
            };

            //mock away the OpenBeta API call; testing it is outside the scope of this test
            var mockHttpMsgHandler = new MockHttpMessageHandler();
            mockHttpMsgHandler.When("https://stg-api.openbeta.io/")
                .Respond("application/json", jsonString);
            var injectedHttpClient = new HttpClient(mockHttpMsgHandler)
            {
                BaseAddress = new Uri("https://stg-api.openbeta.io/")
            };

            //create testable object
            var service = new OpenBetaQueryService(mockLogger.Object, injectedHttpClient, config);
            return service;
        }
    }
}