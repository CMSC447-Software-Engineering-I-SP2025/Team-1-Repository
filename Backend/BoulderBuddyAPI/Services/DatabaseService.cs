using BoulderBuddyAPI.Models.DatabaseModels;
using Microsoft.Data.Sqlite;

namespace BoulderBuddyAPI.Services
{
    public class DatabaseService : IDatabaseService
    {
        private readonly string _connectionString;
        private readonly SqliteConnection _sqliteConnection; // Add this for testing
        private readonly IConfiguration _configuration;

        // Constructor for production use
        public DatabaseService(IConfiguration configuration)
        {
            _connectionString = configuration?.GetConnectionString("DefaultConnection") 
                ?? throw new ArgumentNullException(nameof(configuration), "Configuration cannot be null");
            _configuration = configuration;
        }

        // Constructor for testing with an existing SQLite connection
        public DatabaseService(SqliteConnection sqliteConnection)
        {
            _sqliteConnection = sqliteConnection ?? throw new ArgumentNullException(nameof(sqliteConnection));
        }

        //execute insert command
        public async Task ExecuteInsertCommand(string commandText, object parameters)
        {
            using (var connection = _sqliteConnection ?? new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();
                await ExecuteInsertCommand(connection, commandText, parameters);
            }
        }

        public async Task ExecuteInsertCommand(SqliteConnection connection, string commandText, object parameters)
        {
            using (var command = connection.CreateCommand())
            {
                AddParameters(command, parameters);
                command.CommandText = commandText;

                await command.ExecuteNonQueryAsync();
            }
        }

        //add parameters to command
        private void AddParameters(SqliteCommand command, object parameters)
        {
            foreach (var property in parameters.GetType().GetProperties())
            {
                var value = property.GetValue(parameters);
                string parameterName = $"@{property.Name}";
                command.Parameters.AddWithValue(parameterName, value ?? DBNull.Value);
            }
        }
        //insert into database
        public Task InsertIntoUserTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO User (UserId, Name, Email, Password, AccountType) 
                VALUES (@UserId, @Name, @Email, @Password, @AccountType);", parameters);

        public Task InsertIntoRouteTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO Route (RouteId, Name, Grade, Longitude, Latitude, Picture) 
                VALUES (@RouteId, @Name, @Grade, @Longitude, @Latitude, @Picture);", parameters);

        public Task InsertIntoReviewTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO Review (UserId, RouteId, Rating, Text) 
                VALUES (@UserId, @RouteId, @Rating, @Text);", parameters);

        public Task InsertIntoRecommendationTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO Recommendation (RouteId) 
                VALUES (@RouteId);", parameters);

        public Task InsertIntoUserRelationTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO UserRelation (User1Id, User2Id, RelationType, RequestDate, FriendSince) 
                VALUES (@User1Id, @User2Id, @RelationType, @RequestDate, @FriendSince);", parameters);

        public Task InsertIntoClimbGroupTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO ClimbGroup (GroupId, GroupName, GroupDescription, JoinRequirements, Price, GroupType, GroupOwner, GroupImage) 
                VALUES (@GroupId, @GroupName, @GroupDescription, @JoinRequirements, @Price, @GroupType, @GroupOwner, @GroupImage);", parameters);

        public Task InsertIntoClimbGroupRelationTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO ClimbGroupRelation (GroupId, UserId, RelationType, InviteDate, MemberSince) 
                VALUES (@GroupId, @UserId, @RelationType, @InviteDate, @MemberSince);", parameters);

        public Task InsertIntoClimbGroupEventTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO ClimbGroupEvent (GroupId, EventName, EventDescription, EventDate, EventTime, EventLocation, EventImage) 
                VALUES (@GroupId, @EventName, @EventDescription, @EventDate, @EventTime, @EventLocation, @EventImage);", parameters);

        public Task InsertIntoBadgeTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO Badge (BadgeId, BadgeName, BadgeDescription, BadgeRequirement, BadgeRarity, BadgeImage) 
                VALUES (@BadgeId, @BadgeName, @BadgeDescription, @BadgeRequirement, @BadgeRarity, @BadgeImage);", parameters);

        public Task InsertIntoBadgeRelationTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO BadgeRelation (UserId, BadgeId) 
                VALUES (@UserId, @BadgeId);", parameters);

        
        //execute select command
        public async Task<List<T>> ExecuteSelectCommand<T>(string commandText, object parameters)
        {
            List<T> results = new List<T>();
            using (SqliteConnection connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (SqliteCommand command = connection.CreateCommand())
                {
                    AddParameters(command, parameters);
                    command.CommandText = commandText;
                    using (SqliteDataReader reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            T result = Activator.CreateInstance<T>();
                            foreach (var property in typeof(T).GetProperties())
                            {
                                var value = reader[property.Name];
                                property.SetValue(result, value == DBNull.Value ? null : value);
                            }
                            results.Add(result);
                        }
                    }
                }
            }
            return results;
        }

        public async Task<List<T>> ExecuteSelectCommand<T>(SqliteConnection connection, string commandText, object parameters) where T : new()
        {
            using (var command = connection.CreateCommand())
            {
                AddParameters(command, parameters);
                command.CommandText = commandText;

                using (var reader = await command.ExecuteReaderAsync())
                {
                    var results = new List<T>();
                    while (await reader.ReadAsync())
                    {
                        var item = new T();
                        foreach (var property in typeof(T).GetProperties())
                        {
                            if (!reader.IsDBNull(reader.GetOrdinal(property.Name)))
                            {
                                property.SetValue(item, reader[property.Name]);
                            }
                        }
                        results.Add(item);
                    }
                    return results;
                }
            }
        }

        //select from user table
        public Task<List<User>> GetUsers() =>
            ExecuteSelectCommand<User>("SELECT * FROM User", new object());

        //select from route table
        public Task<List<Route>> GetRoutes() =>
            ExecuteSelectCommand<Route>("SELECT * FROM Route", new object());
        //select from review table
        public Task<List<Review>> GetReviews() =>
            ExecuteSelectCommand<Review>("SELECT * FROM Review", new object());

        //select 10 random reviews for a specific climb
        public Task<List<Review>> GetTenReviews(string RouteID) =>
            ExecuteSelectCommand<Review>("SELECT Review.*, User.Name as UserName " +
                "FROM Review " +
                "JOIN User ON Review.UserId=User.UserId " +
                $"WHERE Review.RouteID='{RouteID}' " +
                "ORDER BY RANDOM() LIMIT 10", new object());
        
        //get average rating for a specific climb
        public Task<List<SingleItemWrapper<double>>> GetAvgReview(string RouteID) =>
            ExecuteSelectCommand<SingleItemWrapper<double>>("SELECT AVG(Rating) as Val " +
                "FROM Review " +
                $"WHERE RouteID='{RouteID}'", new object());


        //select from recommendation table
        public Task<List<Recommendation>> GetRecommendations() =>
            ExecuteSelectCommand<Recommendation>("SELECT * FROM Recommendation", new object());

        //select from user relation table
        public Task<List<UserRelation>> GetUserRelations() =>
            ExecuteSelectCommand<UserRelation>("SELECT * FROM UserRelation", null);

        //select from climb group table
        public Task<List<ClimbGroup>> GetClimbGroups() =>
            ExecuteSelectCommand<ClimbGroup>("SELECT * FROM ClimbGroup", null);

        //select from climb group relation table
        public Task<List<ClimbGroupRelation>> GetClimbGroupRelations() =>
            ExecuteSelectCommand<ClimbGroupRelation>("SELECT * FROM ClimbGroupRelation", null);

        //select from climb group event table
        public Task<List<ClimbGroupEvent>> GetClimbGroupEvents() =>
            ExecuteSelectCommand<ClimbGroupEvent>("SELECT * FROM ClimbGroupEvent", null);

        //select from badge table
        public Task<List<Badge>> GetBadges() =>
            ExecuteSelectCommand<Badge>("SELECT * FROM Badge", null);

