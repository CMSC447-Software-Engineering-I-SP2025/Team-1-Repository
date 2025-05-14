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
                await _databaseService.InsertIntoUserTable(new
                {
                    user.UserId,
                    user.UserName,
                    user.ProfileImage, 
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    user.PhoneNumber,
                    user.BoulderGradeLowerLimit,
                    user.BoulderGradeUpperLimit,
                    user.RopeClimberLowerLimit,
                    user.RopeClimberUpperLimit,
                    user.Bio
                });
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

        // POST: Add a new picture
        [HttpPost("picture")]
        public async Task<IActionResult> AddPicture([FromBody] Picture picture)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.AddPicture(new
                {
                    picture.UserId,
                    picture.RouteId,
                    picture.Image
                });
                return Ok(new { message = "Picture added successfully" });
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
        // GET: Get a user by ID
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserById(string userId)
        {
            try
            {
                var user = await _databaseService.GetUserById(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }
                return Ok(user);
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

        [HttpGet("userRelations/{userId}")]
        public async Task<IActionResult> GetUserRelationsForUser(string userId)
        {
            try
            {
                Console.WriteLine($"Fetching user relations for userId: {userId}");
                var userRelations = await _databaseService.GetUserRelationsForUser(userId);
                Console.WriteLine($"Fetched {userRelations.Count} user relations.");
                return Ok(userRelations);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching user relations: {ex.Message}");
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

        [HttpGet("groupMembers/{groupId}")]
        public async Task<IActionResult> GetGroupMembers(string groupId)
        {
            try
            {
                var members = await _databaseService.GetGroupMembers(groupId);
                return Ok(members);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("groupsByUser/{userId}")]
        public async Task<IActionResult> GetGroupsByUserId(string userId)
        {
            try
            {
                var groups = await _databaseService.GetGroupsByUserId(userId);
                return Ok(groups);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("reviewsByUser/{userId}")]
        public async Task<IActionResult> GetReviewsByUserId(string userId)
        {
            try
            {
                var reviews = await _databaseService.GetReviewsByUserId(userId);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("group/{groupId}/events")]
        public async Task<IActionResult> GetEventsByGroupId(string groupId)
        {
            try
            {
                var events = await _databaseService.GetEventsByGroupId(groupId);
                return Ok(events);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("route/{routeId}/pictures")]
        public async Task<IActionResult> GetPicturesByRouteId(string routeId)
        {
            try
            {
                var pictures = await _databaseService.GetPicturesByRouteId(routeId);
                return Ok(pictures);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("picturesByUser/{userId}")]
        public async Task<IActionResult> GetPicturesByUserId(string userId)
        {
            try
            {
                var pictures = await _databaseService.GetPicturesByUserId(userId);
                if (pictures == null || !pictures.Any())
                {
                    return NotFound(new { message = $"No pictures found for user with ID {userId}." });
                }
                return Ok(pictures);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("groupsOwnedByUser/{userId}")]
        public async Task<IActionResult> GetGroupsOwnedByUser(string userId)
        {
            try
            {
                var groups = await _databaseService.GetGroupsOwnedByUser(userId);
                if (groups == null || !groups.Any())
                {
                    return NotFound(new { message = $"No groups found owned by user with ID {userId}." });
                }
                return Ok(groups);
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

        [HttpDelete("climbGroupRelation/{groupId}/{userId}")]
        public async Task<IActionResult> DeleteClimbGroupRelation(string groupId, string userId)
        {
            try
            {
                await _databaseService.DeleteFromClimbGroupRelationTable(groupId, userId);
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

        // DELETE: Delete a picture by ID
        [HttpDelete("picture/{pictureId}")]
        public async Task<IActionResult> DeletePicture(int pictureId)
        {
            try
            {
                await _databaseService.DeletePicture(pictureId);
                return Ok(new { message = "Picture deleted successfully" });
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
                
                await _databaseService.UpdateUser(userId, new
                {
                    user.UserName,
                    user.ProfileImage, // ProfileImage is now included
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    user.PhoneNumber,
                    user.BoulderGradeLowerLimit,
                    user.BoulderGradeUpperLimit,
                    user.RopeClimberLowerLimit,
                    user.RopeClimberUpperLimit,
                    user.Bio
                });
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
                Console.WriteLine($"Error updating review: {ex.Message}");
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

        // PUT: Update an existing picture
        [HttpPut("picture/{pictureId}")]
        public async Task<IActionResult> UpdatePicture(int pictureId, [FromBody] Picture picture)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.UpdatePicture(pictureId, new
                {
                    picture.UserId,
                    picture.RouteId,
                    picture.Image
                });
                return Ok(new { message = "Picture updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        //Handle Friend Requests

        [HttpPost("sendFriendRequest")]
        public async Task<IActionResult> SendFriendRequest(string receiverUserName, string senderUserId)
        {
            try
            {
                await _databaseService.SendFriendRequest(senderUserId, receiverUserName);
                return Ok(new { message = "Friend request sent successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("acceptFriendRequest")]
        public async Task<IActionResult> AcceptFriendRequest(string senderUserId, string receiverUserId)
        {
            try
            {
                await _databaseService.AcceptFriendRequest(senderUserId, receiverUserId);
                return Ok(new { message = "Friend request accepted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("rejectFriendRequest")]
        public async Task<IActionResult> RejectFriendRequest(string senderUserId, string receiverUserId)
        {
            try
            {
                await _databaseService.RejectFriendRequest(senderUserId, receiverUserId);
                return Ok(new { message = "Friend request rejected successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("joinGroup")]
        public async Task<IActionResult> JoinGroup(string userId, string groupName)
        {
            try
            {
                await _databaseService.JoinGroup(userId, groupName);
                return Ok(new { message = "Successfully joined the group." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
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
        Task AddPicture(object parameters);

        //methods for deleteing data from the database
        Task DeleteFromUserTable(string userId);
        Task DeleteFromReviewTable(string reviewId);
        Task DeleteFromClimbGroupTable(string climbGroupId);
        Task DeleteFromClimbGroupRelationTable(string groupId, string userId);
        Task DeleteFromClimbGroupEventTable(string eventId);
        Task DeleteFromBadgeTable(string badgeId);
        Task DeleteFromBadgeRelationTable(string userId, string badgeId);
        Task DeleteFromUserRelationTable(string userRelationId);
        Task DeletePicture(int pictureId);

        //methods for updating data in the database
        Task UpdateUser(string userId, object parameters);
        Task UpdateReview(string reviewId, object parameters);
        Task UpdateClimbGroup(string climbGroupId, object parameters);
        Task UpdateClimbGroupEvent(string eventId, object parameters);
        Task UpdateBadge(string badgeId, object parameters);
        Task UpdatePicture(int pictureId, object parameters);

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

        //method for getting pictures by user ID
        Task<List<Picture>> GetPicturesByUserId(string userId);

        //methods for handling friend requests
        Task SendFriendRequest(string senderUserId, string receiverUserName);
        Task AcceptFriendRequest(string senderUserId, string receiverUserId);
        Task RejectFriendRequest(string senderUserId, string receiverUserId);

        //method for getting user relations for a specific user
        Task<List<UserRelation>> GetUserRelationsForUser(string userId);

        //method for joining a group
        Task JoinGroup(string userId, string groupName);
        
        //method for getting group members
        Task<List<User>> GetGroupMembers(string groupId);

        //method for getting groups by user ID
        Task<List<ClimbGroup>> GetGroupsByUserId(string userId);

        //method for getting reviews by user ID
        Task<List<Review>> GetReviewsByUserId(string userId);

        //method for getting user by ID
        Task<User> GetUserById(string userId);

        //method for getting events by group ID
        Task<List<ClimbGroupEvent>> GetEventsByGroupId(string groupId);

        //method for getting pictures by route ID
        Task<List<Picture>> GetPicturesByRouteId(string routeId);

        //method for getting groups owned by user ID
        Task<List<ClimbGroup>> GetGroupsOwnedByUser(string userId);
    }
}
