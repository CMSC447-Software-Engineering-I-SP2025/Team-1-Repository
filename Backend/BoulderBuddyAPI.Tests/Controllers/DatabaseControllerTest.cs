using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using BoulderBuddyAPI.Controllers;
using BoulderBuddyAPI.Models.DatabaseModels;
using BoulderBuddyAPI.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BoulderBuddyAPI.Tests.Controllers
{
    public class DatabaseControllerTest
    {
        private readonly Mock<IDatabaseService> _mockDatabaseService;
        private readonly IConfiguration _mockConfiguration;
        private readonly DatabaseController _controller;

        public DatabaseControllerTest()
        {
            _mockDatabaseService = new Mock<IDatabaseService>();

            var inMemorySettings = new Dictionary<string, string>
            {
                { "ConnectionStrings:DefaultConnection", "DataSource=:memory:" }
            };

            _mockConfiguration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            _controller = new DatabaseController(_mockDatabaseService.Object, _mockConfiguration);
        }

        // POST Tests
        [Fact]
        public async Task PostUser_ValidUser_ReturnsOk()
        {
            var user = new User
            {
                UserId = "testuser1",
                UserName = "testusername",
                FirstName = "Test",
                LastName = "User",
                Email = "testuser@example.com",
                PhoneNumber = "1234567890",
                BoulderGradeLowerLimit = "V0",
                BoulderGradeUpperLimit = "V5",
                RopeClimberLowerLimit = "5.8",
                RopeClimberUpperLimit = "5.12",
                Bio = "Climbing enthusiast",
            };

            _mockDatabaseService.Setup(service => service.InsertIntoUserTable(It.IsAny<object>())).Returns(Task.CompletedTask);

            var result = await _controller.PostUser(user);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal("User created successfully", ((dynamic)okResult.Value).message);
        }

        [Fact]
        public async Task PostReview_ValidReview_ReturnsOk()
        {
            var review = new Review
            {
                ReviewId = 1,
                UserId = "user1",
                UserName = "Test User",
                RouteId = "route1",
                Rating = 5,
                Text = "Great route!"
            };

            _mockDatabaseService.Setup(service => service.InsertIntoReviewTable(review)).Returns(Task.CompletedTask);

            var result = await _controller.PostReview(review);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task PostClimbGroup_ValidClimbGroup_ReturnsOk()
        {
            var climbGroup = new ClimbGroup
            {
                GroupId = 1,
                GroupName = "Test Group",
                GroupDescription = "A test climbing group",
                JoinRequirements = "open",
                Price = 0.0,
                GroupType = "public",
                GroupOwner = "user1",
                GroupImage = null
            };

            _mockDatabaseService.Setup(service => service.InsertIntoClimbGroupTable(climbGroup)).Returns(Task.CompletedTask);

            var result = await _controller.PostClimbGroup(climbGroup);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        // GET Tests
        [Fact]
        public async Task GetUsers_ReturnsOk()
        {
            var users = new List<User>
            {
                new User
                {
                    UserId = "testuser1",
                    UserName = "testusername",
                    FirstName = "Test",
                    LastName = "User",
                    Email = "testuser@example.com",
                    PhoneNumber = "1234567890",
                    BoulderGradeLowerLimit = "V0",
                    BoulderGradeUpperLimit = "V5",
                    RopeClimberLowerLimit = "5.8",
                    RopeClimberUpperLimit = "5.12",
                    Bio = "Climbing enthusiast"
                }
            };

            _mockDatabaseService.Setup(service => service.GetUsers()).ReturnsAsync(users);

            var result = await _controller.GetUsers();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(users, okResult.Value);
        }

        [Fact]
        public async Task GetReviews_ReturnsOk()
        {
            var reviews = new List<Review>
            {
                new Review
                {
                    ReviewId = 1,
                    UserId = "user1",
                    UserName = "Test User",
                    RouteId = "route1",
                    Rating = 5,
                    Text = "Test Review"
                }
            };

            _mockDatabaseService.Setup(service => service.GetReviews()).ReturnsAsync(reviews);

            var result = await _controller.GetReviews();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(reviews, okResult.Value);
        }

        [Fact]
        public async Task GetReviewsByClimbID_ReturnsOk()
        {
            var reviews = new List<Review>
            {
                new Review
                {
                    ReviewId = 1,
                    UserId = "user1",
                    RouteId = "route1",
                    Rating = 5,
                    Text = "Great route!"
                }
            };

            _mockDatabaseService.Setup(service => service.GetTenReviews("route1")).ReturnsAsync(reviews);

            var result = await _controller.GetReviewsByClimbID("route1");

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(reviews, okResult.Value);
        }

        [Fact]
        public async Task GetClimbAvgRating_ReturnsOk()
        {
            var avgRating = new List<SingleItemWrapper<double>>
            {
                new SingleItemWrapper<double> { Val = 4.5 }
            };

            _mockDatabaseService.Setup(service => service.GetAvgReview("route1")).ReturnsAsync(avgRating);

            var result = await _controller.GetClimbAvgRating("route1");

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(4.5, okResult.Value);
        }

        [Fact]
        public async Task GetUserRelations_ReturnsOk()
        {
            var userRelations = new List<UserRelation>
            {
                new UserRelation
                {
                    User1Id = "user1",
                    User2Id = "user2",
                    RelationType = "friends",
                    RequestDate = "2023-01-01",
                    FriendSince = "2023-01-02"
                }
            };

            _mockDatabaseService.Setup(service => service.GetUserRelations()).ReturnsAsync(userRelations);

            var result = await _controller.GetUserRelations();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(userRelations, okResult.Value);
        }

        [Fact]
        public async Task GetUserRelationsForUser_ReturnsOk()
        {
            var userRelations = new List<UserRelation>
            {
                new UserRelation
                {
                    User1Id = "user1",
                    User2Id = "user2",
                    RelationType = "friends",
                    RequestDate = "2023-01-01",
                    FriendSince = "2023-01-02"
                }
            };

            _mockDatabaseService.Setup(service => service.GetUserRelationsForUser("user1")).ReturnsAsync(userRelations);

            var result = await _controller.GetUserRelationsForUser("user1");

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(userRelations, okResult.Value);
        }

        [Fact]
        public async Task GetClimbGroups_ReturnsOk()
        {
            var climbGroups = new List<ClimbGroup>
            {
                new ClimbGroup
                {
                    GroupId = 1,
                    GroupName = "Test Group",
                    GroupDescription = "A test climbing group",
                    JoinRequirements = "open",
                    Price = 0.0,
                    GroupType = "public",
                    GroupOwner = "user1",
                    GroupImage = null
                }
            };

            _mockDatabaseService.Setup(service => service.GetClimbGroups()).ReturnsAsync(climbGroups);

            var result = await _controller.GetClimbGroups();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(climbGroups, okResult.Value);
        }

        [Fact]
        public async Task GetClimbGroupRelations_ReturnsOk()
        {
            var climbGroupRelations = new List<ClimbGroupRelation>
            {
                new ClimbGroupRelation
                {
                    GroupId = 1,
                    UserId = "user1",
                    RelationType = "member",
                    InviteDate = "2023-01-01",
                    MemberSince = "2023-01-02",
                    RequestDate = "2023-01-01"
                }
            };

            _mockDatabaseService.Setup(service => service.GetClimbGroupRelations()).ReturnsAsync(climbGroupRelations);

            var result = await _controller.GetClimbGroupRelations();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(climbGroupRelations, okResult.Value);
        }

        [Fact]
        public async Task GetClimbGroupEvents_ReturnsOk()
        {
            var climbGroupEvents = new List<ClimbGroupEvent>
            {
                new ClimbGroupEvent
                {
                    EventId = 1,
                    GroupId = 1,
                    EventName = "Test Event",
                    EventDescription = "A test event",
                    EventDate = "2023-01-01",
                    EventTime = "12:00 PM",
                    EventLocation = "Test Location",
                    EventImage = null
                }
            };

            _mockDatabaseService.Setup(service => service.GetClimbGroupEvents()).ReturnsAsync(climbGroupEvents);

            var result = await _controller.GetClimbGroupEvents();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(climbGroupEvents, okResult.Value);
        }

        [Fact]
        public async Task GetBadges_ReturnsOk()
        {
            var badges = new List<Badge>
            {
                new Badge
                {
                    BadgeID = 1,
                    BadgeName = "Test Badge",
                    BadgeDescription = "A test badge",
                    BadgeRequirement = "Complete 10 climbs",
                    BadgeRarity = "rare",
                    BadgeImage = null
                }
            };

            _mockDatabaseService.Setup(service => service.GetBadges()).ReturnsAsync(badges);

            var result = await _controller.GetBadges();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(badges, okResult.Value);
        }

        [Fact]
        public async Task GetBadgeRelations_ReturnsOk()
        {
            var badgeRelations = new List<BadgeRelation>
            {
                new BadgeRelation
                {
                    UserId = "user1",
                    BadgeId = 1
                }
            };

            _mockDatabaseService.Setup(service => service.GetBadgeRelations()).ReturnsAsync(badgeRelations);

            var result = await _controller.GetBadgeRelations();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(badgeRelations, okResult.Value);
        }

        [Fact]
        public async Task GetGroupMembers_ReturnsOk()
        {
            var members = new List<User>
            {
                new User
                {
                    UserId = "user1",
                    UserName = "testusername",
                    FirstName = "Test",
                    LastName = "User",
                    Email = "test@example.com",
                    PhoneNumber = "1234567890",
                    BoulderGradeLowerLimit = "V0",
                    BoulderGradeUpperLimit = "V5",
                    RopeClimberLowerLimit = "5.8",
                    RopeClimberUpperLimit = "5.12",
                    Bio = "Climbing enthusiast"
                }
            };

            _mockDatabaseService.Setup(service => service.GetGroupMembers("1")).ReturnsAsync(members);

            var result = await _controller.GetGroupMembers("1");

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(members, okResult.Value);
        }

        // PUT Tests
        [Fact]
        public async Task UpdateUser_ValidUser_ReturnsOk()
        {
            var user = new User
            {
                UserId = "testuser1",
                UserName = "updatedusername",
                FirstName = "Updated",
                LastName = "User",
                Email = "updated@example.com",
                PhoneNumber = "9876543210",
                BoulderGradeLowerLimit = "V1",
                BoulderGradeUpperLimit = "V6",
                RopeClimberLowerLimit = "5.9",
                RopeClimberUpperLimit = "5.13",
                Bio = "Updated bio"
            };

            _mockDatabaseService.Setup(service => service.UpdateUser(user.UserId, It.IsAny<object>())).Returns(Task.CompletedTask);

            var result = await _controller.UpdateUser(user.UserId, user);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal("User updated successfully", ((dynamic)okResult.Value).message);
        }

        [Fact]
        public async Task UpdateReview_ValidReview_ReturnsOk()
        {
            var review = new Review
            {
                ReviewId = 1,
                UserId = "user1",
                UserName = "Test User",
                RouteId = "route1",
                Rating = 4,
                Text = "Updated review text"
            };

            _mockDatabaseService.Setup(service => service.UpdateReview(review.ReviewId.ToString(), review)).Returns(Task.CompletedTask);

            var result = await _controller.UpdateReview(review.ReviewId.ToString(), review);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        // DELETE Tests
        [Fact]
        public async Task DeleteUser_ValidUserId_ReturnsOk()
        {
            var userId = "testuser1";
            _mockDatabaseService.Setup(service => service.DeleteFromUserTable(userId)).Returns(Task.CompletedTask);

            var result = await _controller.DeleteUser(userId);

            var okResult = Assert.IsType<OkResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task DeleteReview_ValidReviewId_ReturnsOk()
        {
            var reviewId = "1";
            _mockDatabaseService.Setup(service => service.DeleteFromReviewTable(reviewId)).Returns(Task.CompletedTask);

            var result = await _controller.DeleteReview(reviewId);

            var okResult = Assert.IsType<OkResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        // Friend Request Tests
        [Fact]
        public async Task SendFriendRequest_ValidRequest_ReturnsOk()
        {
            var senderUserId = "user1";
            var receiverUserName = "user2";

            _mockDatabaseService.Setup(service => service.SendFriendRequest(senderUserId, receiverUserName)).Returns(Task.CompletedTask);

            var result = await _controller.SendFriendRequest(receiverUserName, senderUserId);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task AcceptFriendRequest_ValidRequest_ReturnsOk()
        {
            var senderUserId = "user1";
            var receiverUserId = "user2";

            _mockDatabaseService.Setup(service => service.AcceptFriendRequest(senderUserId, receiverUserId)).Returns(Task.CompletedTask);

            var result = await _controller.AcceptFriendRequest(senderUserId, receiverUserId);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task RejectFriendRequest_ValidRequest_ReturnsOk()
        {
            var senderUserId = "user1";
            var receiverUserId = "user2";

            _mockDatabaseService.Setup(service => service.DeleteFromUserRelationTable($"{senderUserId}:{receiverUserId}")).Returns(Task.CompletedTask);

            var result = await _controller.RejectFriendRequest(senderUserId, receiverUserId);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        // POST Tests
        [Fact]
        public async Task JoinGroup_ValidRequest_ReturnsOk()
        {
            var userId = "user1";
            var groupName = "Test Group";

            _mockDatabaseService.Setup(service => service.JoinGroup(userId, groupName)).Returns(Task.CompletedTask);

            var result = await _controller.JoinGroup(userId, groupName);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        // Test for AddPicture
        [Fact]
        public async Task AddPicture_ValidPicture_ReturnsOk()
        {
            var picture = new Picture
            {
                PictureId = 1,
                UploadDate = DateTime.UtcNow,
                UserId = "user1",
                RouteId = "route1",
                Image = new byte[] { 0x01, 0x02, 0x03 }
            };

            _mockDatabaseService.Setup(service => service.AddPicture(It.IsAny<object>())).Returns(Task.CompletedTask);

            var result = await _controller.AddPicture(picture);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal("Picture added successfully", ((dynamic)okResult.Value).message);
        }

        // Test for DeletePicture
        [Fact]
        public async Task DeletePicture_ValidPictureId_ReturnsOk()
        {
            var pictureId = 1;

            _mockDatabaseService.Setup(service => service.DeletePicture(pictureId)).Returns(Task.CompletedTask);

            var result = await _controller.DeletePicture(pictureId);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal("Picture deleted successfully", ((dynamic)okResult.Value).message);
        }

        // Test for UpdatePicture
        [Fact]
        public async Task UpdatePicture_ValidPicture_ReturnsOk()
        {
            var pictureId = 1;
            var picture = new Picture
            {
                PictureId = 1,
                UploadDate = DateTime.UtcNow,
                UserId = "user1",
                RouteId = "route1",
                Image = new byte[] { 0x04, 0x05, 0x06 }
            };

            _mockDatabaseService.Setup(service => service.UpdatePicture(pictureId, It.IsAny<object>())).Returns(Task.CompletedTask);

            var result = await _controller.UpdatePicture(pictureId, picture);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal("Picture updated successfully", ((dynamic)okResult.Value).message);
        }
    }
}