        //select from badge relation table
        public Task<List<BadgeRelation>> GetBadgeRelations() =>
            ExecuteSelectCommand<BadgeRelation>("SELECT * FROM BadgeRelation", null);

        //excute update command
        public async Task ExecuteUpdateCommand(string commandText, object parameters)
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

        public async Task ExecuteUpdateCommand(SqliteConnection connection, string commandText, object parameters)
        {
            using (var command = connection.CreateCommand())
            {
                AddParameters(command, parameters);
                command.CommandText = commandText;

                await command.ExecuteNonQueryAsync();
            }
        }

        //update user table
        public Task UpdateUser(string userId, object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE User 
                SET Name = @Name, Email = @Email, Password = @Password, AccountType = @AccountType 
                WHERE UserId = @UserId;", 
                new { UserId = userId, parameters });

        //update route table
        public Task UpdateRoute(object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE Route 
                SET name = @Name, grade = @Grade, longitude = @Longitude, latitude = @Latitude, picture = @Picture 
                WHERE id = @RouteId;", parameters);

        //update review table
        public Task UpdateReview(string reviewId, object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE Review 
                SET Rating = @Rating, Text = @Text 
                WHERE ReviewId = @ReviewId;", 
                new { ReviewId = reviewId, parameters });

        //update recommendation table
    public Task UpdateRecommendation(string recommendationId, object parameters) =>
        ExecuteUpdateCommand(@"
            UPDATE Recommendation 
            SET RouteId = @RouteId 
            WHERE RecommendationId = @RecommendationId;", 
            new { RecommendationId = recommendationId, parameters });

        //update user relation table
        public Task UpdateUserRelation(object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE UserRelation 
                SET relationType = @RelationType, requestDate = @RequestDate, friendSince = @FriendSince 
                WHERE user1Id = @User1Id AND user2Id = @User2Id;", parameters);

        //update climb group table
        public Task UpdateClimbGroup(string groupId, object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE ClimbGroup 
                SET GroupName = @GroupName, GroupDescription = @GroupDescription, JoinRequirements = @JoinRequirements, 
                    Price = @Price, GroupType = @GroupType, GroupOwner = @GroupOwner, GroupImage = @GroupImage 
                WHERE GroupId = @GroupId;", 
                new { GroupId = groupId, parameters });

        //update climb group relation table
        public Task UpdateClimbGroupRelation(string climbGroupRelationId, object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE ClimbGroupRelation 
                SET RelationType = @RelationType, InviteDate = @InviteDate, MemberSince = @MemberSince 
                WHERE ClimbGroupRelationId = @ClimbGroupRelationId;", 
                new { ClimbGroupRelationId = climbGroupRelationId, parameters });

        //update climb group event table
        public Task UpdateClimbGroupEvent(string eventId, object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE ClimbGroupEvent 
                SET EventName = @EventName, EventDescription = @EventDescription, EventDate = @EventDate, 
                    EventTime = @EventTime, EventLocation = @EventLocation, EventImage = @EventImage 
                WHERE EventId = @EventId;", 
                new { EventId = eventId, parameters });

        //update badge table
        public Task UpdateBadge(string badgeId, object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE Badge 
                SET BadgeName = @BadgeName, BadgeDescription = @BadgeDescription, BadgeRequirement = @BadgeRequirement, 
                    BadgeRarity = @BadgeRarity, BadgeImage = @BadgeImage 
                WHERE BadgeId = @BadgeId;", 
                new { BadgeId = badgeId, parameters });

        //update badge relation table
        public Task UpdateBadgeRelation(string badgeRelationId, object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE BadgeRelation 
                SET UserId = @UserId, BadgeId = @BadgeId 
                WHERE BadgeRelationId = @BadgeRelationId;", 
                new { BadgeRelationId = badgeRelationId, parameters });

        //execute delete command
        public async Task ExecuteDeleteCommand(string commandText, object parameters)
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

        public async Task ExecuteDeleteCommand(SqliteConnection connection, string commandText, object parameters)
        {
            using (var command = connection.CreateCommand())
            {
                AddParameters(command, parameters);
                command.CommandText = commandText;

                await command.ExecuteNonQueryAsync();
            }
        }

        //delete from user table
        public Task DeleteFromUserTable(object parameters) =>
            ExecuteDeleteCommand("DELETE FROM User WHERE id = @UserId;", parameters);

        public Task DeleteFromUserTable(string userId) =>
            ExecuteDeleteCommand("DELETE FROM User WHERE id = @UserId;", new { UserId = userId });    

        //delete from route table
        public Task DeleteFromRouteTable(object parameters) =>
            ExecuteDeleteCommand("DELETE FROM Route WHERE id = @RouteId;", parameters);


        //delete from review table
        public Task DeleteFromReviewTable(string reviewId) =>
            ExecuteDeleteCommand("DELETE FROM Review WHERE ReviewId = @ReviewId;", new { ReviewId = reviewId });

        //delete from recommendation table
        public Task DeleteFromRecommendationTable(object parameters) =>
            ExecuteDeleteCommand("DELETE FROM Recommendation WHERE routeId = @RouteId;", parameters);

        //delete from user relation table
        public Task DeleteFromUserRelationTable(object parameters) =>
            ExecuteDeleteCommand("DELETE FROM UserRelation WHERE user1Id = @User1Id AND user2Id = @User2Id;", parameters);

        public Task DeleteFromUserRelationTable(string userRelationId) =>
            ExecuteDeleteCommand("DELETE FROM UserRelation WHERE UserRelationId = @UserRelationId;", new { UserRelationId = userRelationId });

        //delete from climb group table
        public Task DeleteFromClimbGroupTable(string climbGroupId) =>
            ExecuteDeleteCommand("DELETE FROM ClimbGroup WHERE GroupId = @GroupId;", new { GroupId = climbGroupId });

        //delete from climb group relation table
        public Task DeleteFromClimbGroupRelationTable(string climbGroupRelationId) =>
            ExecuteDeleteCommand("DELETE FROM ClimbGroupRelation WHERE ClimbGroupRelationId = @ClimbGroupRelationId;", new { ClimbGroupRelationId = climbGroupRelationId });

        //delete from climb group event table
        public Task DeleteFromClimbGroupEventTable(string eventId) =>
            ExecuteDeleteCommand("DELETE FROM ClimbGroupEvent WHERE EventId = @EventId;", new { EventId = eventId });

        //delete from badge table
        public Task DeleteFromBadgeTable(string badgeId) =>
            ExecuteDeleteCommand("DELETE FROM Badge WHERE BadgeId = @BadgeId;", new { BadgeId = badgeId });

        //delete from badge relation table
        public Task DeleteFromBadgeRelationTable(string badgeRelationId) =>
             ExecuteDeleteCommand("DELETE FROM BadgeRelation WHERE BadgeRelationId = @BadgeRelationId;", new { BadgeRelationId = badgeRelationId });

        //for testing purposes only
        public async Task<T> ExecuteQueryCommand<T>(string query, object parameters)
        {
            using (var connection = _sqliteConnection ?? new SqliteConnection(_configuration["ConnectionStrings:DefaultConnection"]))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = query;

                    foreach (var property in parameters.GetType().GetProperties())
                    {
                        command.Parameters.AddWithValue($"@{property.Name}", property.GetValue(parameters));
                    }

                    var result = await command.ExecuteScalarAsync();
                    return result == DBNull.Value ? default : (T)result;
                }
            }
        }

        public async Task<T> ExecuteQueryCommand<T>(SqliteConnection connection, string query, object parameters)
        {
            using (var command = connection.CreateCommand())
            {
                command.CommandText = query;

                foreach (var property in parameters.GetType().GetProperties())
                {
                    command.Parameters.AddWithValue($"@{property.Name}", property.GetValue(parameters));
                }

                var result = await command.ExecuteScalarAsync();
                return result == DBNull.Value ? default : (T)result;
            }

        }
    }
}