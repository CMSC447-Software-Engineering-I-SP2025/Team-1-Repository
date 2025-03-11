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
        private readonly DatabaseService _databaseService;
        private readonly string connectionString;

        public DatabaseController(DatabaseService databaseService, IConfiguration configuration)
        {
            _databaseService = databaseService;
            connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
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
                await _databaseService.InsertIntoRoutesTable(route);
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
                await _databaseService.InsertIntoReviewsTable(review);
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
                await _databaseService.InsertIntoRecommendationsTable(recommendation);
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
            return await HandleGetRequest<User>("SELECT * FROM User");
        }

        [HttpGet("route")]
        public async Task<IActionResult> GetRoutes()
        {
            return await HandleGetRequest<Route>("SELECT * FROM Routes");
        }

        [HttpGet("review")]
        public async Task<IActionResult> GetReviews()
        {
            return await HandleGetRequest<Review>("SELECT * FROM Reviews");
        }

        [HttpGet("userRelation")]
        public async Task<IActionResult> GetUserRelations()
        {
            return await HandleGetRequest<UserRelation>("SELECT * FROM UserRelation");
        }

        [HttpGet("climbGroup")]
        public async Task<IActionResult> GetClimbGroups()
        {
            return await HandleGetRequest<ClimbGroup>("SELECT * FROM ClimbGroup");
        }

        [HttpGet("climbGroupRelation")]
        public async Task<IActionResult> GetClimbGroupRelations()
        {
            return await HandleGetRequest<ClimbGroupRelation>("SELECT * FROM ClimbGroupRelation");
        }

        [HttpGet("climbGroupEvent")]
        public async Task<IActionResult> GetClimbGroupEvents()
        {
            return await HandleGetRequest<ClimbGroupEvent>("SELECT * FROM ClimbGroupEvent");
        }

        [HttpGet("badge")]
        public async Task<IActionResult> GetBadges()
        {
            return await HandleGetRequest<Badge>("SELECT * FROM Badge");
        }

        [HttpGet("badgeRelation")]
        public async Task<IActionResult> GetBadgeRelations()
        {
            return await HandleGetRequest<BadgeRelation>("SELECT * FROM BadgeRelation");
        }

        private async Task<IActionResult> HandleGetRequest<T>(string selectCommand)
        {
            try
            {
                using (SqliteConnection connection = new SqliteConnection(connectionString))
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
