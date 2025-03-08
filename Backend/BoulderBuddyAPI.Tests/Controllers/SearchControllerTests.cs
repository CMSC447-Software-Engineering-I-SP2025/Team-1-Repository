using BoulderBuddyAPI.Controllers;
using BoulderBuddyAPI.Models.OpenBetaModels;
using BoulderBuddyAPI.Services;
using Microsoft.Extensions.Logging;
using Moq;
using System.Text.Json;

namespace BoulderBuddyAPI.Tests.Controllers
{
    public class SearchControllerTests
    {
        [Fact]
        public async Task SearchByLocationState_GivenValidState_ReturnsListOfSubareas()
        {
            //read subareas as OpenBetaQueryService would, but without actually pinging OpenBeta API
            var jsonString = File.ReadAllText("TestResources/ClimbsByStateResponse.json");
            var responseContent = JsonSerializer.Deserialize<SearchByLocationRootObj>(jsonString);
            var subareas = responseContent.data.areas[0].children;

            //setup mock SearchController
            var mockLogger = new Mock<ILogger<SearchController>>();
            var mockOBSQ = new Mock<IOpenBetaQueryService>();
            mockOBSQ.Setup(m => m.QuerySubAreasInArea(It.IsAny<string>()))
                .ReturnsAsync(subareas);
            var controller = new SearchController(mockLogger.Object, mockOBSQ.Object);

            //act
            var result = await controller.SearchByLocation("Delaware");

            //read expected output from file
            jsonString = File.ReadAllText("TestResources/ClimbsByStateResponseLeafAreas.json");
            var expectedReturn = JsonSerializer.Deserialize<List<Area>>(jsonString).AsEnumerable();

            //deep equality by objects' public properties
            Assert.Equivalent(expectedReturn, result);
        }
    }
}
