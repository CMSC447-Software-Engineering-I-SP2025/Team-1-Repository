using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;

namespace BoulderBuddyAPI.Services
{
    public class DatabaseInitializer
    {
        private readonly IConfiguration _configuration;

        public DatabaseInitializer(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void Initialize()
        {
            string connectionString = _configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
            using (var connection = new SqliteConnection(connectionString))
            {
                connection.Open();

                string createTables = @"
                    CREATE TABLE IF NOT EXISTS User (
                        UserId TEXT PRIMARY KEY,
                        UserName TEXT NOT NULL,
                        ProfileImage BLOB,
                        FirstName TEXT NOT NULL,
                        LastName TEXT NOT NULL,
                        Email TEXT NOT NULL,
                        PhoneNumber TEXT,
                        BoulderGradeLowerLimit TEXT,
                        BoulderGradeUpperLimit TEXT,
                        RopeClimberLowerLimit TEXT,
                        RopeClimberUpperLimit TEXT,
                        Bio TEXT
                        AccountType TEXT NOT NULL,
                        EnableReviewCommentNotifications TEXT NOT NULL DEFAULT ""enable"",
                        EnableGroupInviteNotifications TEXT NOT NULL DEFAULT ""enable"",
                        CHECK (AccountType IN (""public"", ""private"")),
                        CHECK (EnableReviewCommentNotifications IN (""enable"", ""disable"")),
                        CHECK (EnableGroupInviteNotifications IN (""enable"", ""disable""))
                    );

                    CREATE TABLE IF NOT EXISTS Review (
                        ReviewId INTEGER PRIMARY KEY AUTOINCREMENT,
                        UserId TEXT NOT NULL,
                        RouteId TEXT NOT NULL,
                        Rating INTEGER NOT NULL,
                        Text TEXT,
                        FOREIGN KEY (UserId) REFERENCES User(UserId) ON DELETE CASCADE
                    );

                    CREATE TABLE IF NOT EXISTS UserRelation (
                        User1Id TEXT NOT NULL,
                        User2Id TEXT NOT NULL,
                        RelationType TEXT NOT NULL,
                        RequestDate TEXT NOT NULL DEFAULT current_timestamp,
                        FriendSince TEXT,
                        PRIMARY KEY (User1Id, User2Id),
                        FOREIGN KEY (User1Id) REFERENCES User(UserId) ON DELETE CASCADE,
                        FOREIGN KEY (User2Id) REFERENCES User(UserId) ON DELETE CASCADE,
                        CHECK (RelationType IN (""friends"", ""user1_blocked"", ""user2_blocked"", ""both_blocked"", ""pending_user1"", ""pending_user2""))
                    );
                    CREATE TABLE IF NOT EXISTS FavoriteClimb (
                        UserId TEXT NOT NULL,
                        ClimbId TEXT NOT NULL,
                        PRIMARY KEY (UserId, ClimbId),
                        FOREIGN KEY (UserId) REFERENCES User(UserId)
                    );

                    CREATE TABLE IF NOT EXISTS ClimbGroup (
                        GroupId INTEGER PRIMARY KEY AUTOINCREMENT,
                        GroupName TEXT NOT NULL,
                        GroupDescription TEXT,
                        JoinRequirements TEXT NOT NULL,
                        Price REAL,
                        GroupType TEXT NOT NULL,
                        GroupOwner TEXT NOT NULL,
                        GroupImage BLOB,
                        FOREIGN KEY (GroupOwner) REFERENCES User(UserId) ON DELETE CASCADE,
                        CHECK (JoinRequirements IN (""invite_only"", ""paid"", ""open"")),
                        CHECK (GroupType IN (""public"", ""private""))
                    );

                    CREATE TABLE IF NOT EXISTS ClimbGroupRelation (
                        GroupId INTEGER NOT NULL,
                        UserId TEXT NOT NULL,
                        RelationType TEXT NOT NULL,
                        InviteDate TEXT,
                        MemberSince TEXT,
                        PRIMARY KEY (GroupId, UserId),
                        FOREIGN KEY (GroupId) REFERENCES ClimbGroup(GroupId) ON DELETE CASCADE,
                        FOREIGN KEY (UserId) REFERENCES User(UserId) ON DELETE CASCADE,
                        CHECK (RelationType IN (""member"", ""owner"", ""admin"", ""banned"", ""invited""))
                    );

                    CREATE TABLE IF NOT EXISTS ClimbGroupEvent (
                        EventId INTEGER PRIMARY KEY AUTOINCREMENT,
                        GroupId INTEGER NOT NULL,
                        EventName TEXT NOT NULL,
                        EventDescription TEXT,
                        EventDate TEXT NOT NULL,
                        EventTime TEXT NOT NULL,
                        EventLocation TEXT NOT NULL,
                        EventImage BLOB,
                        FOREIGN KEY (GroupId) REFERENCES ClimbGroup(GroupId) ON DELETE CASCADE
                    );

                    CREATE TABLE IF NOT EXISTS Badge (
                        BadgeId INTEGER PRIMARY KEY AUTOINCREMENT,
                        BadgeName TEXT NOT NULL,
                        BadgeDescription TEXT,
                        BadgeRequirement TEXT NOT NULL,
                        BadgeRarity TEXT NOT NULL,
                        BadgeImage BLOB,
                        CHECK (BadgeRarity IN (""common"", ""uncommon"", ""rare""))
                    );

                    CREATE TABLE IF NOT EXISTS BadgeRelation (
                        UserId TEXT NOT NULL,
                        BadgeId INTEGER NOT NULL,
                        PRIMARY KEY (UserId, BadgeId),
                        FOREIGN KEY (UserId) REFERENCES User(UserId) ON DELETE CASCADE,
                        FOREIGN KEY (BadgeId) REFERENCES Badge(BadgeId) ON DELETE CASCADE
                    );

                    CREATE TABLE IF NOT EXISTS Picture (
                        PictureId INTEGER PRIMARY KEY AUTOINCREMENT,
                        UserId TEXT NOT NULL,
                        RouteId TEXT NOT NULL,
                        Image BLOB NOT NULL,
                        UploadDate TEXT NOT NULL DEFAULT current_timestamp,
                        FOREIGN KEY (UserId) REFERENCES User(UserId) ON DELETE CASCADE
                    );
                ";

                using (var command = new SqliteCommand(createTables, connection))
                {
                    command.ExecuteNonQuery();
                }
            }
        }
    }
}