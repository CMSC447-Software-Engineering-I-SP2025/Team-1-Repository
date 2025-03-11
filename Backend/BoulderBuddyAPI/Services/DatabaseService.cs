using Microsoft.Data.Sqlite;
using System;
using System.Threading.Tasks;

namespace BoulderBuddyAPI.Services
{
    public class DatabaseService
    {
        private readonly string _connectionString = string.Empty;

        public DatabaseService(IConfiguration configuration)
        {
            _connectionString = configuration?.GetConnectionString("DefaultConnection") ?? throw new ArgumentNullException(nameof(configuration), "Configuration cannot be null");
        }

        public async Task ExecuteInsertCommand(string commandText, object parameters)
        {
            using (SqliteConnection connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (SqliteCommand command = connection.CreateCommand())
                {
                    AddParameters(command, parameters);
                    command.CommandText = commandText;
                    await command.ExecuteNonQueryAsync();
                }
            }
        }

        private void AddParameters(SqliteCommand command, object parameters)
        {
            foreach (var property in parameters.GetType().GetProperties())
            {
                var value = property.GetValue(parameters);
                string parameterName = $"@{property.Name}";
                command.Parameters.AddWithValue(parameterName, value ?? DBNull.Value);
            }
        }

        public Task InsertIntoUserTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO User (id, name, email, password, accountType) 
                VALUES (@UserId, @Name, @Email, @Password, @AccountType);", parameters);

        public Task InsertIntoRoutesTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO Routes (id, name, grade, longitude, latitude, picture) 
                VALUES (@RouteId, @Name, @Grade, @Longitude, @Latitude, @Picture);", parameters);

        public Task InsertIntoReviewsTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO Reviews (userId, routeId, rating, review) 
                VALUES (@UserId, @RouteId, @Rating, @Text);", parameters);

        public Task InsertIntoRecommendationsTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO Recommendations (routeId) 
                VALUES (@RouteId);", parameters);

        public Task InsertIntoUserRelationTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO UserRelation (userId, friendId, relationType, requestDate, friendSince) 
                VALUES (@UserId, @FriendId, @RelationType, @RequestDate, @FriendSince);", parameters);

        public Task InsertIntoClimbGroupTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO ClimbGroup (groupName, groupDescription, joinRequirements, price, groupType, groupOwner, groupImage) 
                VALUES (@GroupName, @GroupDescription, @JoinRequirements, @Price, @GroupType, @GroupOwner, @GroupImage);", parameters);

        public Task InsertIntoClimbGroupRelationTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO ClimbGroupRelation (groupId, userId, relationType, requestDate, memberSince) 
                VALUES (@GroupId, @UserId, @RelationType, @RequestDate, @MemberSince);", parameters);

        public Task InsertIntoClimbGroupEventTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO ClimbGroupEvent (groupId, eventName, eventDescription, eventDate, eventTime, eventLocation, eventImage) 
                VALUES (@GroupId, @EventName, @EventDescription, @EventDate, @EventTime, @EventLocation, @EventImage);", parameters);

        public Task InsertIntoBadgeTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO Badge (badgeName, badgeDescription, badgeRequirement, badgeRarity, badgeImage) 
                VALUES (@BadgeName, @BadgeDescription, @BadgeRequirement, @BadgeRarity, @BadgeImage);", parameters);

        public Task InsertIntoBadgeRelationTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO BadgeRelation (userId, badgeId) 
                VALUES (@UserId, @BadgeId);", parameters);
    }
}