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
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        email TEXT,
                        password TEXT NOT NULL,
                        accountType TEXT NOT NULL,
                        CHECK (accountType IN (""public"", ""private""))
                    );
                    CREATE TABLE IF NOT EXISTS Routes (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        grade TEXT NOT NULL,
                        longitude TEXT NOT NULL,
                        latitude TEXT NOT NULL,
                        picture BLOB 
                    );
                    CREATE TABLE IF NOT EXISTS Reviews (
                        id INTEGER PRIMARY KEY,
                        userId TEXT NOT NULL,
                        routeId TEXT NOT NULL,
                        rating TEXT NOT NULL,
                        review TEXT,
                        FOREIGN KEY (userId) REFERENCES User(id),
                        FOREIGN KEY (routeId) REFERENCES Routes(id)
                    );
                    CREATE TABLE IF NOT EXISTS Recommendations (
                        id INTEGER PRIMARY KEY,
                        routeId TEXT NOT NULL,
                        FOREIGN KEY (routeId) REFERENCES Routes(id)
                    );
                    CREATE TABLE IF NOT EXISTS UserRelation (
                        id INTEGER PRIMARY KEY,
                        user1Id TEXT NOT NULL,
                        user2Id TEXT NOT NULL,
                        relationType TEXT NOT NULL,
                        requestDate TEXT NOT NULL DEFAULT current_timestamp,
                        friendSince TEXT,
                        FOREIGN KEY (user1Id) REFERENCES User(id),
                        FOREIGN KEY (user2Id) REFERENCES User(id),
                        CHECK (relationType IN (""friends"", ""user1_blocked"", ""user2_blocked"", ""both_blocked"", ""pending_user1"", ""pending_user2""))
                    );
                    CREATE TABLE IF NOT EXISTS ClimbGroup (
                        id INTEGER PRIMARY KEY,
                        groupName TEXT NOT NULL,
                        groupDescription TEXT,
                        joinRequirements TEXT NOT NULL,
                        price TEXT,
                        groupType TEXT NOT NULL,
                        groupOwner TEXT NOT NULL,
                        groupImage BLOB,
                        FOREIGN KEY (groupOwner) REFERENCES User(id),
                        CHECK (joinRequirements IN (""invite_only"", ""paid"", ""open"")),
                        CHECK (groupType IN (""public"", ""private""))
                    );
                    CREATE TABLE IF NOT EXISTS ClimbGroupRelation (
                        groupId TEXT NOT NULL,
                        userId TEXT NOT NULL,
                        relationType TEXT NOT NULL,
                        inviteDate TEXT,
                        memberSince TEXT,
                        PRIMARY KEY (groupId, userId),
                        FOREIGN KEY (groupId) REFERENCES ClimbGroup(id),
                        FOREIGN KEY (userId) REFERENCES User(id),
                        CHECK (relationType IN (""member"", ""owner"", ""admin"", ""banned"", ""invited""))
                    );
                    CREATE TABLE IF NOT EXISTS ClimbGroupEvent (
                        id INTEGER PRIMARY KEY,
                        groupId TEXT NOT NULL,
                        eventName TEXT NOT NULL,
                        eventDescription TEXT,
                        eventDate TEXT NOT NULL,
                        eventTime TEXT NOT NULL,
                        eventLocation TEXT NOT NULL,
                        eventImage BLOB,
                        FOREIGN KEY (groupId) REFERENCES ClimbGroup(id)
                    );
                    CREATE TABLE IF NOT EXISTS Badge (
                        id INTEGER PRIMARY KEY,
                        badgeName TEXT NOT NULL,
                        badgeDescription TEXT,
                        badgeRequirement TEXT NOT NULL,
                        badgeRarity TEXT NOT NULL,
                        badgeImage BLOB,
                        CHECK (badgeRarity IN (""common"", ""uncommon"", ""rare""))
                    );
                    CREATE TABLE IF NOT EXISTS BadgeRelation (
                        userId TEXT NOT NULL,
                        badgeId TEXT NOT NULL,
                        PRIMARY kEY (userId, badgeId),
                        FOREIGN KEY (userId) REFERENCES User(id),
                        FOREIGN KEY (badgeId) REFERENCES Badge(id)
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