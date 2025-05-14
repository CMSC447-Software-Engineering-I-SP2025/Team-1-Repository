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

        //perform area/climb name filter before everything else (since it filters the most out)
        if (options.SearchTerm is not null)
        {
            areas = areas.Where(a =>
            {
                //area-level filter succeeds when area contains search term
                if (a.areaName.Contains(options.SearchTerm, StringComparison.OrdinalIgnoreCase))
                    return true;

                //where area doesn't contain search term, filter climbs list to climbs that match search term
                a.climbs = a.climbs.Where(c => c.name.Contains(options.SearchTerm, StringComparison.OrdinalIgnoreCase)).ToList();

                //if area name didn't match and no climb names matched, then filter area out
                return a.climbs.Count > 0;
            });
        }

        //filter climbs to climbs that meet all other filter options, and removes areas that had all their climbs filtered out
        areas = areas.Where(a =>
        {
            a.climbs = a.climbs.Where(c => SearchFilter(options, c)).ToList();
            return a.climbs.Count > 0;
        });

        return Ok(areas.ToList()); //HTTP 200 (Ok) response with content
    }

    [HttpPost("ClimbID/{climbID}")]
    public async Task<IActionResult> SearchByClimbID(string climbID)
    {
        if (climbID is null)
            return BadRequest("Null climb ID.");

        try
        {
            var climb = await _openBetaQuerySvc.QueryClimbByClimbID(climbID);
            return Ok(climb); //HTTP 200 (Ok) response with content
        }
        catch (ArgumentException)
        {
            return BadRequest("Invalid climb ID (does not exist in OpenBeta)."); //HTTP 400 (BadRequest) response with error msg
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

    //determines if climb should be included based on all desired filter options (pass=true, fail=false)
    private bool SearchFilter(SearchWithFiltersOptions options, Climb c)
    {
        //filter by distance
        if (options.DistOptions is not null)
        {
            double dist = DistanceInMiles(c.metadata.lat, c.metadata.lng, options.DistOptions.Lat, options.DistOptions.Lng);
            if (dist > options.DistOptions.Miles)
                return false;
        }

        //there are rare occasions where this happens. Better to catch it here than pass it downstream
        if (c.grades is null || c.type is null)
            return false;

        var anyGradeFiltered = false;

        //options.MinFont <= c.grades.font <= options.MaxFont
        var passesMinFont = false;
        var passesMaxFont = false;
        var fontFiltered = false;
        if (ShouldTest(options.MinFont, c.grades.font))
        {
            passesMinFont = AboveMin(c.grades.font, options.MinFont, _ranges.Font);
            fontFiltered = true;
            anyGradeFiltered = true;
        }
        if (ShouldTest(options.MaxFont, c.grades.font))
        {
            passesMaxFont = BelowMax(c.grades.font, options.MaxFont, _ranges.Font);
            fontFiltered = true;
            anyGradeFiltered = true;
        }

        //options.MinFrench <= c.grades.french <= options.MaxFrench
        var passesMinFrench = false;
        var passesMaxFrench = false;
        var frenchFiltered = false;
        if (ShouldTest(options.MinFrench, c.grades.french))
        {
            passesMinFrench = AboveMin(c.grades.french, options.MinFrench, _ranges.French);
            frenchFiltered = true;
            anyGradeFiltered = true;
        }
        if (ShouldTest(options.MaxFrench, c.grades.french))
        {
            passesMaxFrench = BelowMax(c.grades.french, options.MaxFrench, _ranges.French);
            frenchFiltered = true;
            anyGradeFiltered = true;
        }

        //options.MinVscale <= c.grades.vscale <= options.MaxVscale
        var passesMinVscale = false;
        var passesMaxVscale = false;
        var vscaleFiltered = false;
        if (ShouldTest(options.MinVscale, c.grades.vscale))
        {
            passesMinVscale = AboveMin(c.grades.vscale, options.MinVscale, _ranges.Vscale);
            vscaleFiltered = true;
            anyGradeFiltered = true;
        }
        if (ShouldTest(options.MaxVscale, c.grades.vscale))
        {
            passesMaxVscale = BelowMax(c.grades.vscale, options.MaxVscale, _ranges.Vscale);
            vscaleFiltered = true;
            anyGradeFiltered = true;
        }

        //options.MinYDS <= c.grades.yds <= options.MaxYDS
        var passesMinYDS = false;
        var passesMaxYDS = false;
        var ydsFiltered = false;
        if (ShouldTest(options.MinYDS, c.grades.yds) && !c.grades.yds.StartsWith("V"))
        {
            //sometimes OpenBeta data's YDS grade has a "-" or "+", which isn't valid for YDS format
            if (c.grades.yds.EndsWith("-") || c.grades.yds.EndsWith("+"))
                c.grades.yds = c.grades.yds.Substring(0, c.grades.yds.Length - 1);

            passesMinYDS = AboveMin(c.grades.yds, options.MinYDS, _ranges.Yds);
            ydsFiltered = true;
            anyGradeFiltered = true;
        }
        if (ShouldTest(options.MaxYDS, c.grades.yds) && !c.grades.yds.StartsWith("V"))
        {
            //sometimes OpenBeta data's YDS grade has a "-" or "+", which isn't valid for YDS format
            if (c.grades.yds.EndsWith("-") || c.grades.yds.EndsWith("+"))
                c.grades.yds = c.grades.yds.Substring(0, c.grades.yds.Length - 1);

            passesMaxYDS = BelowMax(c.grades.yds, options.MaxYDS, _ranges.Yds);
            ydsFiltered = true;
            anyGradeFiltered = true;
        }

        //fail filter when at least one grade was checked (option was specified) and we didn't pass any grade
        if (anyGradeFiltered)
        {
            //treat min and max of same kind of grade as AND expression
            var passesFont = passesMinFont && passesMaxFont;
            var passesFrench = passesMinFrench && passesMaxFrench;
            var passesVscale = passesMinVscale && passesMaxVscale;
            var passesYDS = passesMinYDS && passesMaxYDS;

            //treat different kinds of grade as OR expression
            var passesGradeFilters = false;
            if (fontFiltered)
                passesGradeFilters |= passesFont;
            if (frenchFiltered)
                passesGradeFilters |= passesFrench;
            if (vscaleFiltered)
                passesGradeFilters |= passesVscale;
            if (ydsFiltered)
                passesGradeFilters |= passesYDS;

            if (!passesGradeFilters)
                return false;
        }

        //treat type filters as OR expression
        var passesTypeFilters = false;
        var anyTypeFiltered = false;
        if (options.IsAidType is not null)
        {
            passesTypeFilters |= options.IsAidType == c.type.aid;
            anyTypeFiltered = true;
        }
        if (options.IsAlpineType is not null)
        {
            passesTypeFilters |= options.IsAlpineType == c.type.alpine;
            anyTypeFiltered = true;
        }
        if (options.IsBoulderingType is not null)
        {
            passesTypeFilters |= options.IsBoulderingType == c.type.bouldering;
            anyTypeFiltered = true;
        }
        if (options.IsIceType is not null)
        {
            passesTypeFilters |= options.IsIceType == c.type.ice;
            anyTypeFiltered = true;
        }
        if (options.IsMixedType is not null)
        {
            passesTypeFilters |= options.IsMixedType == c.type.mixed;
            anyTypeFiltered = true;
        }
        if (options.IsSnowType is not null)
        {
            passesTypeFilters |= options.IsSnowType == c.type.snow;
            anyTypeFiltered = true;
        }
        if (options.IsSportType is not null)
        {
            passesTypeFilters |= options.IsSportType == c.type.sport;
            anyTypeFiltered = true;
        }
        if (options.IsTrType is not null)
        {
            passesTypeFilters |= options.IsTrType == c.type.tr;
            anyTypeFiltered = true;
        }
        if (options.IsTradType is not null)
        {
            passesTypeFilters |= options.IsTradType == c.type.trad;
            anyTypeFiltered = true;
        }

        //fail filter when at least one type was checked (option was specified) and we didn't pass any type
        return !anyTypeFiltered || passesTypeFilters;
    }

    //checks whether given filter needs to be ran (options entry and grade data are nonnull)
    private bool ShouldTest(string? fromOptions, string? fromData)
    {
        return fromOptions is not null && fromData is not null && fromData != "";
    }

    //returns true when 'grade' is null/empty or at/above 'min' in the given gradeRange. False if grade is below min or if error
    private bool AboveMin(string grade, string min, string[] gradeRange)
    {
        if (grade is null || grade == "")
            return true;

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

    //calculates the distance between two coordinates using the Haversine Formula, assuming the Earth is a 6371km radius sphere
    //note: the calculated value has some minimal error, since Earth is not a sphere or constant radius. We accept that fact.
    //references:
    // - https://github.com/mesotron/GRAIL/blob/master/geo_demo/geo_demo/Maths.cs (source code)
    // - https://community.esri.com/t5/coordinate-reference-systems-blog/distance-on-a-sphere-the-haversine-formula/ba-p/902128
    // - https://en.wikipedia.org/wiki/Haversine_formula
    private double DistanceInMiles(double lat1, double lng1, double lat2, double lng2)
    {
        double earthRadius = 6371; //earth radius in kilometers
        lat1 *= Math.PI / 180; //convert to radians
        lat2 *= Math.PI / 180; //convert to radians
        double dLat = lat2 - lat1; //delta of latitude in radians
        double dLon = (lng2 - lng1) * Math.PI / 180; //delta of longitude in radians

        //haversine formula
        double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2) * Math.Cos(lat1) * Math.Cos(lat2);
        double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        double distKm = earthRadius * c;

        double distMiles = distKm * 0.621371; //convert to miles
        return Math.Round(distMiles, 4); //round to 4 decimal digits
    }
}
