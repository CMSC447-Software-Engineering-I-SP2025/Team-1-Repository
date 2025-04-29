using Microsoft.AspNetCore.Mvc;
using BoulderBuddyAPI.Services;
using Microsoft.Extensions.Configuration;
using System;
using BoulderBuddyAPI.Models.DatabaseModels;

namespace BoulderBuddyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseController : ControllerBase
    {
        private readonly IDatabaseService _databaseService;
        private readonly IConfiguration _configuration;

        public DatabaseController(IDatabaseService databaseService, IConfiguration configuration)
        {
            _databaseService = databaseService;
            _configuration = configuration;
        }

        // POST methods for inserting data into the database

        [HttpPost("user")]
        public async Task<IActionResult> PostUser([FromBody] User user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.InsertIntoUserTable(user);
                return Ok(new { message = "User created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("userRelation")]
        public async Task<IActionResult> PostUserRelation([FromBody] UserRelation userRelation)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.InsertIntoUserRelationTable(userRelation);
                return Ok(new { message = "User relation created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("review")]
        public async Task<IActionResult> PostReview([FromBody] Review review)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.InsertIntoReviewTable(review);
                return Ok(new { message = "Review created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("climbGroup")]
        public async Task<IActionResult> PostClimbGroup([FromBody] ClimbGroup climbGroup)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.InsertIntoClimbGroupTable(climbGroup);
                return Ok(new { message = "Climb group created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("climbGroupRelation")]
        public async Task<IActionResult> PostClimbGroupRelation([FromBody] ClimbGroupRelation climbGroupRelation)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.InsertIntoClimbGroupRelationTable(climbGroupRelation);
                return Ok(new { message = "Climb group relation created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("climbGroupEvent")]
        public async Task<IActionResult> PostClimbGroupEvent([FromBody] ClimbGroupEvent climbGroupEvent)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.InsertIntoClimbGroupEventTable(climbGroupEvent);
                return Ok(new { message = "Climb group event created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("badge")]
        public async Task<IActionResult> PostBadge([FromBody] Badge badge)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.InsertIntoBadgeTable(badge);
                return Ok(new { message = "Badge created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("badgeRelation")]
        public async Task<IActionResult> PostBadgeRelation([FromBody] BadgeRelation badgeRelation)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.InsertIntoBadgeRelationTable(badgeRelation);
                return Ok(new { message = "Badge relation created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // GET methods for getting data from the database

        [HttpGet("user")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _databaseService.GetUsers();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("review")]
        public async Task<IActionResult> GetReviews()
        {
            try
            {
                var reviews = await _databaseService.GetReviews();
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("ReviewsByClimbID")]
        public async Task<IActionResult> GetReviewsByClimbID(string id)
        {
            try
            {
                var reviews = await _databaseService.GetTenReviews(id);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("ClimbAvgRating")]
        public async Task<IActionResult> GetClimbAvgRating(string id)
        {
            try
            {
                var resultList = await _databaseService.GetAvgReview(id);
                var avg = resultList.First().Val;
                return Ok(avg);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("userRelation")]
        public async Task<IActionResult> GetUserRelations()
        {
            try
            {
                var userRelations = await _databaseService.GetUserRelations();
                return Ok(userRelations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("climbGroup")]
        public async Task<IActionResult> GetClimbGroups()
        {
            try
            {
                var climbGroups = await _databaseService.GetClimbGroups();
                return Ok(climbGroups);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("climbGroupRelation")]
        public async Task<IActionResult> GetClimbGroupRelations()
        {
            try
            {
                var climbGroupRelations = await _databaseService.GetClimbGroupRelations();
                return Ok(climbGroupRelations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("climbGroupEvent")]
        public async Task<IActionResult> GetClimbGroupEvents()
        {
            try
            {
                var climbGroupEvents = await _databaseService.GetClimbGroupEvents();
                return Ok(climbGroupEvents);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("badge")]
        public async Task<IActionResult> GetBadges()
        {
            try
            {
                var badges = await _databaseService.GetBadges();
                return Ok(badges);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("badgeRelation")]
        public async Task<IActionResult> GetBadgeRelations()
        {
            try
            {
                var badgeRelations = await _databaseService.GetBadgeRelations();
                return Ok(badgeRelations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // DELETE methods for deleting data from the database

        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            try
            {
                await _databaseService.DeleteFromUserTable(userId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("userRelation/{userRelationId}")]
        public async Task<IActionResult> DeleteUserRelation(string userRelationId)
        {
            try
            {
                await _databaseService.DeleteFromUserRelationTable(userRelationId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("review/{reviewId}")]
        public async Task<IActionResult> DeleteReview(string reviewId)
        {
            try
            {
                await _databaseService.DeleteFromReviewTable(reviewId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("climbGroup/{climbGroupId}")]
        public async Task<IActionResult> DeleteClimbGroup(string climbGroupId)
        {
            try
            {
                await _databaseService.DeleteFromClimbGroupTable(climbGroupId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("climbGroupRelation/{climbGroupRelationId}")]
        public async Task<IActionResult> DeleteClimbGroupRelation(string climbGroupRelationId)
        {
            try
            {
                await _databaseService.DeleteFromClimbGroupRelationTable(climbGroupRelationId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("climbGroupEvent/{eventId}")]
        public async Task<IActionResult> DeleteClimbGroupEvent(string eventId)
        {
            try
            {
                await _databaseService.DeleteFromClimbGroupEventTable(eventId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("badge/{badgeId}")]
        public async Task<IActionResult> DeleteBadge(string badgeId)
        {
            try
            {
                await _databaseService.DeleteFromBadgeTable(badgeId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("badgeRelation/{badgeRelationId}")]
        public async Task<IActionResult> DeleteBadgeRelation(string badgeRelationId)
        {
            try
            {
                await _databaseService.DeleteFromBadgeRelationTable(badgeRelationId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // Update methods for updating data in the database

        [HttpPut("user/{userId}")]
        public async Task<IActionResult> UpdateUser(string userId, [FromBody] User user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.UpdateUser(userId, user);
                return Ok(new { message = "User updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("review/{reviewId}")]
        public async Task<IActionResult> UpdateReview(string reviewId, [FromBody] Review review)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.UpdateReview(reviewId, review);
                return Ok(new { message = "Review updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("climbGroup/{climbGroupId}")]
        public async Task<IActionResult> UpdateClimbGroup(string climbGroupId, [FromBody] ClimbGroup climbGroup)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.UpdateClimbGroup(climbGroupId, climbGroup);
                return Ok(new { message = "Climb group updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("climbGroupRelation/{climbGroupRelationId}")]
        public async Task<IActionResult> UpdateClimbGroupRelation(string climbGroupRelationId, [FromBody] ClimbGroupRelation climbGroupRelation)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.UpdateClimbGroupRelation(climbGroupRelationId, climbGroupRelation);
                return Ok(new { message = "Climb group relation updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("climbGroupEvent/{eventId}")]
        public async Task<IActionResult> UpdateClimbGroupEvent(string eventId, [FromBody] ClimbGroupEvent climbGroupEvent)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.UpdateClimbGroupEvent(eventId, climbGroupEvent);
                return Ok(new { message = "Climb group event updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("badge/{badgeId}")]
        public async Task<IActionResult> UpdateBadge(string badgeId, [FromBody] Badge badge)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.UpdateBadge(badgeId, badge);
                return Ok(new { message = "Badge updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("badgeRelation/{badgeRelationId}")]
        public async Task<IActionResult> UpdateBadgeRelation(string badgeRelationId, [FromBody] BadgeRelation badgeRelation)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.UpdateBadgeRelation(badgeRelationId, badgeRelation);
                return Ok(new { message = "Badge relation updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}

namespace BoulderBuddyAPI.Services
{
    public interface IDatabaseService
    {

        //methods for inserting data into the database
        Task InsertIntoUserTable(object parameters);
        Task InsertIntoUserRelationTable(object parameters);
        Task InsertIntoReviewTable(object parameters);
        Task InsertIntoClimbGroupTable(object parameters);
        Task InsertIntoClimbGroupRelationTable(object parameters);
        Task InsertIntoClimbGroupEventTable(object parameters);
        Task InsertIntoBadgeTable(object parameters);
        Task InsertIntoBadgeRelationTable(object parameters);

        //methods for deleteing data from the database
        Task DeleteFromUserTable(string userId);
        Task DeleteFromUserRelationTable(string userRelationId);
        Task DeleteFromReviewTable(string reviewId);
        Task DeleteFromClimbGroupTable(string climbGroupId);
        Task DeleteFromClimbGroupRelationTable(string climbGroupRelationId);
        Task DeleteFromClimbGroupEventTable(string eventId);
        Task DeleteFromBadgeTable(string badgeId);
        Task DeleteFromBadgeRelationTable(string badgeRelationId);

        //methods for updating data in the database
        Task UpdateUser(string userId, object parameters);
        Task UpdateReview(string reviewId, object parameters);
        Task UpdateClimbGroup(string climbGroupId, object parameters);
        Task UpdateClimbGroupRelation(string climbGroupRelationId, object parameters);
        Task UpdateClimbGroupEvent(string eventId, object parameters);
        Task UpdateBadge(string badgeId, object parameters);
        Task UpdateBadgeRelation(string badgeRelationId, object parameters);

        //methods for getting data from the database
        Task<List<User>> GetUsers();
        Task<List<Review>> GetReviews();
        Task<List<Review>> GetTenReviews(string RouteID);
        Task<List<SingleItemWrapper<double>>> GetAvgReview(string RouteID);
        Task<List<UserRelation>> GetUserRelations();
        Task<List<ClimbGroup>> GetClimbGroups();
        Task<List<ClimbGroupRelation>> GetClimbGroupRelations();
        Task<List<ClimbGroupEvent>> GetClimbGroupEvents();
        Task<List<Badge>> GetBadges();
        Task<List<BadgeRelation>> GetBadgeRelations();
    }
}
