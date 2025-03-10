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

    //POST /Search/State - performs OpenBeta API query to find climbs in given state
    [HttpPost("State")]
    public async Task<IActionResult> SearchByLocation(string state)
    {
        if (state is null)
            return BadRequest("Null root area (state or country)."); //HTTP 400 (BadRequest) response with error msg

        try
        {
            var subareas = await _openBetaQuerySvc.QuerySubAreasInArea(state);
            var leafAreasWithClimbs = GetLeafAreasWithClimbs(subareas);
            return Ok(leafAreasWithClimbs); //HTTP 200 (Ok) response with content
        } catch (ArgumentException)
        {
            return BadRequest("Invalid root area (state or country)."); //HTTP 400 (BadRequest) response with error msg
        }
    }

    //finds all areas within list of trees (areas) that have no subareas but do have climbs associated with them. DFS
    private List<Area> GetLeafAreasWithClimbs(IEnumerable<Area> areas)
    {
        var haveChildren = new Stack<Area>();
        var leavesWithClimbs = new List<Area>();

        //add all areas to DFS stack, in reverse order to preserve order (by original ancestor area) by end
        foreach (var area in areas)
            haveChildren.Push(area);

        //push area's children if it has children, or remove to list if it doesn't - DFS
        while (haveChildren.Count > 0)
        {
            var thisArea = haveChildren.Pop();

            //push children if it has children
            if (thisArea.children.Count > 0)
            {
                //thisArea.children.Reverse();
                foreach (var child in thisArea.children)
                    haveChildren.Push(child);
            }

            //remove area to list of leaves if it has associated climbs
            else if (thisArea.climbs.Count > 0)
                leavesWithClimbs.Add(thisArea);
        }

        return leavesWithClimbs;
    }
}
