using Xunit;
using Microsoft.Data.Sqlite;
using BoulderBuddyAPI.Services;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace BoulderBuddyAPI.Tests.Controllers
{
    public class DatabaseInitializerTests
    {
        private readonly SqliteConnection _sqliteConnection;
        private readonly DatabaseService _databaseService;
        private readonly DatabaseInitializer _databaseInitializer;

        public DatabaseInitializerTests()
        {
            // Set up an in-memory SQLite database with shared cache
            _sqliteConnection = new SqliteConnection("DataSource=:memory:;Mode=Memory;Cache=Shared");
            _sqliteConnection.Open();

            // Initialize the DatabaseService with the in-memory connection
            _databaseService = new DatabaseService(_sqliteConnection);

            // Use a dictionary to simulate configuration for testing
            var inMemorySettings = new Dictionary<string, string>
            {
                { "ConnectionStrings:DefaultConnection", "DataSource=:memory:;Mode=Memory;Cache=Shared" }
            };

            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            // Initialize the DatabaseInitializer with the test configuration
            _databaseInitializer = new DatabaseInitializer(configuration);
        }

        [Fact]
        public void Initialize_CreatesTablesSuccessfully()
        {
            // Act
            _databaseInitializer.Initialize();

            // Assert
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='User';";
                var result = command.ExecuteScalar();
                Assert.NotNull(result); // Ensure the 'User' table was created
            }
        }

        [Fact]
        public async Task ExecuteInsertCommand_AllowsDataInsertion()
        {
            // Arrange
            _databaseInitializer.Initialize();

            var user = new
            {
                UserId = Guid.NewGuid().ToString(),
                FirstName = "Test",
                LastName = "User",
                Email = "test@example.com",
                PhoneNumber = "1234567890",
                BoulderGradeLowerLimit = "V0",
                BoulderGradeUpperLimit = "V5",
                RopeClimberLowerLimit = "5.8",
                RopeClimberUpperLimit = "5.12",
                Bio = "Climbing enthusiast"
            };

            var commandText = @"
                INSERT INTO User (UserId, FirstName, LastName, Email, PhoneNumber, BoulderGradeLowerLimit, BoulderGradeUpperLimit, RopeClimberLowerLimit, RopeClimberUpperLimit, Bio) 
                VALUES (@UserId, @FirstName, @LastName, @Email, @PhoneNumber, @BoulderGradeLowerLimit, @BoulderGradeUpperLimit, @RopeClimberLowerLimit, @RopeClimberUpperLimit, @Bio);";

            // Act
            await _databaseService.ExecuteInsertCommand(_sqliteConnection, commandText, user);

            // Assert
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "SELECT COUNT(*) FROM User WHERE UserId = @UserId;";
                command.Parameters.AddWithValue("@UserId", user.UserId);
                var result = (long)(command.ExecuteScalar() ?? 0);
                Assert.Equal(1, result); // Ensure the user was inserted
            }
        }

        [Fact]
        public async Task ExecuteUpdateCommand_UpdatesDataSuccessfully()
        {
            // Arrange
            _databaseInitializer.Initialize();
            var user = new
            {
                UserId = "1",
                FirstName = "Test",
                LastName = "User",
                Email = "test@example.com",
                PhoneNumber = "1234567890",
                BoulderGradeLowerLimit = "V0",
                BoulderGradeUpperLimit = "V5",
                RopeClimberLowerLimit = "5.8",
                RopeClimberUpperLimit = "5.12",
                Bio = "Climbing enthusiast"
            };

            var insertCommandText = @"
                INSERT INTO User (UserId, FirstName, LastName, Email, PhoneNumber, BoulderGradeLowerLimit, BoulderGradeUpperLimit, RopeClimberLowerLimit, RopeClimberUpperLimit, Bio) 
                VALUES (@UserId, @FirstName, @LastName, @Email, @PhoneNumber, @BoulderGradeLowerLimit, @BoulderGradeUpperLimit, @RopeClimberLowerLimit, @RopeClimberUpperLimit, @Bio);";
            await _databaseService.ExecuteInsertCommand(_sqliteConnection, insertCommandText, user);

            var updateCommandText = @"
                UPDATE User 
                SET FirstName = @FirstName, LastName = @LastName, Email = @Email 
                WHERE UserId = @UserId;";
            var updatedUser = new { UserId = "1", FirstName = "Updated", LastName = "User", Email = "updated@example.com" };

            // Act
            await _databaseService.ExecuteUpdateCommand(_sqliteConnection, updateCommandText, updatedUser);

            // Assert
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "SELECT FirstName, LastName, Email FROM User WHERE UserId = '1';";
                using (var reader = command.ExecuteReader())
                {
                    Assert.True(reader.Read());
                    Assert.Equal("Updated", reader["FirstName"]);
                    Assert.Equal("User", reader["LastName"]);
                    Assert.Equal("updated@example.com", reader["Email"]);
                }
            }
        }

        [Fact]
        public async Task ExecuteSelectCommand_RetrievesDataSuccessfully()
        {
            // Arrange
            _databaseInitializer.Initialize();
            var user = new
            {
                UserId = "12",
                FirstName = "Test",
                LastName = "User",
                Email = "test@example.com",
                PhoneNumber = "1234567890",
                BoulderGradeLowerLimit = "V0",
                BoulderGradeUpperLimit = "V5",
                RopeClimberLowerLimit = "5.8",
                RopeClimberUpperLimit = "5.12",
                Bio = "Climbing enthusiast"
            };

            var insertCommandText = @"
                INSERT INTO User (UserId, FirstName, LastName, Email, PhoneNumber, BoulderGradeLowerLimit, BoulderGradeUpperLimit, RopeClimberLowerLimit, RopeClimberUpperLimit, Bio) 
                VALUES (@UserId, @FirstName, @LastName, @Email, @PhoneNumber, @BoulderGradeLowerLimit, @BoulderGradeUpperLimit, @RopeClimberLowerLimit, @RopeClimberUpperLimit, @Bio);";
            await _databaseService.ExecuteInsertCommand(_sqliteConnection, insertCommandText, user);

            var selectCommandText = "SELECT * FROM User WHERE UserId = @UserId;";

            // Act
            var users = await _databaseService.ExecuteSelectCommand<User>(_sqliteConnection, selectCommandText, new { UserId = "12" });

            // Assert
            Assert.Single(users);
            Assert.Equal("12", users[0].UserId);
            Assert.Equal("Test", users[0].FirstName);
            Assert.Equal("User", users[0].LastName);
            Assert.Equal("test@example.com", users[0].Email);
        }

        [Fact]
        public void Initialize_ValidatesUserTableSchema()
        {
            // Act
            _databaseInitializer.Initialize();

            // Assert
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "PRAGMA table_info(User);";
                using (var reader = command.ExecuteReader())
                {
                    var columns = new List<string>();
                    while (reader.Read())
                    {
                        columns.Add(reader["name"].ToString());
                    }
                    Assert.Contains("UserId", columns);
                    Assert.Contains("FirstName", columns);
                    Assert.Contains("LastName", columns);
                    Assert.Contains("Email", columns);
                    Assert.Contains("PhoneNumber", columns);
                    Assert.Contains("BoulderGradeLowerLimit", columns);
                    Assert.Contains("BoulderGradeUpperLimit", columns);
                    Assert.Contains("RopeClimberLowerLimit", columns);
                    Assert.Contains("RopeClimberUpperLimit", columns);
                    Assert.Contains("Bio", columns);
                }
            }
        }

        [Fact]
        public void Initialize_ValidatesReviewTableSchema()
        {
            // Act
            _databaseInitializer.Initialize();

            // Assert
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "PRAGMA table_info(Review);";
                using (var reader = command.ExecuteReader())
                {
                    var columns = new List<string>();
                    while (reader.Read())
                    {
                        columns.Add(reader["name"].ToString());
                    }
                    Assert.Contains("ReviewId", columns);
                    Assert.Contains("UserId", columns);
                    Assert.Contains("RouteId", columns);
                    Assert.Contains("Rating", columns);
                    Assert.Contains("Text", columns);
                }
            }
        }

        [Fact]
        public void Initialize_ValidatesUserRelationTableSchema()
        {
            // Act
            _databaseInitializer.Initialize();

            // Assert
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "PRAGMA table_info(UserRelation);";
                using (var reader = command.ExecuteReader())
                {
                    var columns = new List<string>();
                    while (reader.Read())
                    {
                        columns.Add(reader["name"].ToString());
                    }
                    Assert.Contains("User1Id", columns);
                    Assert.Contains("User2Id", columns);
                    Assert.Contains("RelationType", columns);
                    Assert.Contains("RequestDate", columns);
                    Assert.Contains("FriendSince", columns);
                }
            }
        }

        [Fact]
        public void Initialize_ValidatesClimbGroupTableSchema()
        {
            // Act
            _databaseInitializer.Initialize();

            // Assert
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "PRAGMA table_info(ClimbGroup);";
                using (var reader = command.ExecuteReader())
                {
                    var columns = new List<string>();
                    while (reader.Read())
                    {
                        columns.Add(reader["name"].ToString());
                    }
                    Assert.Contains("GroupId", columns);
                    Assert.Contains("GroupName", columns);
                    Assert.Contains("GroupDescription", columns);
                    Assert.Contains("JoinRequirements", columns);
                    Assert.Contains("Price", columns);
                    Assert.Contains("GroupType", columns);
                    Assert.Contains("GroupOwner", columns);
                    Assert.Contains("GroupImage", columns);
                }
            }
        }

        [Fact]
        public void Initialize_ValidatesClimbGroupRelationTableSchema()
        {
            // Act
            _databaseInitializer.Initialize();

            // Assert
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "PRAGMA table_info(ClimbGroupRelation);";
                using (var reader = command.ExecuteReader())
                {
                    var columns = new List<string>();
                    while (reader.Read())
                    {
                        columns.Add(reader["name"].ToString());
                    }
                    Assert.Contains("GroupId", columns);
                    Assert.Contains("UserId", columns);
                    Assert.Contains("RelationType", columns);
                    Assert.Contains("InviteDate", columns);
                    Assert.Contains("MemberSince", columns);
                }
            }
        }

        [Fact]
        public void Initialize_ValidatesClimbGroupEventTableSchema()
        {
            // Act
            _databaseInitializer.Initialize();

            // Assert
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "PRAGMA table_info(ClimbGroupEvent);";
                using (var reader = command.ExecuteReader())
                {
                    var columns = new List<string>();
                    while (reader.Read())
                    {
                        columns.Add(reader["name"].ToString());
                    }
                    Assert.Contains("EventId", columns);
                    Assert.Contains("GroupId", columns);
                    Assert.Contains("EventName", columns);
                    Assert.Contains("EventDescription", columns);
                    Assert.Contains("EventDate", columns);
                    Assert.Contains("EventTime", columns);
                    Assert.Contains("EventLocation", columns);
                    Assert.Contains("EventImage", columns);
                }
            }
        }

        [Fact]
        public void Initialize_ValidatesBadgeTableSchema()
        {
            // Act
            _databaseInitializer.Initialize();

            // Assert
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "PRAGMA table_info(Badge);";
                using (var reader = command.ExecuteReader())
                {
                    var columns = new List<string>();
                    while (reader.Read())
                    {
                        columns.Add(reader["name"].ToString());
                    }
                    Assert.Contains("BadgeId", columns);
                    Assert.Contains("BadgeName", columns);
                    Assert.Contains("BadgeDescription", columns);
                    Assert.Contains("BadgeRequirement", columns);
                    Assert.Contains("BadgeRarity", columns);
                    Assert.Contains("BadgeImage", columns);
                }
            }
        }

        [Fact]
        public void Initialize_ValidatesBadgeRelationTableSchema()
        {
            // Act
            _databaseInitializer.Initialize();

            // Assert
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "PRAGMA table_info(BadgeRelation);";
                using (var reader = command.ExecuteReader())
                {
                    var columns = new List<string>();
                    while (reader.Read())
                    {
                        columns.Add(reader["name"].ToString());
                    }
                    Assert.Contains("UserId", columns);
                    Assert.Contains("BadgeId", columns);
                }
            }
        }

        [Fact]
        public void Initialize_CreatesAllTables()
        {
            // Act
            _databaseInitializer.Initialize();

            // Assert
            var tables = new[] { "User", "Review", "UserRelation", "ClimbGroup", "ClimbGroupRelation", "ClimbGroupEvent", "Badge", "BadgeRelation" };
            foreach (var table in tables)
            {
                using (var command = _sqliteConnection.CreateCommand())
                {
                    command.CommandText = $"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}';";
                    var result = command.ExecuteScalar();
                    Assert.NotNull(result); // Ensure the table was created
                }
            }
        }

        [Fact]
        public void Initialize_EnforcesForeignKeyConstraints()
        {
            // Act
            _databaseInitializer.Initialize();

            // Assert
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "PRAGMA foreign_keys;";
                var result = command.ExecuteScalar();
                Assert.Equal(1, Convert.ToInt32(result)); // Ensure foreign key constraints are enabled
            }
        }

        [Fact]
        public async Task Initialize_EnforcesBadgeRarityCheckConstraint()
        {
            // Arrange
            _databaseInitializer.Initialize();

            var invalidBadge = new
            {
                BadgeName = "Invalid Badge",
                BadgeDescription = "This badge has an invalid rarity",
                BadgeRequirement = "Complete 10 climbs",
                BadgeRarity = "invalid", // Invalid value
                BadgeImage = new byte[0]
            };

            var commandText = @"
                INSERT INTO Badge (BadgeName, BadgeDescription, BadgeRequirement, BadgeRarity, BadgeImage) 
                VALUES (@BadgeName, @BadgeDescription, @BadgeRequirement, @BadgeRarity, @BadgeImage);";

            // Act & Assert
            await Assert.ThrowsAsync<SqliteException>(async () =>
            {
                await _databaseService.ExecuteInsertCommand(_sqliteConnection, commandText, invalidBadge);
            });
        }

        [Fact]
        public async Task Initialize_EnforcesOnDeleteCascade()
        {
            // Arrange
            _databaseInitializer.Initialize();

            var user = new { UserId = "user1", FirstName = "Test", LastName = "User", Email = "test@example.com" };
            var review = new { ReviewId = 1, UserId = "user1", RouteId = "route1", Rating = 5, Text = "Great route!" };

            await _databaseService.ExecuteInsertCommand(_sqliteConnection, "INSERT INTO User (UserId, FirstName, LastName, Email) VALUES (@UserId, @FirstName, @LastName, @Email);", user);
            await _databaseService.ExecuteInsertCommand(_sqliteConnection, "INSERT INTO Review (ReviewId, UserId, RouteId, Rating, Text) VALUES (@ReviewId, @UserId, @RouteId, @Rating, @Text);", review);

            // Act
            await _databaseService.ExecuteDeleteCommand(_sqliteConnection, "DELETE FROM User WHERE UserId = @UserId;", new { UserId = "user1" });

            // Assert
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "SELECT COUNT(*) FROM Review WHERE UserId = 'user1';";
                var result = (long)(command.ExecuteScalar() ?? 0);
                Assert.Equal(0, result); // Ensure the review was deleted
            }
        }

        [Fact]
        public void Initialize_DoesNotDuplicateTables()
        {
            // Act
            _databaseInitializer.Initialize();
            _databaseInitializer.Initialize(); // Run it again

            // Assert
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='User';";
                var result = (long)(command.ExecuteScalar() ?? 0);
                Assert.Equal(1, result); // Ensure the table exists only once
            }
        }
    }
}