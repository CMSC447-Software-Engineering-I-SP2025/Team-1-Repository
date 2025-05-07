using Xunit;
using Microsoft.Data.Sqlite;
using BoulderBuddyAPI.Services;
using System;
using System.Threading.Tasks;
using Moq;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;

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
                .AddInMemoryCollection(inMemorySettings as IEnumerable<KeyValuePair<string, string?>>)
                .Build();

            // Initialize the DatabaseInitializer with the test configuration
            _databaseInitializer = new DatabaseInitializer(configuration);

            Console.WriteLine($"Using connection string: {_sqliteConnection.ConnectionString}");
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
        public void Initialize_CreatesAllTablesSuccessfully()
        {
            // Act
            _databaseInitializer.Initialize();

            // Assert
            var tables = new[] { "User", "Review", "Badge", "BadgeRelation" }; // Removed 'Route' table
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
        public async Task ExecuteInsertCommand_AllowsDataInsertion()
        {
            // Arrange
            _databaseInitializer.Initialize();

            // Clear the table before running the test
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "DELETE FROM User;";
                command.ExecuteNonQuery();
            }

            var user = new { UserId = Guid.NewGuid().ToString(), Name = "Test User", Email = "test@example.com", Password = "password", AccountType = "public" };

            var commandText = @"
                INSERT INTO User (UserId, Name, Email, Password, AccountType) 
                VALUES (@UserId, @Name, @Email, @Password, @AccountType);";

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
        public async Task ExecuteInsertCommand_ThrowsException_WhenTableDoesNotExist()
        {
            // Arrange
            _databaseInitializer.Initialize();
            var data = new { Id = 1, Name = "Test" };

            var commandText = @"
                INSERT INTO NonExistentTable (Id, Name) 
                VALUES (@Id, @Name);";

            // Act & Assert
            await Assert.ThrowsAsync<SqliteException>(async () =>
            {
                await _databaseService.ExecuteInsertCommand(commandText, data);
            });
        }

        [Fact]
        public async Task ExecuteDeleteCommand_RemovesDataSuccessfully()
        {
            // Arrange
            _databaseInitializer.Initialize();

            // Clear the table before running the test
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "DELETE FROM User;";
                command.ExecuteNonQuery();
            }

            var user = new { UserId = "1", Name = "Test User", Email = "test@example.com", Password = "password", AccountType = "public" };
            await _databaseService.ExecuteInsertCommand(_sqliteConnection, @"
                INSERT INTO User (UserId, Name, Email, Password, AccountType) 
                VALUES (@UserId, @Name, @Email, @Password, @AccountType);", user);

            // Act
            await _databaseService.ExecuteDeleteCommand(_sqliteConnection, "DELETE FROM User WHERE UserId = @UserId;", new { UserId = "1" });

            // Assert
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "SELECT COUNT(*) FROM User WHERE UserId = '1';";
                var result = command.ExecuteScalar() as long? ?? 0;
                Assert.Equal(0, result); // Ensure the user was deleted
            }
        }

        [Fact]
        public async Task ExecuteUpdateCommand_UpdatesDataSuccessfully()
        {
            // Arrange
            _databaseInitializer.Initialize();
            var user = new { UserId = "1", Name = "Test User", Email = "test@example.com", Password = "password", AccountType = "public" };

            var insertCommandText = @"
                INSERT INTO User (UserId, Name, Email, Password, AccountType) 
                VALUES (@UserId, @Name, @Email, @Password, @AccountType);";
            await _databaseService.ExecuteInsertCommand(_sqliteConnection, insertCommandText, user);

            var updateCommandText = @"
                UPDATE User 
                SET Name = @Name, Email = @Email 
                WHERE UserId = @UserId;";
            var updatedUser = new { UserId = "1", Name = "Updated User", Email = "updated@example.com" };

            // Act
            await _databaseService.ExecuteUpdateCommand(_sqliteConnection, updateCommandText, updatedUser);

            // Assert
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "SELECT Name, Email FROM User WHERE UserId = '1';";
                using (var reader = command.ExecuteReader())
                {
                    Assert.True(reader.Read());
                    Assert.Equal("Updated User", reader["Name"]);
                    Assert.Equal("updated@example.com", reader["Email"]);
                }
            }
        }

        [Fact]
        public async Task ExecuteSelectCommand_RetrievesDataSuccessfully()
        {
            // Arrange
            _databaseInitializer.Initialize();
            var user = new User
            {
                UserId = "12",
                Name = "Test User",
                Email = "test@example.com",
                Password = "password",
                AccountType = "public"
            };

            var insertCommandText = @"
                INSERT INTO User (UserId, Name, Email, Password, AccountType) 
                VALUES (@UserId, @Name, @Email, @Password, @AccountType);";
            await _databaseService.ExecuteInsertCommand(_sqliteConnection, insertCommandText, user);

            var selectCommandText = "SELECT * FROM User WHERE UserId = @UserId;";

            // Act
            var users = await _databaseService.ExecuteSelectCommand<User>(_sqliteConnection, selectCommandText, new { UserId = "12" });

            // Assert
            Assert.Single(users);
            Assert.Equal("12", users[0].UserId);
            Assert.Equal("Test User", users[0].Name);
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
                    Assert.Contains("Name", columns);
                    Assert.Contains("Email", columns);
                    Assert.Contains("Password", columns);
                    Assert.Contains("AccountType", columns);
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

        // Removed tests related to the 'Route' table
    }
}