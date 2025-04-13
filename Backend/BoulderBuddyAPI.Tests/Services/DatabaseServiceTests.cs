using Xunit;
using BoulderBuddyAPI.Services;
using Microsoft.Data.Sqlite;
using System;
using System.Threading.Tasks;

namespace BoulderBuddyAPI.Tests.Services
{
    public class DatabaseServiceTestsTest : IDisposable
    {
        private readonly SqliteConnection _sqliteConnection;
        private readonly DatabaseService _service;

        public DatabaseServiceTestsTest()
        {
            // Setup an in-memory SQLite database connection
            _sqliteConnection = new SqliteConnection("Data Source=boulderbuddy.db");
            _sqliteConnection.Open();

            // Initialize the DatabaseService with the same SQLite connection
            _service = new DatabaseService(_sqliteConnection);

            // Create necessary tables for testing
            InitializeDatabase();
        }

        private void InitializeDatabase()
        {
            using (var command = _sqliteConnection.CreateCommand())
            {
                // Create the UserTest table
                command.CommandText = @"
                    CREATE TABLE IF NOT EXISTS UserTest (
                        UserId TEXT PRIMARY KEY,
                        Name TEXT,
                        Email TEXT,
                        Password TEXT,
                        AccountType TEXT
                    );";
                command.ExecuteNonQuery();
            }
        }

        private void ClearUserTestTable()
        {
            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "DELETE FROM UserTest;";
                command.ExecuteNonQuery();
            }
        }

        [Fact]
        public async Task ExecuteInsertCommand_ValidCommand_InsertsRecordSuccessfully()
        {
            // Clear the table before running the test
            ClearUserTestTable();

            // Arrange
            var insertCommand = "INSERT INTO UserTest (UserId, Name) VALUES (@UserId, @Name);";
            var parameters = new { UserId = "1", Name = "Test User" };

            // Act
            await _service.ExecuteInsertCommand(insertCommand, parameters);

            // Assert
            if (_sqliteConnection.State != System.Data.ConnectionState.Open)
            {
                _sqliteConnection.Open(); // Ensure the connection is open
            }

            using (var command = _sqliteConnection.CreateCommand())
            {
                command.CommandText = "SELECT COUNT(*) FROM UserTest WHERE UserId = @UserId AND Name = @Name;";
                command.Parameters.AddWithValue("@UserId", "1");
                command.Parameters.AddWithValue("@Name", "Test User");

                var result = (long)(await command.ExecuteScalarAsync() ?? 0);
                Assert.Equal(1, result); // Verify that the record was inserted
            }
        }

        [Fact]
        public async Task ExecuteInsertCommand_InvalidCommand_ThrowsException()
        {
            // Arrange
            var invalidCommand = "INSERT INTO NonExistentTable (Column) VALUES (@Value);";
            var parameters = new { Value = "Test" };

            // Act & Assert
            await Assert.ThrowsAsync<SqliteException>(() => _service.ExecuteInsertCommand(invalidCommand, parameters));
        }

        [Fact]
        public async Task ExecuteQueryCommand_ValidQuery_ReturnsExpectedResult()
        {
            // Clear the table before running the test
            ClearUserTestTable();

            // Arrange
            var insertCommand = "INSERT INTO UserTest (UserId, Name) VALUES (@UserId, @Name);";
            var parameters = new { UserId = "12", Name = "Test User 12" };
            await _service.ExecuteInsertCommand(insertCommand, parameters);

            var queryCommand = "SELECT Name FROM UserTest WHERE UserId = @UserId;";
            var queryParameters = new { UserId = "12" };

            // Act
            var result = await _service.ExecuteQueryCommand<string>(queryCommand, queryParameters);

            // Assert
            Assert.Equal("Test User 12", result);
        }

        [Fact]
        public async Task ExecuteQueryCommand_NoResults_ReturnsDefault()
        {
            // Clear the table before running the test
            ClearUserTestTable();

            // Arrange
            var queryCommand = "SELECT Name FROM UserTest WHERE UserId = @UserId;";
            var queryParameters = new { UserId = "NonExistentId" };

            // Act
            var result = await _service.ExecuteQueryCommand<string>(queryCommand, queryParameters);

            // Assert
            Assert.Null(result); // No results should return null
        }

