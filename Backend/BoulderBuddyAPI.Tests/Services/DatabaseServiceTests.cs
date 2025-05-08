using Xunit;
using BoulderBuddyAPI.Services;
using Microsoft.Data.Sqlite;
using System;
using System.Threading.Tasks;

namespace BoulderBuddyAPI.Tests.Services
{
    public class DatabaseServiceTests : IDisposable
    {
        private readonly SqliteConnection _sqliteConnection;
        private readonly DatabaseService _databaseService;

        public DatabaseServiceTests()
        {
            // Use the file-based SQLite database
            _sqliteConnection = new SqliteConnection("Data Source=boulderbuddy.db");
            _sqliteConnection.Open();

            // Initialize the DatabaseService with the file-based connection
            _databaseService = new DatabaseService(_sqliteConnection);
        }

        private void ClearTable(string tableName)
        {
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = $"DELETE FROM {tableName};";
                command.ExecuteNonQuery();
            }
        }

        [Fact]
        public async Task InsertIntoUserTable_InsertsSuccessfully()
        {
            // Clear the table before running the test
            ClearTable("User");

            // Arrange
            var parameters = new
            {
                UserId = "testuser1",
                UserName = "testusername",
                ProfileImage = (byte[])null,
                FirstName = "Test",
                LastName = "User",
                Email = "testuser@example.com",
                PhoneNumber = "1234567890",
                BoulderGradeLowerLimit = "V0",
                BoulderGradeUpperLimit = "V5",
                RopeClimberLowerLimit = "5.8",
                RopeClimberUpperLimit = "5.12",
                Bio = "Climbing enthusiast"
            };

            // Act
            await _databaseService.InsertIntoUserTable(parameters);

            // Assert
            var query = "SELECT COUNT(*) FROM User WHERE UserId = @UserId";
            var count = await _databaseService.ExecuteQueryCommand<int>(query, new { UserId = "testuser1" });
            Assert.Equal(1, count);
        }

        [Fact]
        public async Task InsertIntoReviewTable_InsertsSuccessfully()
        {
            var review = new
            {
                UserId = "testuser1",
                RouteId = "route1",
                Rating = 5,
                Text = "Great route!"
            };

            await _databaseService.InsertIntoReviewTable(review);

            // Verify the review was inserted
            var query = "SELECT COUNT(*) FROM Review WHERE UserId = @UserId AND RouteId = @RouteId";
            var count = await _databaseService.ExecuteQueryCommand<int>(query, new { UserId = "testuser1", RouteId = "route1" });
            Assert.Equal(1, count);
        }

        [Fact]
        public async Task GetUsers_ReturnsCorrectData()
        {
            // Clear the table before running the test
            ClearTable("User");

            // Arrange: Insert a record
            var parameters = new
            {
                UserId = "1",
                UserName = "TestUser",
                ProfileImage = "image.png",
                FirstName = "Test",
                LastName = "User",
                Email = "test@example.com",
                PhoneNumber = "1234567890",
                BoulderGradeLowerLimit = "V0",
                BoulderGradeUpperLimit = "V5",
                RopeClimberLowerLimit = "5.10",
                RopeClimberUpperLimit = "5.12",
                Bio = "Test bio"
            };
            await _databaseService.InsertIntoUserTable(parameters);

            // Act
            var users = await _databaseService.GetUsers();

            // Assert
            Assert.Single(users);
            Assert.Equal("TestUser", users[0].UserName);
        }

        public void Dispose()
        {
            // Dispose of the SQLite connection after each test
            _sqliteConnection?.Dispose();
        }
    }
}