using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using BoulderBuddyAPI.Controllers;
using BoulderBuddyAPI.Models;
using BoulderBuddyAPI.Services; // Ensure this matches the namespace of the IDatabaseService used in the main project
using System.Threading.Tasks;
using System.Collections.Generic;

namespace BoulderBuddyAPI.Tests.Controllers
{
    public class DatabaseControllerTest
    {
        private readonly Mock<IDatabaseService> _mockDatabaseService; // Mock the interface
        private readonly IConfiguration _mockConfiguration;
        private readonly DatabaseController _controller;

        public DatabaseControllerTest()
        {
            _mockDatabaseService = new Mock<IDatabaseService>(); // Mock the interface

            // Use a dictionary to simulate configuration
            var inMemorySettings = new Dictionary<string, string>
            {
                { "ConnectionStrings:DefaultConnection", "DataSource=:memory:" }
            };

            _mockConfiguration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            _controller = new DatabaseController(_mockDatabaseService.Object, _mockConfiguration);
        }

        [Fact]
        public async Task PostUser_ValidUser_ReturnsOk()
        {
            var user = new User { Name = "Test User", UserId = "testuser1", Email = "testuser@example.com", Password = "password123", AccountType = "Standard" };
            _mockDatabaseService.Setup(service => service.InsertIntoUserTable(user)).Returns(Task.CompletedTask);

            var result = await _controller.PostUser(user);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task PostUser_InvalidUser_ReturnsBadRequest()
        {
            // Arrange
            _controller.ModelState.AddModelError("Name", "The Name field is required.");
            var user = new User { UserId = "testuser1", Email = "testuser@example.com", Password = "password123", AccountType = "Standard" };

            // Act
            var result = await _controller.PostUser(user);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
        }

        [Fact]
        public async Task PostRoute_ValidRoute_ReturnsOk()
        {
            var route = new Route { RouteId = "1", Name = "Test Route", Grade = "5.10", Longitude = "0.0", Latitude = "0.0" };
            _mockDatabaseService.Setup(service => service.InsertIntoRouteTable(route)).Returns(Task.CompletedTask);

            var result = await _controller.PostRoute(route);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task PostReview_ValidReview_ReturnsOk()
        {
            var review = new Review { UserId = "1", RouteId = "1", Rating = "5", Text = "Great route!" };
            _mockDatabaseService.Setup(service => service.InsertIntoReviewTable(review)).Returns(Task.CompletedTask);

            var result = await _controller.PostReview(review);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task PostRecommendation_ValidRecommendation_ReturnsOk()
        {
            var recommendation = new Recommendation { RouteId = "1" };
            _mockDatabaseService.Setup(service => service.InsertIntoRecommendationTable(recommendation)).Returns(Task.CompletedTask);

            var result = await _controller.PostRecommendation(recommendation);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task GetUsers_ReturnsOk()
        {
            var users = new List<User> { new User { Name = "Test User", UserId = "testuser1", Email = "testuser@example.com", Password = "password123", AccountType = "Standard" } };
            _mockDatabaseService.Setup(service => service.GetUsers()).ReturnsAsync(users);

            var result = await _controller.GetUsers();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(users, okResult.Value);
        }

        [Fact]
        public async Task GetRoutes_ReturnsOk()
        {
            var routes = new List<Route> { new Route { RouteId = "1", Name = "Test Route", Grade = "5.10", Longitude = "0.0", Latitude = "0.0" } };
            _mockDatabaseService.Setup(service => service.GetRoutes()).ReturnsAsync(routes);

            var result = await _controller.GetRoutes();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(routes, okResult.Value);
        }

        [Fact]
        public async Task GetReviews_ReturnsOk()
        {
            var reviews = new List<Review> { new Review { UserId = "1", RouteId = "1", Rating = "5", Text = "Test Review" } };
            _mockDatabaseService.Setup(service => service.GetReviews()).ReturnsAsync(reviews);

            var result = await _controller.GetReviews();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(reviews, okResult.Value);
        }

        [Fact]
        public async Task GetRecommendations_ReturnsOk()
        {
            var recommendations = new List<Recommendation> { new Recommendation {RouteId = "1" } };
            _mockDatabaseService.Setup(service => service.GetRecommendations()).ReturnsAsync(recommendations);

            var result = await _controller.GetRecommendations();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
            Assert.Equal(recommendations, okResult.Value);
        }

        [Fact]
        public async Task DeleteUser_ValidUserId_ReturnsOk()
        {
            // Arrange
            var userId = "testuser1";
            _mockDatabaseService.Setup(service => service.DeleteFromUserTable(userId)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.DeleteUser(userId);

            // Assert
            var okResult = Assert.IsType<OkResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }


    }
}