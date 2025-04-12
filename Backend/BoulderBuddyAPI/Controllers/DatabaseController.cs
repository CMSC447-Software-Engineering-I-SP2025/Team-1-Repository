using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Text.Json;
using BoulderBuddyAPI.Models;
using BoulderBuddyAPI.Services;
using Microsoft.Extensions.Configuration;
using System;

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

        [HttpPost("route")]
        public async Task<IActionResult> PostRoute([FromBody] Route route)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.InsertIntoRouteTable(route);
                return Ok(new { message = "Route created successfully" });
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

        [HttpPost("recommendation")]
        public async Task<IActionResult> PostRecommendation([FromBody] Recommendation recommendation)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _databaseService.InsertIntoRecommendationTable(recommendation);
                return Ok(new { message = "Recommendation created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

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

        [HttpGet("route")]
        public async Task<IActionResult> GetRoutes()
        {
            try
            {
                var routes = await _databaseService.GetRoutes();
                return Ok(routes);
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

        [HttpGet("recommendation")]
        public async Task<IActionResult> GetRecommendations()
        {
            try
            {
                var recommendations = await _databaseService.GetRecommendations();
                return Ok(recommendations);
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

        private async Task<IActionResult> HandleGetRequest<T>(string selectCommand)
        {
            try
            {
                using (SqliteConnection connection = new SqliteConnection(_configuration.GetConnectionString("DefaultConnection")))
                {
                    await connection.OpenAsync();
                    using (SqliteCommand command = connection.CreateCommand())
                    {
                        command.CommandText = selectCommand;
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            var items = new List<T>();
                            while (await reader.ReadAsync())
                            {
                                var item = Activator.CreateInstance<T>();
                                PopulateItem(reader, item);
                                items.Add(item);
                            }
                            return Ok(items);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        private void PopulateItem<T>(SqliteDataReader reader, T item)
        {
            foreach (var property in typeof(T).GetProperties())
            {
                var value = reader[property.Name.ToLower()];
                property.SetValue(item, value == DBNull.Value ? null : value);
            }
        }
    }
}



namespace BoulderBuddyAPI.Services
{
    public interface IDatabaseService
    {
        Task InsertIntoUserTable(object parameters);
        Task InsertIntoRouteTable(object parameters);
        Task InsertIntoReviewTable(object parameters);
        Task InsertIntoRecommendationTable(object parameters);
        Task<List<User>> GetUsers();
        Task<List<Route>> GetRoutes();
        Task<List<Review>> GetReviews();
        Task<List<Review>> GetTenReviews(string RouteID);
        Task<List<Recommendation>> GetRecommendations();
        Task<List<UserRelation>> GetUserRelations();
        Task<List<ClimbGroup>> GetClimbGroups();
        Task<List<ClimbGroupRelation>> GetClimbGroupRelations();
        Task<List<ClimbGroupEvent>> GetClimbGroupEvents();
        Task<List<Badge>> GetBadges();
        Task<List<BadgeRelation>> GetBadgeRelations();
    }
}
