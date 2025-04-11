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
    private readonly GradeRangesConfig _ranges;

    public SearchController(ILogger<SearchController> logger, IOpenBetaQueryService openBetaQuerySvc, GradeRangesConfig ranges)
    {
        _logger = logger;
        _openBetaQuerySvc = openBetaQuerySvc;
        _ranges = ranges;
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

    //POST /Search/StateWithFilters - performs OpenBeta API query, then filters the response based on desired options
    //note: if a grade filter is desired (like MinYDS), but an area has a null YDS specified, that area will be included
    [HttpPost("StateWithFilters")]
    public async Task<IActionResult> SearchByLocationWithFilters(SearchWithFiltersOptions options)
    {
        IEnumerable<Area> areas;
        try
        {
            var subareas = await _openBetaQuerySvc.QuerySubAreasInArea(options.State);
            areas = GetLeafAreasWithClimbs(subareas);
        }
        catch (ArgumentException)
        {
            return BadRequest("Invalid root area (state or country)."); //HTTP 400 (BadRequest) response with error msg
        }

        var climbFilter = BuildSearchFilterPredicate(options);

        //filter climbs to climbs that meet filter options, then remove areas that had all their climbs filtered out
        areas = areas.Where(a =>
        {
            a.climbs = a.climbs.Where(climbFilter).ToList();
            return a.climbs.Count > 0;
        });

        return Ok(areas.ToList()); //HTTP 200 (Ok) response with content
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

    //builds filter predicate that determines whether an area should be included based on all desired filter options
    private Func<Climb, bool> BuildSearchFilterPredicate(SearchWithFiltersOptions options)
    {
        return c =>
        {
            if (c.grades is null)
                return false;
            if (ShouldTest(options.MinFont, c.grades.font) && !AboveMin(c.grades.font, options.MinFont, _ranges.Font))
                return false;
            if (ShouldTest(options.MaxFont, c.grades.font) && !BelowMax(c.grades.font, options.MaxFont, _ranges.Font))
                return false;
            if (ShouldTest(options.MinFrench, c.grades.french) && !AboveMin(c.grades.french, options.MinFrench, _ranges.French))
                return false;
            if (ShouldTest(options.MaxFrench, c.grades.french) && !BelowMax(c.grades.french, options.MaxFrench, _ranges.French))
                return false;
            if (ShouldTest(options.MinVscale, c.grades.french) && !AboveMin(c.grades.vscale, options.MinVscale, _ranges.Vscale))
                return false;
            if (ShouldTest(options.MaxVscale, c.grades.french) && !BelowMax(c.grades.vscale, options.MaxVscale, _ranges.Vscale))
                return false;
            if (ShouldTest(options.MinYDS, c.grades.yds) && !c.grades.yds.StartsWith("V"))
            {
                //sometimes OpenBeta data's YDS grade has a "-" or "+", which isn't valid for YDS format
                if (c.grades.yds.EndsWith("-") || c.grades.yds.EndsWith("+"))
                    c.grades.yds = c.grades.yds.Substring(0, c.grades.yds.Length - 1);

                if (!AboveMin(c.grades.yds, options.MinYDS, _ranges.Yds))
                    return false;
            }
            if (ShouldTest(options.MaxYDS, c.grades.yds) && !c.grades.yds.StartsWith("V"))
            {
                //sometimes OpenBeta data's YDS grade has a "-" or "+", which isn't valid for YDS format
                if (c.grades.yds.EndsWith("-") || c.grades.yds.EndsWith("+"))
                    c.grades.yds = c.grades.yds.Substring(0, c.grades.yds.Length - 1);

                if (!BelowMax(c.grades.yds, options.MaxYDS, _ranges.Yds))
                    return false;
            }

            //TODO: distance test
            return true;
        };
    }

    //checks whether given filter needs to be ran (options entry and grade data are nonnull)
    private bool ShouldTest(string? fromOptions, string? fromData)
    {
        return fromOptions is not null && fromData is not null && fromData != "";
    }

    //returns true when 'grade' is null/empty or at/above 'min' in the given gradeRange. False if grade is below min or if error
    private bool AboveMin(string grade, string min, string[] gradeRange)
    {
        int minIndex = Array.IndexOf(gradeRange, min);
        int targetIndex = Array.IndexOf(gradeRange, grade);

        //logs when returning false due to invalid inputs
        if (minIndex == -1)
        {
            _logger.LogError($"Cannot determine if grade '{grade}' is above min '{min}' because min is an unsupported value.");
            return false;
        }
        else if (targetIndex == -1)
        {
            _logger.LogError($"Could not determine if grade '{grade}' is above min '{min}' because grade is an unsupported value.");
            return false;
        }

        return targetIndex >= minIndex;
    }

    //returns true when 'grade' is null/empty or at/below 'max' in the given gradeRange. False if grade is above max or if error
    private bool BelowMax(string grade, string max, string[] gradeRange)
    {
        if (grade is null || grade == "")
            return true;

        int maxIndex = Array.IndexOf(gradeRange, max);
        int targetIndex = Array.IndexOf(gradeRange, grade);

        //logs when returning false due to invalid inputs
        if (maxIndex == -1)
        {
            _logger.LogError($"Cannot determine if grade '{grade}' is below max '{max}' because max is an unsupported value.");
            return false;
        }
        else if (targetIndex == -1)
        {
            _logger.LogError($"Could not determine if grade '{grade}' is below max '{max}' because grade is an unsupported value.");
            return false;
        }

        return targetIndex <= maxIndex;
    }
}
