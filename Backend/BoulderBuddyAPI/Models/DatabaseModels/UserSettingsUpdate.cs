namespace BoulderBuddyAPI.Models.DatabaseModels
{
    public class UserSettingsUpdate
    {
        public required string UserID { get; set; }
        public string? AccountType { get; set; }
        public string? EnableReviewCommentNotifications { get; set; }
        public string? EnableGroupInviteNotifications { get; set; }
    }
}
