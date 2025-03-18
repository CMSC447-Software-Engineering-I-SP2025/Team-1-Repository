using Microsoft.Data.Sqlite;
using System;
using System.Threading.Tasks;

namespace BoulderBuddyAPI.Services
{
    public class DatabaseService : IDatabaseService
    {
        private readonly string _connectionString = string.Empty;

        public DatabaseService(IConfiguration configuration)
        {
            _connectionString = configuration?.GetConnectionString("DefaultConnection") ?? throw new ArgumentNullException(nameof(configuration), "Configuration cannot be null");
        }

        //execute insert command
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

        //select from user table
        public Task<List<User>> GetUsers() =>
            ExecuteSelectCommand<User>("SELECT * FROM User", new object());

        //select from route table
        public Task<List<Route>> GetRoutes() =>
            ExecuteSelectCommand<Route>("SELECT * FROM Route", new object());
            //select from review table
        public Task<List<Review>> GetReviews() =>
            ExecuteSelectCommand<Review>("SELECT * FROM Review", new object());

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

        //update user table
        public Task UpdateUser(object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE User 
                SET name = @Name, email = @Email, password = @Password, accountType = @AccountType 
                WHERE id = @UserId;", parameters);

        //update route table
        public Task UpdateRoute(object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE Route 
                SET name = @Name, grade = @Grade, longitude = @Longitude, latitude = @Latitude, picture = @Picture 
                WHERE id = @RouteId;", parameters);

        //update review table
        public Task UpdateReview(object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE Review 
                SET rating = @Rating, review = @Text 
                WHERE userId = @UserId AND routeId = @RouteId;", parameters);

        //update recommendation table
        public Task UpdateRecommendation(object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE Recommendation 
                SET routeId = @RouteId 
                WHERE routeId = @RouteId;", parameters);

        //update user relation table
        public Task UpdateUserRelation(object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE UserRelation 
                SET relationType = @RelationType, requestDate = @RequestDate, friendSince = @FriendSince 
                WHERE user1Id = @User1Id AND user2Id = @User2Id;", parameters);

        //update climb group table
        public Task UpdateClimbGroup(object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE ClimbGroup 
                SET groupName = @GroupName, groupDescription = @GroupDescription, joinRequirements = @JoinRequirements, price = @Price, groupType = @GroupType, groupOwner = @GroupOwner, groupImage = @GroupImage 
                WHERE groupId = @GroupId;", parameters);

        //update climb group relation table
        public Task UpdateClimbGroupRelation(object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE ClimbGroupRelation 
                SET relationType = @RelationType, inviteDate = @InviteDate, memberSince = @MemberSince 
                WHERE groupId = @GroupId AND userId = @UserId;", parameters);

        //update climb group event table
        public Task UpdateClimbGroupEvent(object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE ClimbGroupEvent 
                SET eventName = @EventName, eventDescription = @EventDescription, eventDate = @EventDate, eventTime = @EventTime, eventLocation = @EventLocation, eventImage = @EventImage 
                WHERE groupId = @GroupId;", parameters);

        //update badge table
        public Task UpdateBadge(object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE Badge 
                SET badgeName = @BadgeName, badgeDescription = @BadgeDescription, badgeRequirement = @BadgeRequirement, badgeRarity = @BadgeRarity, badgeImage = @BadgeImage 
                WHERE badgeId = @BadgeId;", parameters);

        //update badge relation table
        public Task UpdateBadgeRelation(object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE BadgeRelation 
                SET userId = @UserId, badgeId = @BadgeId 
                WHERE userId = @UserId AND badgeId = @BadgeId;", parameters);

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

        //delete from user table
        public Task DeleteFromUserTable(object parameters) =>
            ExecuteDeleteCommand("DELETE FROM User WHERE id = @UserId;", parameters);

        //delete from route table
        public Task DeleteFromRouteTable(object parameters) =>
            ExecuteDeleteCommand("DELETE FROM Route WHERE id = @RouteId;", parameters);


        //delete from review table
        public Task DeleteFromReviewTable(object parameters) =>
            ExecuteDeleteCommand("DELETE FROM Review WHERE userId = @UserId AND routeId = @RouteId;", parameters);

        //delete from recommendation table
        public Task DeleteFromRecommendationTable(object parameters) =>
            ExecuteDeleteCommand("DELETE FROM Recommendation WHERE routeId = @RouteId;", parameters);

        //delete from user relation table
        public Task DeleteFromUserRelationTable(object parameters) =>
            ExecuteDeleteCommand("DELETE FROM UserRelation WHERE user1Id = @User1Id AND user2Id = @User2Id;", parameters);

        //delete from climb group table
        public Task DeleteFromClimbGroupTable(object parameters) =>
            ExecuteDeleteCommand("DELETE FROM ClimbGroup WHERE groupId = @GroupId;", parameters);

        //delete from climb group relation table
        public Task DeleteFromClimbGroupRelationTable(object parameters) =>
            ExecuteDeleteCommand("DELETE FROM ClimbGroupRelation WHERE groupId = @GroupId AND userId = @UserId;", parameters);

        //delete from climb group event table
        public Task DeleteFromClimbGroupEventTable(object parameters) =>
            ExecuteDeleteCommand("DELETE FROM ClimbGroupEvent WHERE groupId = @GroupId;", parameters);

        //delete from badge table
        public Task DeleteFromBadgeTable(object parameters) =>
            ExecuteDeleteCommand("DELETE FROM Badge WHERE badgeId = @BadgeId;", parameters);

        //delete from badge relation table
        public Task DeleteFromBadgeRelationTable(object parameters) =>
            ExecuteDeleteCommand("DELETE FROM BadgeRelation WHERE userId = @UserId AND badgeId = @BadgeId;", parameters);
    }
}