        [Fact]
        public async Task UserTestTable_CreateRecord_InsertsSuccessfully()
        {
            // Clear the table before running the test
            ClearUserTestTable();

            // CREATE: Insert a record
            var insertCommand = "INSERT INTO UserTest (UserId, Name, Email, Password, AccountType) VALUES (@UserId, @Name, @Email, @Password, @AccountType);";
            var insertParameters = new { UserId = "1", Name = "Test User", Email = "test@example.com", Password = "password123", AccountType = "Standard" };
            await _service.ExecuteInsertCommand(insertCommand, insertParameters);

            // READ: Verify the record was inserted
            var selectCommand = "SELECT Name FROM UserTest WHERE UserId = @UserId;";
            var selectParameters = new { UserId = "1" };
            var insertedName = await _service.ExecuteQueryCommand<string>(selectCommand, selectParameters);
            Assert.Equal("Test User", insertedName);
        }

        [Fact]
        public async Task UserTestTable_ReadRecord_ReturnsCorrectData()
        {
            // Clear the table before running the test
            ClearUserTestTable();

            // Arrange: Insert a record
            var insertCommand = "INSERT INTO UserTest (UserId, Name, Email, Password, AccountType) VALUES (@UserId, @Name, @Email, @Password, @AccountType);";
            var insertParameters = new { UserId = "1", Name = "Test User", Email = "test@example.com", Password = "password123", AccountType = "Standard" };
            await _service.ExecuteInsertCommand(insertCommand, insertParameters);

            // READ: Verify the record was inserted
            var selectCommand = "SELECT Name FROM UserTest WHERE UserId = @UserId;";
            var selectParameters = new { UserId = "1" };
            var result = await _service.ExecuteQueryCommand<string>(selectCommand, selectParameters);
            Assert.Equal("Test User", result);
        }

        [Fact]
        public async Task UserTestTable_UpdateRecord_UpdatesSuccessfully()
        {
            // Clear the table before running the test
            ClearUserTestTable();

            // Arrange: Insert a record
            var insertCommand = "INSERT INTO UserTest (UserId, Name, Email, Password, AccountType) VALUES (@UserId, @Name, @Email, @Password, @AccountType);";
            var insertParameters = new { UserId = "1", Name = "Test User", Email = "test@example.com", Password = "password123", AccountType = "Standard" };
            await _service.ExecuteInsertCommand(insertCommand, insertParameters);

            // UPDATE: Update the record
            var updateCommand = "UPDATE UserTest SET Name = @NewName WHERE UserId = @UserId;";
            var updateParameters = new { UserId = "1", NewName = "Updated User" };
            await _service.ExecuteInsertCommand(updateCommand, updateParameters);

            // READ: Verify the record was updated
            var selectCommand = "SELECT Name FROM UserTest WHERE UserId = @UserId;";
            var selectParameters = new { UserId = "1" };
            var updatedName = await _service.ExecuteQueryCommand<string>(selectCommand, selectParameters);
            Assert.Equal("Updated User", updatedName);
        }

        [Fact]
        public async Task UserTestTable_DeleteRecord_DeletesSuccessfully()
        {
            // Clear the table before running the test
            ClearUserTestTable();

            // Arrange: Insert a record
            var insertCommand = "INSERT INTO UserTest (UserId, Name, Email, Password, AccountType) VALUES (@UserId, @Name, @Email, @Password, @AccountType);";
            var insertParameters = new { UserId = "1", Name = "Test User", Email = "test@example.com", Password = "password123", AccountType = "Standard" };
            await _service.ExecuteInsertCommand(insertCommand, insertParameters);

            // DELETE: Delete the record
            var deleteCommand = "DELETE FROM UserTest WHERE UserId = @UserId;";
            var deleteParameters = new { UserId = "1" };
            await _service.ExecuteInsertCommand(deleteCommand, deleteParameters);

            // READ: Verify the record was deleted
            var selectCommand = "SELECT Name FROM UserTest WHERE UserId = @UserId;";
            var selectParameters = new { UserId = "1" };
            var deletedName = await _service.ExecuteQueryCommand<string>(selectCommand, selectParameters);
            Assert.Null(deletedName);
        }

        public void Dispose()
        {
            // Dispose of the SQLite connection after each test
            _sqliteConnection?.Dispose();
        }
    }
}