using Xunit;
using BoulderBuddyAPI.Services;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BoulderBuddyAPI.Tests.Services
{
    public class DatabaseServiceTests : IDisposable
    {
        private readonly SqliteConnection _sqliteConnection;
        private readonly DatabaseService _databaseService;

        public DatabaseServiceTests()
        {
            var inMemorySettings = new Dictionary<string, string>
            {
                { "ConnectionStrings:DefaultConnection", "DataSource=:memory:;Mode=Memory;Cache=Shared" }
            };

            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            _sqliteConnection = new SqliteConnection(configuration.GetConnectionString("DefaultConnection"));
            _sqliteConnection.Open();

            _databaseService = new DatabaseService(configuration);

            InitializeDatabaseSchema();
        }

        private void InitializeDatabaseSchema()
        {
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = @"
                    CREATE TABLE User (
                        UserId TEXT PRIMARY KEY,
                        UserName TEXT NOT NULL,
                        ProfileImage BLOB,
                        FirstName TEXT,
                        LastName TEXT,
                        Email TEXT,
                        PhoneNumber TEXT,
                        BoulderGradeLowerLimit TEXT,
                        BoulderGradeUpperLimit TEXT,
                        RopeClimberLowerLimit TEXT,
                        RopeClimberUpperLimit TEXT,
                        Bio TEXT
                    );

                    CREATE TABLE Review (
                        ReviewId INTEGER PRIMARY KEY AUTOINCREMENT,
                        UserId TEXT NOT NULL,
                        RouteId TEXT NOT NULL,
                        Rating INTEGER NOT NULL,
                        Text TEXT,
                        FOREIGN KEY (UserId) REFERENCES User(UserId)
                    );

                    CREATE TABLE ClimbGroup (
                        GroupId TEXT PRIMARY KEY,
                        GroupName TEXT NOT NULL,
                        GroupDescription TEXT,
                        JoinRequirements TEXT,
                        Price REAL,
                        GroupType TEXT,
                        GroupOwner TEXT,
                        GroupImage BLOB
                    );
                ";
                command.ExecuteNonQuery();
            }
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
            ClearTable("User");

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

            await _databaseService.InsertIntoUserTable(parameters);

            var query = "SELECT COUNT(*) FROM User WHERE UserId = @UserId";
            var count = await _databaseService.ExecuteQueryCommand<long>(query, new { UserId = "testuser1" });
            Assert.Equal(1, Convert.ToInt32(count));
        }

        [Fact]
        public async Task InsertIntoReviewTable_InsertsSuccessfully()
        {
            ClearTable("Review");
            ClearTable("User");

            var user = new
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
            await _databaseService.InsertIntoUserTable(user);

            var review = new
            {
                UserId = "testuser1",
                RouteId = "route1",
                Rating = 5,
                Text = "Great route!"
            };
            await _databaseService.InsertIntoReviewTable(review);

            var query = "SELECT COUNT(*) FROM Review WHERE UserId = @UserId AND RouteId = @RouteId";
            var count = await _databaseService.ExecuteQueryCommand<long>(query, new { UserId = "testuser1", RouteId = "route1" });
            Assert.Equal(1, Convert.ToInt32(count));
        }

        [Fact]
        public async Task GetUsers_ReturnsCorrectData()
        {
            ClearTable("User");

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

            var users = await _databaseService.GetUsers();

            Assert.Single(users);
            Assert.Equal("TestUser", users[0].UserName);
        }

        [Fact]
        public async Task InsertIntoClimbGroupTable_InsertsSuccessfully()
        {
            ClearTable("ClimbGroup");

            var parameters = new
            {
                GroupId = "group1",
                GroupName = "Test Group",
                GroupDescription = "A group for testing",
                JoinRequirements = "None",
                Price = 0.0,
                GroupType = "Public",
                GroupOwner = "testuser1",
                GroupImage = (byte[])null
            };

            await _databaseService.InsertIntoClimbGroupTable(parameters);

            var query = "SELECT COUNT(*) FROM ClimbGroup WHERE GroupId = @GroupId";
            var count = await _databaseService.ExecuteQueryCommand<long>(query, new { GroupId = "group1" });
            Assert.Equal(1, Convert.ToInt32(count));
        }

        [Fact]
        public async Task GetUsers_ReturnsEmptyList_WhenNoUsersExist()
        {
            ClearTable("User");

            var users = await _databaseService.GetUsers();

            Assert.Empty(users);
        }

        [Fact]
        public async Task InsertIntoUserTable_HandlesMissingOptionalFields()
        {
            ClearTable("User");

            var parameters = new
            {
                UserId = "testuser2",
                UserName = "testusername2",
                ProfileImage = (byte[])null,
                FirstName = (string)null,
                LastName = (string)null,
                Email = "testuser2@example.com",
                PhoneNumber = "9876543210",
                BoulderGradeLowerLimit = "V1",
                BoulderGradeUpperLimit = "V6",
                RopeClimberLowerLimit = "5.9",
                RopeClimberUpperLimit = "5.13",
                Bio = (string)null
            };

            await _databaseService.InsertIntoUserTable(parameters);

            var query = "SELECT COUNT(*) FROM User WHERE UserId = @UserId";
            var count = await _databaseService.ExecuteQueryCommand<long>(query, new { UserId = "testuser2" });
            Assert.Equal(1, Convert.ToInt32(count));
        }

        [Fact]
        public async Task InsertDuplicatePrimaryKey_ThrowsException()
        {
            ClearTable("User");

            var parameters = new
            {
                UserId = "duplicateuser",
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

            await _databaseService.InsertIntoUserTable(parameters);

            await Assert.ThrowsAsync<SqliteException>(async () =>
            {
                await _databaseService.InsertIntoUserTable(parameters);
            });
        }

        [Fact]
        public async Task ExecuteSelectCommand_ReturnsCorrectData()
        {
            ClearTable("User");

            var parameters = new
            {
                UserId = "selectuser",
                UserName = "SelectTestUser",
                ProfileImage = (byte[])null,
                FirstName = "Select",
                LastName = "User",
                Email = "selectuser@example.com",
                PhoneNumber = "1234567890",
                BoulderGradeLowerLimit = "V0",
                BoulderGradeUpperLimit = "V5",
                RopeClimberLowerLimit = "5.10",
                RopeClimberUpperLimit = "5.12",
                Bio = "Test bio"
            };

            await _databaseService.InsertIntoUserTable(parameters);

            var users = await _databaseService.ExecuteSelectCommand<User>("SELECT * FROM User WHERE UserId = @UserId", new { UserId = "selectuser" });

            Assert.Single(users);
            Assert.Equal("SelectTestUser", users[0].UserName);
        }

        public void Dispose()
        {
            _sqliteConnection?.Dispose();
        }
    }
}