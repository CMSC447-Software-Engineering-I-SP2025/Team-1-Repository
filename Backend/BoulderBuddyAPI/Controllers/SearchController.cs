using BoulderBuddyAPI.Models;
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

    [HttpPost("Location")]
    public async Task<IEnumerable<SearchByLocationParameters>> PostLocation(SearchByLocationParameters locAndRadius)
    {
        return Enumerable.Range(1, 5).Select(index => new SearchByLocationParameters
        {
            Lat = 39.093266, //usg BSE front door
            Lng = -77.201558, //usg BSE front door
            Miles = 50
        })
        .ToArray();
    }
}
