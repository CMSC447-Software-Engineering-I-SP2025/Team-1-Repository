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
            var service = ArrangeTestableObject("TestResources/ClimbsByStateResponse.json"); //arrange
            var subareas = await service.QuerySubAreasInArea("Delaware"); //act

            Assert.Equal(5, subareas.Count); //expecting 5 subareas based on the json file
            Assert.Contains(subareas, a => a.areaName == "Alapocas Run State Park"); //expected to contain this subarea
            Assert.Equal(2, subareas.Count(a => a.climbs.Count > 0)); //expected to have at least one area with climbs
        }

        [Fact]
        public async Task QuerySubAreasInArea_GivenInvalidRootArea_ThrowsArgumentException()
        {
            var service = ArrangeTestableObject("TestResources/ClimbsByStateResponse.json"); //arrange
            
            //example invalid inputs
            await Assert.ThrowsAsync<ArgumentException>(() => service.QuerySubAreasInArea("Mississippi"));
            await Assert.ThrowsAsync<ArgumentException>(() => service.QuerySubAreasInArea("Hawaii"));
            await Assert.ThrowsAsync<ArgumentException>(() => service.QuerySubAreasInArea(""));
            await Assert.ThrowsAsync<ArgumentException>(() => service.QuerySubAreasInArea("DELAWARE")); //case sensitive
            await Assert.ThrowsAsync<ArgumentException>(() => service.QuerySubAreasInArea(null));
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
                SupportedRootAreas = ["Delaware", "Maryland"]
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

        [Fact]
        public async Task Failing_Test()
        {
            Assert.NotNull(null);
        }
    }
}