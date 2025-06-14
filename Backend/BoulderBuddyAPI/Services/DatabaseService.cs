using BoulderBuddyAPI.Models;
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
                INSERT INTO User (
                    UserId, UserName, ProfileImage, FirstName, LastName, Email, PhoneNumber, 
                    BoulderGradeLowerLimit, BoulderGradeUpperLimit, 
                    RopeClimberLowerLimit, RopeClimberUpperLimit, Bio, AccountType
                ) 
                VALUES (
                    @UserId, @UserName, @ProfileImage, @FirstName, @LastName, @Email, @PhoneNumber, 
                    @BoulderGradeLowerLimit, @BoulderGradeUpperLimit, 
                    @RopeClimberLowerLimit, @RopeClimberUpperLimit, @Bio, @AccountType
                );", parameters);

        public Task InsertIntoReviewTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO Review (UserId, RouteId, Rating, Text) 
                VALUES (@UserId, @RouteId, @Rating, @Text);", parameters);

        public Task InsertIntoUserRelationTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO UserRelation (User1Id, User2Id, RelationType, RequestDate, FriendSince) 
                VALUES (@User1Id, @User2Id, @RelationType, @RequestDate, @FriendSince);", parameters);

        public Task InsertIntoClimbGroupTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO ClimbGroup (GroupName, GroupDescription, JoinRequirements, Price, GroupType, GroupOwner, GroupImage) 
                VALUES (@GroupName, @GroupDescription, @JoinRequirements, @Price, @GroupType, @GroupOwner, @GroupImage);", parameters);

        public Task InsertIntoClimbGroupRelationTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO ClimbGroupRelation (GroupId, UserId, RelationType, InviteDate, MemberSince) 
                VALUES (@GroupId, @UserId, @RelationType, @InviteDate, @MemberSince);", parameters);

        public Task InsertIntoClimbGroupEventTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO ClimbGroupEvent (EventName, GroupId, EventDescription, EventDate, EventTime, EventLocation, EventImage) 
                VALUES (@EventName, @GroupId, @EventDescription, @EventDate, @EventTime, @EventLocation, @EventImage);", parameters);

        public Task InsertIntoBadgeTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO Badge (BadgeName, BadgeDescription, BadgeRequirement, BadgeRarity, BadgeImage) 
                VALUES ( @BadgeName, @BadgeDescription, @BadgeRequirement, @BadgeRarity, @BadgeImage);", parameters);

        public Task InsertIntoBadgeRelationTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO BadgeRelation (UserId, BadgeId) 
                VALUES (@UserId, @BadgeId);", parameters);
        public Task InsertIntoFavoriteClimbTable(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO FavoriteClimb (UserId, ClimbId, ParentAreaId)
                VALUES (@UserId, @ClimbId, @ParentAreaId)", parameters);

        //******Handle images and blobs******//

        // Add a new picture to the Picture table
        public Task AddPicture(object parameters) =>
            ExecuteInsertCommand(@"
                INSERT INTO Picture (UserId, RouteId, Image, UploadDate) 
                VALUES (@UserId, @RouteId, @Image, current_timestamp);", parameters);

        // Delete a picture from the Picture table
        public Task DeletePicture(int pictureId) =>
            ExecuteInsertCommand(@"
                DELETE FROM Picture 
                WHERE PictureId = @PictureId;", new { PictureId = pictureId });

        // Update an existing picture in the Picture table
        public Task UpdatePicture(int pictureId, object parameters) =>
            ExecuteInsertCommand(@"
                UPDATE Picture 
                SET 
                    UserId = @UserId,
                    RouteId = @RouteId,
                    Image = @Image,
                    UploadDate = current_timestamp
                WHERE PictureId = @PictureId;",
                new { PictureId = pictureId, parameters });

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
                                try
                                {
                                    if (!reader.IsDBNull(reader.GetOrdinal(property.Name)))
                                    {
                                        var value = reader[property.Name];
                                        if (value.GetType() != property.PropertyType)
                                        {
                                            // Handle type conversion
                                            value = Convert.ChangeType(value, property.PropertyType);
                                        }
                                        property.SetValue(result, value);
                                    }
                                }
                                catch (Exception ex)
                                {
                                    Console.WriteLine($"Error mapping property {property.Name}: {ex.Message}");
                                }
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
            ExecuteSelectCommand<User>(@"
                SELECT 
                    UserId, UserName, ProfileImage, FirstName, LastName, Email, PhoneNumber, 
                    BoulderGradeLowerLimit, BoulderGradeUpperLimit, 
                    RopeClimberLowerLimit, RopeClimberUpperLimit, Bio, AccountType, 
                    EnableReviewCommentNotifications, EnableGroupInviteNotifications
                FROM User;", new object());

        //select from review table
        public Task<List<Review>> GetReviews() =>
            ExecuteSelectCommand<Review>(@"
                SELECT 
                    Review.ReviewId, Review.UserId, Review.RouteId, Review.Rating, Review.Text,
                    User.UserName AS UserName
                FROM Review
                JOIN User ON Review.UserId = User.UserId;", new object());

        //select 10 random reviews for a specific climb
        public Task<List<Review>> GetTenReviews(string RouteID) =>
            ExecuteSelectCommand<Review>(@"
                SELECT 
                    Review.ReviewId, 
                    Review.UserId, 
                    Review.RouteId, 
                    Review.Rating, 
                    Review.Text,
                    User.UserName AS UserName
                FROM Review
                JOIN User ON Review.UserId = User.UserId
                WHERE Review.RouteId = @RouteID
                ORDER BY RANDOM() LIMIT 10;", new { RouteID });

        //get average rating for a specific climb
        public Task<List<SingleItemWrapper<double>>> GetAvgReview(string RouteID) =>
            ExecuteSelectCommand<SingleItemWrapper<double>>("SELECT AVG(Rating) as Val " +
                "FROM Review " +
                $"WHERE RouteID='{RouteID}'", new object());


        //select from user relation table
        public Task<List<UserRelation>> GetUserRelations() =>
            ExecuteSelectCommand<UserRelation>(@"
                SELECT 
                    ur.User1Id, 
                    ur.User2Id, 
                    ur.RelationType, 
                    ur.RequestDate, 
                    ur.FriendSince,
                    u1.UserName AS User1Name,
                    u2.UserName AS User2Name
                FROM UserRelation ur
                JOIN User u1 ON ur.User1Id = u1.UserId COLLATE NOCASE
                JOIN User u2 ON ur.User2Id = u2.UserId COLLATE NOCASE;",
                new object());

        //select from climb group table
        public Task<List<ClimbGroup>> GetClimbGroups() =>
            ExecuteSelectCommand<ClimbGroup>(@"
                SELECT 
                    GroupId, GroupName, GroupDescription, JoinRequirements, 
                    Price, GroupType, GroupOwner, GroupImage 
                FROM ClimbGroup;", new object());

        //select from climb group relation table
        public Task<List<ClimbGroupRelation>> GetClimbGroupRelations() =>
            ExecuteSelectCommand<ClimbGroupRelation>(@"
                SELECT 
                    ClimbGroupRelation.GroupId, 
                    ClimbGroupRelation.UserId, 
                    ClimbGroupRelation.RelationType, 
                    ClimbGroupRelation.InviteDate, 
                    ClimbGroupRelation.MemberSince,
                    ClimbGroup.GroupName
                FROM ClimbGroupRelation
                JOIN ClimbGroup ON ClimbGroupRelation.GroupId = ClimbGroup.GroupId;",
                new object());

        //select from climb group event table
        public Task<List<ClimbGroupEvent>> GetClimbGroupEvents() =>
            ExecuteSelectCommand<ClimbGroupEvent>(@"
                SELECT 
                    EventId, GroupId, EventName, EventDescription, EventDate, 
                    EventTime, EventLocation, EventImage 
                FROM ClimbGroupEvent;", new object());

        //select from badge table
        public Task<List<Badge>> GetBadges() =>
            ExecuteSelectCommand<Badge>(@"
                SELECT 
                    BadgeId, BadgeName, BadgeDescription, BadgeRequirement, 
                    BadgeRarity, BadgeImage 
                FROM Badge;", new object());

        //select from badge relation table
        public Task<List<BadgeRelation>> GetBadgeRelations() =>
            ExecuteSelectCommand<BadgeRelation>(@"
                SELECT 
                    BadgeRelationId, UserId, BadgeId 
                FROM BadgeRelation;", new object());

        public Task<List<ClimbAndParentAreaIDs>> GetFavoriteClimbs(string UserID) =>
            ExecuteSelectCommand<ClimbAndParentAreaIDs>($"SELECT * FROM FavoriteClimb WHERE userId = '{UserID}';", new object());

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

                    // Log the query and parameters
                    Console.WriteLine($"Executing Query: {command.CommandText}");
                    foreach (SqliteParameter param in command.Parameters)
                    {
                        Console.WriteLine($"Parameter: {param.ParameterName} = {param.Value}");
                    }

                    int rowsAffected = await command.ExecuteNonQueryAsync();
                    if (rowsAffected == 0)
                    {
                        Console.WriteLine("No rows were updated. Check if the ReviewId exists.");
                    }
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
        public Task UpdateUser(string userId, object parameters)
        {
            var flattenedParameters = new
            {
                UserId = userId,
                ((dynamic)parameters).UserName,
                ((dynamic)parameters).ProfileImage,
                ((dynamic)parameters).FirstName,
                ((dynamic)parameters).LastName,
                ((dynamic)parameters).Email,
                ((dynamic)parameters).PhoneNumber,
                ((dynamic)parameters).BoulderGradeLowerLimit,
                ((dynamic)parameters).BoulderGradeUpperLimit,
                ((dynamic)parameters).RopeClimberLowerLimit,
                ((dynamic)parameters).RopeClimberUpperLimit,
                ((dynamic)parameters).Bio
            };

            return ExecuteUpdateCommand(@"
                UPDATE User 
                SET 
                    UserName = @UserName,
                    ProfileImage = @ProfileImage,
                    FirstName = @FirstName, 
                    LastName = @LastName, 
                    Email = @Email, 
                    PhoneNumber = @PhoneNumber, 
                    BoulderGradeLowerLimit = @BoulderGradeLowerLimit, 
                    BoulderGradeUpperLimit = @BoulderGradeUpperLimit, 
                    RopeClimberLowerLimit = @RopeClimberLowerLimit, 
                    RopeClimberUpperLimit = @RopeClimberUpperLimit, 
                    Bio = @Bio
                    AccountType = @AccountType,
                WHERE UserId = @UserId;",
                flattenedParameters);
        }

        //update user settings in user table
        public Task UpdateUserSettings(object parameters) =>
            ExecuteUpdateCommand("UPDATE User " + //note: COALESCE(param, ColumnName) means update value only if param is not null
                "SET " +
                "AccountType = COALESCE(@AccountType, AccountType), " +
                "EnableReviewCommentNotifications = COALESCE(@EnableReviewCommentNotifications, EnableReviewCommentNotifications), " +
                "EnableGroupInviteNotifications = COALESCE(@EnableGroupInviteNotifications, EnableGroupInviteNotifications) " +
                "WHERE UserId = @UserID", parameters);

        //update review table
        public Task UpdateReview(string reviewId, object parameters)
        {
            // Flatten the parameters object
            var flattenedParameters = new
            {
                ReviewId = reviewId,
                ((dynamic)parameters).Rating,
                ((dynamic)parameters).Text
            };

            return ExecuteUpdateCommand(@"
                UPDATE Review 
                SET Rating = @Rating, Text = @Text 
                WHERE ReviewId = @ReviewId;",
                flattenedParameters);
        }

        //update user relation table
        public Task UpdateUserRelation(object parameters) =>
            ExecuteUpdateCommand(@"
                UPDATE UserRelation 
                SET RelationType = @RelationType, RequestDate = @RequestDate, FriendSince = @FriendSince 
                WHERE User1Id = @User1Id AND User2Id = @User2Id;", parameters);

        //update climb group table
        public Task UpdateClimbGroup(string groupId, object parameters)
        {
            // Flatten the parameters object
            var flattenedParameters = new
            {
                GroupId = groupId,
                ((dynamic)parameters).GroupName,
                ((dynamic)parameters).GroupDescription,
                ((dynamic)parameters).JoinRequirements,
                ((dynamic)parameters).Price,
                ((dynamic)parameters).GroupType,
                ((dynamic)parameters).GroupOwner,
                ((dynamic)parameters).GroupImage
            };

            return ExecuteUpdateCommand(@"
                UPDATE ClimbGroup 
                SET GroupName = @GroupName, GroupDescription = @GroupDescription, JoinRequirements = @JoinRequirements, 
                    Price = @Price, GroupType = @GroupType, GroupOwner = @GroupOwner, GroupImage = @GroupImage 
                WHERE GroupId = @GroupId;",
                flattenedParameters);
        }

        //update climb group relation table
        public Task UpdateClimbGroupRelation(string groupId, string userId, object parameters)
        {
            var flattenedParameters = new
            {
                GroupId = groupId,
                UserId = userId,
                ((dynamic)parameters).RelationType,
                ((dynamic)parameters).InviteDate,
                ((dynamic)parameters).MemberSince
            };

            return ExecuteUpdateCommand(@"
                UPDATE ClimbGroupRelation 
                SET RelationType = @RelationType, InviteDate = @InviteDate, MemberSince = @MemberSince 
                WHERE GroupId = @GroupId AND UserId = @UserId;",
                flattenedParameters);
        }

        //update climb group event table
        public Task UpdateClimbGroupEvent(string eventId, object parameters)
        {
            var flattenedParameters = new
            {
                EventId = eventId,
                ((dynamic)parameters).EventName,
                ((dynamic)parameters).EventDescription,
                ((dynamic)parameters).EventDate,
                ((dynamic)parameters).EventTime,
                ((dynamic)parameters).EventLocation,
                ((dynamic)parameters).EventImage
            };

            return ExecuteUpdateCommand(@"
                UPDATE ClimbGroupEvent 
                SET EventName = @EventName, EventDescription = @EventDescription, EventDate = @EventDate, 
                    EventTime = @EventTime, EventLocation = @EventLocation, EventImage = @EventImage 
                WHERE EventId = @EventId;",
                flattenedParameters);
        }

        //update badge table
        public Task UpdateBadge(string badgeId, object parameters)
        {
            var flattenedParameters = new
            {
                BadgeId = badgeId,
                ((dynamic)parameters).BadgeName,
                ((dynamic)parameters).BadgeDescription,
                ((dynamic)parameters).BadgeRequirement,
                ((dynamic)parameters).BadgeRarity,
                ((dynamic)parameters).BadgeImage
            };

            return ExecuteUpdateCommand(@"
                UPDATE Badge 
                SET BadgeName = @BadgeName, BadgeDescription = @BadgeDescription, BadgeRequirement = @BadgeRequirement, 
                    BadgeRarity = @BadgeRarity, BadgeImage = @BadgeImage 
                WHERE BadgeId = @BadgeId;",
                flattenedParameters);
        }

        //update badge relation table

        public Task UpdateBadgeRelation(string userId, string badgeId, object parameters)
        {
            var flattenedParameters = new
            {
                UserId = userId,
                BadgeId = badgeId

            };

            return ExecuteUpdateCommand(@"
                UPDATE BadgeRelation 
                SET UserId = @UserId, BadgeId = @BadgeId 
                WHERE UserId = @UserId AND BadgeId = @BadgeId;",
                flattenedParameters);
        }

        //execute delete command
        public async Task ExecuteDeleteCommand(string commandText, object parameters)
        {
            using (SqliteConnection connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (SqliteCommand command = connection.CreateCommand())
                {
                    try
                    {
                        AddParameters(command, parameters);
                        command.CommandText = commandText;

                        Console.WriteLine($"Executing Query: {command.CommandText}");
                        foreach (var param in command.Parameters)
                        {
                            Console.WriteLine($"Parameter: {param}");
                        }

                        int rowsAffected = await command.ExecuteNonQueryAsync();
                        if (rowsAffected == 0)
                        {
                            Console.WriteLine("No rows were deleted. Check if the record exists.");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error executing delete command: {ex.Message}");
                        throw;
                    }
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
            ExecuteDeleteCommand("DELETE FROM User WHERE UserId = @UserId;", parameters);

        public Task DeleteFromUserTable(string userId) =>
            ExecuteDeleteCommand("DELETE FROM User WHERE UserId = @UserId;", new { UserId = userId });

        //delete from review table
        public Task DeleteFromReviewTable(string reviewId) =>
            ExecuteDeleteCommand("DELETE FROM Review WHERE ReviewId = @ReviewId;", new { ReviewId = reviewId });

        //delete from user relation table
        public Task DeleteFromUserRelationTable(object parameters) =>
            ExecuteDeleteCommand("DELETE FROM UserRelation WHERE User1Id = @User1Id AND User2Id = @User2Id;", parameters);

        public Task DeleteFromUserRelationTable(string userRelationId) =>
            ExecuteDeleteCommand("DELETE FROM UserRelation WHERE User1Id = @User1Id;", new { UserRelationId = userRelationId });

        //delete from climb group table
        public Task DeleteFromClimbGroupTable(string climbGroupId) =>
            ExecuteDeleteCommand("DELETE FROM ClimbGroup WHERE GroupId = @GroupId;", new { GroupId = climbGroupId });

        //delete from climb group relation table
        public Task DeleteFromClimbGroupRelationTable(string groupId, string userId) =>
            ExecuteDeleteCommand("DELETE FROM ClimbGroupRelation WHERE GroupId = @GroupId AND UserId = @UserId;",
                new { GroupId = groupId, UserId = userId });

        //delete from climb group event table
        public Task DeleteFromClimbGroupEventTable(string eventId) =>
            ExecuteDeleteCommand("DELETE FROM ClimbGroupEvent WHERE EventId = @EventId;", new { EventId = eventId });

        //delete from badge table
        public Task DeleteFromBadgeTable(string badgeId) =>
            ExecuteDeleteCommand("DELETE FROM Badge WHERE BadgeId = @BadgeId;", new { BadgeId = badgeId });

        //delete from badge relation table
        public Task DeleteFromBadgeRelationTable(string userId, string badgeId) =>
            ExecuteDeleteCommand("DELETE FROM BadgeRelation WHERE UserId = @UserId AND BadgeId = @BadgeId;", new { UserId = userId, BadgeId = badgeId });

        public Task DeleteFromFavoriteClimbTable(ClimbAndUserIDs parameters) =>
            ExecuteDeleteCommand(@"DELETE FROM FavoriteClimb WHERE userId = @UserId AND climbId = @ClimbId;", parameters);

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

        //Handle friend requests
        public async Task SendFriendRequest(string senderUserId, string receiverUserName)
        {
            using (var connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();

                // Get the UserId of the receiver based on their username
                string getUserIdQuery = "SELECT UserId FROM User WHERE UserName = @ReceiverUserName COLLATE NOCASE";
                using (var getUserIdCommand = new SqliteCommand(getUserIdQuery, connection))
                {
                    getUserIdCommand.Parameters.AddWithValue("@ReceiverUserName", receiverUserName);
                    var receiverUserId = await getUserIdCommand.ExecuteScalarAsync();

                    if (receiverUserId == null)
                    {
                        throw new Exception("Receiver user not found.");
                    }

                    // Check if a friend request already exists
                    string checkExistingQuery = @"
                        SELECT COUNT(*) 
                        FROM UserRelation 
                        WHERE User1Id = @SenderUserId AND User2Id = @ReceiverUserId AND RelationType = 'pending_user1'";
                    using (var checkCommand = new SqliteCommand(checkExistingQuery, connection))
                    {
                        checkCommand.Parameters.AddWithValue("@SenderUserId", senderUserId);
                        checkCommand.Parameters.AddWithValue("@ReceiverUserId", receiverUserId.ToString());
                        var result = await checkCommand.ExecuteScalarAsync();
                        var existingCount = result != null ? (long)result : 0;

                        if (existingCount > 0)
                        {
                            throw new Exception("A friend request already exists.");
                        }
                    }

                    // Insert the friend request into the UserRelation table
                    string insertQuery = @"
                        INSERT INTO UserRelation (User1Id, User2Id, RelationType, RequestDate)
                        VALUES (@SenderUserId, @ReceiverUserId, 'pending_user1', current_timestamp)";
                    using (var insertCommand = new SqliteCommand(insertQuery, connection))
                    {
                        insertCommand.Parameters.AddWithValue("@SenderUserId", senderUserId);
                        insertCommand.Parameters.AddWithValue("@ReceiverUserId", receiverUserId.ToString());
                        await insertCommand.ExecuteNonQueryAsync();
                    }
                }
            }
        }

        public async Task AcceptFriendRequest(string senderUserId, string receiverUserId)
        {
            using (var connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();

                // Update the UserRelation table to set the relation type to 'friends'
                string updateQuery = @"
                    UPDATE UserRelation
                    SET RelationType = 'friends', FriendSince = current_timestamp
                    WHERE User1Id = @SenderUserId AND User2Id = @ReceiverUserId AND RelationType = 'pending_user1'";
                using (var updateCommand = new SqliteCommand(updateQuery, connection))
                {
                    updateCommand.Parameters.AddWithValue("@SenderUserId", senderUserId);
                    updateCommand.Parameters.AddWithValue("@ReceiverUserId", receiverUserId);

                    int rowsAffected = await updateCommand.ExecuteNonQueryAsync();
                    if (rowsAffected == 0)
                    {
                        throw new Exception("No pending friend request found.");
                    }
                }
            }
        }

        public async Task RejectFriendRequest(string senderUserId, string receiverUserId)
        {
            await DeleteFromUserRelationTable(new { User1Id = senderUserId, User2Id = receiverUserId });
        }

        public Task<List<UserRelation>> GetUserRelationsForUser(string userId)
        {
            return ExecuteSelectCommand<UserRelation>(@"
                SELECT 
                    ur.User1Id, 
                    ur.User2Id, 
                    ur.RelationType, 
                    ur.RequestDate, 
                    ur.FriendSince,
                    u1.UserName AS User1Name,
                    u2.UserName AS User2Name
                FROM UserRelation ur
                JOIN User u1 ON ur.User1Id = u1.UserId COLLATE NOCASE
                JOIN User u2 ON ur.User2Id = u2.UserId COLLATE NOCASE
                WHERE ur.User1Id = @UserId OR ur.User2Id = @UserId;",
                new { UserId = userId });
        }

        //group functions
        public async Task JoinGroup(string userId, string groupName)
        {
            using (var connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();

                // Retrieve the group entry requirements and GroupId
                string getGroupQuery = @"
                    SELECT GroupId, JoinRequirements 
                    FROM ClimbGroup 
                    WHERE GroupName = @GroupName";
                using (var getGroupCommand = new SqliteCommand(getGroupQuery, connection))
                {
                    getGroupCommand.Parameters.AddWithValue("@GroupName", groupName);
                    using (var reader = await getGroupCommand.ExecuteReaderAsync())
                    {
                        if (!await reader.ReadAsync())
                        {
                            throw new Exception("Group not found.");
                        }

                        var groupId = reader["GroupId"].ToString();
                        var joinRequirements = reader["JoinRequirements"].ToString();

                        // Check if the group is open
                        if (joinRequirements != "open")
                        {
                            throw new Exception("Group is closed to new members.");
                        }

                        // Insert a new group relation
                        string insertRelationQuery = @"
                            INSERT INTO ClimbGroupRelation (GroupId, UserId, RelationType, MemberSince)
                            VALUES (@GroupId, @UserId, 'member', current_timestamp)";
                        using (var insertCommand = new SqliteCommand(insertRelationQuery, connection))
                        {
                            insertCommand.Parameters.AddWithValue("@GroupId", groupId);
                            insertCommand.Parameters.AddWithValue("@UserId", userId);
                            await insertCommand.ExecuteNonQueryAsync();
                        }
                    }
                }
            }
        }

        public Task<List<User>> GetGroupMembers(string groupId) =>
            ExecuteSelectCommand<User>(@"
                SELECT 
                    User.UserId, User.UserName, User.ProfileImage, User.FirstName, User.LastName, 
                    User.Email, User.PhoneNumber, User.BoulderGradeLowerLimit, 
                    User.BoulderGradeUpperLimit, User.RopeClimberLowerLimit, 
                    User.RopeClimberUpperLimit, User.Bio
                FROM ClimbGroupRelation
                JOIN User ON ClimbGroupRelation.UserId = User.UserId
                WHERE ClimbGroupRelation.GroupId = @GroupId AND ClimbGroupRelation.RelationType = 'member';",
                new { GroupId = groupId });

        // Get groups by UserId
        public Task<List<ClimbGroup>> GetGroupsByUserId(string userId) =>
            ExecuteSelectCommand<ClimbGroup>(@"
                SELECT 
                    ClimbGroup.GroupName, 
                    ClimbGroup.GroupDescription, 
                    ClimbGroup.JoinRequirements, 
                    ClimbGroup.GroupType, 
                    ClimbGroup.Price, 
                    ClimbGroup.GroupOwner,
                    ClimbGroupRelation.RelationType
                FROM ClimbGroupRelation
                JOIN ClimbGroup ON ClimbGroupRelation.GroupId = ClimbGroup.GroupId
                WHERE ClimbGroupRelation.UserId = @UserId;",
                new { UserId = userId });

        // Get reviews by UserId
        public Task<List<Review>> GetReviewsByUserId(string userId) =>
            ExecuteSelectCommand<Review>(@"
                SELECT 
                    Review.ReviewId, 
                    Review.UserId, 
                    Review.RouteId, 
                    Review.Rating, 
                    Review.Text,
                    User.UserName AS UserName
                FROM Review
                JOIN User ON Review.UserId = User.UserId
                WHERE Review.UserId = @UserId;",
                new { UserId = userId });

        //get user by id
        public async Task<User> GetUserById(string userId)
        {
            var result = await ExecuteSelectCommand<User>(@"
                SELECT 
                    UserId, UserName, ProfileImage, FirstName, LastName, Email, PhoneNumber, 
                    BoulderGradeLowerLimit, BoulderGradeUpperLimit, 
                    RopeClimberLowerLimit, RopeClimberUpperLimit, Bio, AccountType,
                    EnableReviewCommentNotifications, EnableGroupInviteNotifications
                FROM User
                WHERE UserId = @UserId;",
                new { UserId = userId });

            return result.FirstOrDefault() ?? throw new Exception($"User with ID {userId} not found.");
        }

        //get event by group id
        public Task<List<ClimbGroupEvent>> GetEventsByGroupId(string groupId)
        {
            return ExecuteSelectCommand<ClimbGroupEvent>(@"
                SELECT 
                    EventId, 
                    GroupId, 
                    EventName, 
                    EventDescription, 
                    EventDate, 
                    EventTime, 
                    EventLocation, 
                    EventImage
                FROM ClimbGroupEvent
                WHERE GroupId = @GroupId
                ORDER BY EventDate ASC;",
                new { GroupId = groupId });
        }

        //get picture by route id
        public Task<List<Picture>> GetPicturesByRouteId(string routeId)
        {
            return ExecuteSelectCommand<Picture>(@"
                SELECT 
                    PictureId, 
                    UserId, 
                    RouteId, 
                    Image, 
                    UploadDate
                FROM Picture
                WHERE RouteId = @RouteId;",
                new { RouteId = routeId });
        }

        //get picture by user id
        public Task<List<Picture>> GetPicturesByUserId(string userId)
        {
            return ExecuteSelectCommand<Picture>(@"
                SELECT 
                    PictureId, 
                    UserId, 
                    RouteId, 
                    Image, 
                    UploadDate
                FROM Picture
                WHERE UserId = @UserId;",
                new { UserId = userId });
        }

        //get the groups owned by a user
        public Task<List<ClimbGroup>> GetGroupsOwnedByUser(string userId)
        {
            return ExecuteSelectCommand<ClimbGroup>(@"
                SELECT 
                    GroupId, 
                    GroupName, 
                    GroupDescription, 
                    JoinRequirements, 
                    Price, 
                    GroupType, 
                    GroupOwner,
                    GroupImage
                FROM ClimbGroup
                WHERE GroupOwner = @UserId;",
                new { UserId = userId });
        }
        
    }
}