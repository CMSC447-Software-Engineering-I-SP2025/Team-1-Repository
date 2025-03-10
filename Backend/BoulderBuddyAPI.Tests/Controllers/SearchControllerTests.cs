using BoulderBuddyAPI.Controllers;
using BoulderBuddyAPI.Models;
using BoulderBuddyAPI.Models.OpenBetaModels;
using BoulderBuddyAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using RichardSzalay.MockHttp;
using System.Text.Json;

namespace BoulderBuddyAPI.Tests.Controllers
{
    public class SearchControllerTests
    {
        [Fact]
        public async Task SearchByLocationState_GivenValidState_Returns200OkWithListOfSubareas()
        {
            //read subareas as OpenBetaQueryService would, but without actually pinging OpenBeta API
            var jsonString = File.ReadAllText("TestResources/ClimbsByStateResponse.json");
            var responseContent = JsonSerializer.Deserialize<SearchByLocationRootObj>(jsonString);
            var subareas = responseContent.data.areas[0].children;

            //read expected output from file
            jsonString = File.ReadAllText("TestResources/ClimbsByStateResponseLeafAreas.json");
            var expectedReturn = JsonSerializer.Deserialize<List<Area>>(jsonString).AsEnumerable();

            //setup mock SearchController
            var mockLogger = new Mock<ILogger<SearchController>>();
            var mockOBSQ = new Mock<IOpenBetaQueryService>();
            mockOBSQ.Setup(m => m.QuerySubAreasInArea(It.IsAny<string>()))
                .ReturnsAsync(subareas);
            var controller = new SearchController(mockLogger.Object, mockOBSQ.Object);

            var result = await controller.SearchByLocation("Delaware"); //act

            //verify HTTP status code 200 (response created via Ok() method)
            Assert.IsType<OkObjectResult>(result);
            var resultAsObjectResult = (OkObjectResult) result;
            var resultEnumerable = resultAsObjectResult.Value;

            //deep equality by objects' public properties
            Assert.Equivalent(expectedReturn, resultEnumerable);
        }

        [Fact]
        public async Task SearchByLocationState_GivenInvalidState_Returns400BadRequestWithErrorMsg()
        {
            //setup OpenBetaQueryService with mocked HttpClient (so it doesn't actually ping OpenBeta)
            var mockOBQSLogger = new Mock<ILogger<OpenBetaQueryService>>();
            var config = new OpenBetaConfig()
            {
                OpenBetaEndpoint = "UNUSED",
                SupportedRootAreas = ["Delaware", "Maryland"]
            };
            var mockHttpMsgHandler = new MockHttpMessageHandler();
            var injectedHttpClient = new HttpClient(mockHttpMsgHandler);
            var openBetaQueryService = new OpenBetaQueryService(mockOBQSLogger.Object, injectedHttpClient, config);

            //create mock controller
            var mockLogger = new Mock<ILogger<SearchController>>();
            var controller = new SearchController(mockLogger.Object, openBetaQueryService);

            string[] invalidStatesToTry = ["Mississippi", "Hawaii", "", "DELAWARE", null];
            foreach (var invalid in invalidStatesToTry)
            {
                var result = await controller.SearchByLocation(invalid); //act

                Assert.IsType<BadRequestObjectResult>(result);
                var resultAsObjectResult = (BadRequestObjectResult)result;

                var errMsg = resultAsObjectResult.Value;
                Assert.IsType<string>(errMsg);
            }
        }
    }
}
