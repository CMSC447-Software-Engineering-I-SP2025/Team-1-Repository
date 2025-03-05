using BoulderBuddyAPI.Models;
using BoulderBuddyAPI.Models.OpenBetaModels;
using BoulderBuddyAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace BoulderBuddyAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class SearchController : ControllerBase
{
    private readonly ILogger<SearchController> _logger;
    private readonly IOpenBetaQueryService _openBetaQuerySvc;

    public SearchController(ILogger<SearchController> logger, IOpenBetaQueryService openBetaQuerySvc)
    {
        _logger = logger;
        _openBetaQuerySvc = openBetaQuerySvc;
    }

    //POST /Search/Location
    [HttpPost("Location")]
    public async Task<IEnumerable<Area>> SearchByLocation(SearchByLocationParameters locAndRadius)
    {
        var subareas = await _openBetaQuerySvc.QuerySubAreasInArea("Delaware");


        return null;
    }
}
