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
            var controller = SetupSearchControllerForValidStateTests("TestResources/DelawareResponse.json");

            //read expected output from file
            var jsonString = File.ReadAllText("TestResources/DelawareLeafAreas.json");
            var expectedReturn = JsonSerializer.Deserialize<List<Area>>(jsonString).AsEnumerable();

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
            var controller = SetupSearchControllerForInvalidStateTests();
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

        [Fact]
        public async Task SearchByLocationWithFilters_GivenMinAndMaxFont_FiltersCorrectly()
        {
            var controller = SetupSearchControllerForValidStateTests("TestResources/DelawareResponse.json");
            var options = new SearchWithFiltersOptions()
            {
                State = "Delaware",
                MinFont = "5-",
                MaxFont = "5+"
            };

            var result = await controller.SearchByLocationWithFilters(options); //act

            //verify HTTP status code 200 (response created via Ok() method)
            Assert.IsType<OkObjectResult>(result);
            var resultAsObjectResult = (OkObjectResult)result;
            var resultEnumerable = (IEnumerable<Area>)resultAsObjectResult.Value;

            //all areas should have climbs (if we filter out all an area's climbs, it should be removed)
            Assert.DoesNotContain(resultEnumerable, a => a.climbs.Count == 0);

            //all climbs should have null/empty font or be base of 5
            foreach (var area in resultEnumerable)
            {
                foreach (var climb in area.climbs)
                    Assert.True(climb.grades.font is null || climb.grades.font == ""
                        || climb.grades.font.StartsWith("5"));
            }
        }

        [Fact]
        public async Task SearchByLocationWithFilters_GivenMinAndMaxFrench_FiltersCorrectly()
        {
            var controller = SetupSearchControllerForValidStateTests("TestResources/DelawareResponse.json");
            var options = new SearchWithFiltersOptions()
            {
                State = "Delaware",
                MinFrench = "5a",
                MaxFrench = "5c+"
            };

            var result = await controller.SearchByLocationWithFilters(options); //act

            //verify HTTP status code 200 (response created via Ok() method)
            Assert.IsType<OkObjectResult>(result);
            var resultAsObjectResult = (OkObjectResult)result;
            var resultEnumerable = (IEnumerable<Area>)resultAsObjectResult.Value;

            //all areas should have climbs (if we filter out all an area's climbs, it should be removed)
            Assert.DoesNotContain(resultEnumerable, a => a.climbs.Count == 0);

            //all climbs should have null/empty font or be base of 5
            foreach (var area in resultEnumerable)
            {
                foreach (var climb in area.climbs)
                    Assert.True(climb.grades.french is null || climb.grades.french == ""
                        || climb.grades.french.StartsWith("5"));
            }
        }

        [Fact]
        public async Task SearchByLocationWithFilters_GivenMinAndMaxVscale_FiltersCorrectly()
        {
            var controller = SetupSearchControllerForValidStateTests("TestResources/DelawareResponse.json");
            var options = new SearchWithFiltersOptions()
            {
                State = "Delaware",
                MinVscale = "V2",
                MaxVscale = "V4"
            };

            var result = await controller.SearchByLocationWithFilters(options); //act

            //verify HTTP status code 200 (response created via Ok() method)
            Assert.IsType<OkObjectResult>(result);
            var resultAsObjectResult = (OkObjectResult)result;
            var resultEnumerable = (IEnumerable<Area>)resultAsObjectResult.Value;

            //all areas should have climbs (if we filter out all an area's climbs, it should be removed)
            Assert.DoesNotContain(resultEnumerable, a => a.climbs.Count == 0);

            //all climbs should have null/empty font or be base of 5
            foreach (var area in resultEnumerable)
            {
                foreach (var climb in area.climbs)
                    Assert.True(climb.grades.vscale is null || climb.grades.vscale == ""
                        || climb.grades.vscale == "V2" || climb.grades.vscale == "V3" || climb.grades.vscale == "V4");
            }
        }

        [Fact]
        public async Task SearchByLocationWithFilters_GivenMinAndMaxYds_FiltersCorrectly()
        {
            var controller = SetupSearchControllerForValidStateTests("TestResources/ColoradoResponse.json");
            var options = new SearchWithFiltersOptions()
            {
                State = "Colorado",
                MinYDS = "5.12a",
                MaxYDS = "5.12d"
            };

            var result = await controller.SearchByLocationWithFilters(options); //act

            //verify HTTP status code 200 (response created via Ok() method)
            Assert.IsType<OkObjectResult>(result);
            var resultAsObjectResult = (OkObjectResult)result;
            var resultEnumerable = (IEnumerable<Area>)resultAsObjectResult.Value;

            //all areas should have climbs (if we filter out all an area's climbs, it should be removed)
            Assert.DoesNotContain(resultEnumerable, a => a.climbs.Count == 0);

            //all climbs should have null/empty font or be base of 5
            foreach (var area in resultEnumerable)
            {
                foreach (var climb in area.climbs)
                    Assert.True(climb.grades.yds is null || climb.grades.yds == ""
                        || climb.grades.yds.StartsWith("5.12") || climb.grades.yds.StartsWith("V"));
            }
        }

        //extra coverage since MinAndMax test trims the "+"/"-" on the Min filter and leaves Max filter's trim untested
        [Fact]
        public async Task SearchByLocationWithFilters_GivenMaxYds_CutsTrailingPlusOrMinusSign()
        {
            var controller = SetupSearchControllerForValidStateTests("TestResources/ColoradoResponse.json");
            var options = new SearchWithFiltersOptions()
            {
                State = "Colorado",
                MaxYDS = "5.12d"
            };

            var result = await controller.SearchByLocationWithFilters(options); //act

            //verify HTTP status code 200 (response created via Ok() method)
            Assert.IsType<OkObjectResult>(result);
            var resultAsObjectResult = (OkObjectResult)result;
            var resultEnumerable = (IEnumerable<Area>)resultAsObjectResult.Value;

            //all areas should have climbs (if we filter out all an area's climbs, it should be removed)
            Assert.DoesNotContain(resultEnumerable, a => a.climbs.Count == 0);

            //all climbs should have null/empty font or be base of 5
            foreach (var area in resultEnumerable)
            {
                foreach (var climb in area.climbs)
                    Assert.True(climb.grades.yds is null || climb.grades.yds == "" || climb.grades.yds.StartsWith("V")
                        || (!climb.grades.yds.EndsWith("+") && !climb.grades.yds.EndsWith("-")));
            }
        }

        [Fact]
        public async Task SearchByLocationWithFilters_GivenDistOptions_FiltersCorrectly()
        {
            var controller = SetupSearchControllerForValidStateTests("TestResources/DelawareResponse.json");
            var options = new SearchWithFiltersOptions()
            {
                State = "Delaware",
                DistOptions = new DistanceFromCenterOptions()
                {
                    Miles = 23, //the Delaware dataset has climbs from 20-26 miles away. This filters some of them
                    Lat = 39.9528, //coords to Philadelphia City Hall
                    Lng = -75.1635
                }
            };

            var result = await controller.SearchByLocationWithFilters(options); //act

            //verify HTTP status code 200 (response created via Ok() method)
            Assert.IsType<OkObjectResult>(result);
            var resultAsObjectResult = (OkObjectResult)result;
            var resultEnumerable = (IEnumerable<Area>)resultAsObjectResult.Value;

            //all areas should have climbs (if we filter out all an area's climbs, it should be removed)
            Assert.DoesNotContain(resultEnumerable, a => a.climbs.Count == 0);

            //there are 69 climbs in Delaware. Some should be too far (>23 miles), some should be within range.
            var totalClimbs = resultEnumerable.Sum(a => a.climbs.Count);
            Assert.True(totalClimbs > 0);
            Assert.True(totalClimbs < 69);
        }

        [Fact]
        public async Task SearchByLocationWithFilters_GivenInvalidState_Returns400BadRequestWithErrorMsg()
        {
            var controller = SetupSearchControllerForInvalidStateTests();
            string[] invalidStatesToTry = ["Mississippi", "Hawaii", "", "DELAWARE", null];
            foreach (var invalid in invalidStatesToTry)
            {
                var options = new SearchWithFiltersOptions() { State = invalid };
                var result = await controller.SearchByLocationWithFilters(options); //act

                Assert.IsType<BadRequestObjectResult>(result);
                var resultAsObjectResult = (BadRequestObjectResult)result;

                var errMsg = resultAsObjectResult.Value;
                Assert.IsType<string>(errMsg);
            }
        }

        //create a SearchController for unit testing valid states
        private SearchController SetupSearchControllerForValidStateTests(string testFilePath)
        {
            //read subareas as OpenBetaQueryService would, but without actually pinging OpenBeta API
            var jsonString = File.ReadAllText(testFilePath);
            var responseContent = JsonSerializer.Deserialize<SearchByLocationRootObj>(jsonString);
            var subareas = responseContent.data.areas[0].children;

            //setup mock SearchController
            var mockLogger = new Mock<ILogger<SearchController>>();
            var mockOBSQ = new Mock<IOpenBetaQueryService>();
            mockOBSQ.Setup(m => m.QuerySubAreasInArea(It.IsAny<string>()))
                .ReturnsAsync(subareas);

            //actual ranges taken from appsettings
            var ranges = new GradeRangesConfig()
            {
                Font = ["3", "4-", "4", "4+", "5-", "5", "5+", "6A", "6A+", "6B", "6B+", "6C", "6C+",
                    "7A", "7A+", "7B", "7B+", "7C", "7C+", "8A", "8A+", "8B", "8B+", "8C", "8C+", "9A"],
                French = ["1-", "1", "1+", "2-", "2", "2+", "3-", "3", "3+", "4a", "4a+", "4b", "4b+", "4c", "4c+",
                    "5a", "5a+", "5b", "5b+", "5c", "5c+", "6a", "6a+", "6b", "6b+", "6c", "6c+",
                    "7a", "7a+", "7b", "7b+", "7c", "7c+", "8a", "8a+", "8b", "8b+", "8c", "8c+",
                    "9a", "9a+", "9b", "9b+", "9c", "9c+"],
                Vscale = ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13",
                    "V14", "V15", "V16", "V17"],
                Yds = ["5.0", "5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "5.9", "5.10a", "5.10b", "5.10c",
                    "5.10d", "5.11a", "5.11b", "5.11c", "5.11d", "5.12a", "5.12b", "5.12c", "5.12d", "5.13a", "5.13b",
                    "5.13c", "5.13d", "5.14a", "5.14b", "5.14c", "5.14d", "5.15a", "5.15b", "5.15c", "5.15d"]
            };

            var controller = new SearchController(mockLogger.Object, mockOBSQ.Object, ranges);
            return controller;
        }

        //create a SearchController for unit testing invalid states
        private SearchController SetupSearchControllerForInvalidStateTests()
        {
            //setup OpenBetaQueryService with mocked HttpClient (so it won't actually ping OpenBeta)
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
            var controller = new SearchController(mockLogger.Object, openBetaQueryService, null);
            return controller;
        }
    }
}
