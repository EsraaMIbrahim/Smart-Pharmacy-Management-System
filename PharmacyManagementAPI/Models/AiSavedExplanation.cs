namespace PharmacyManagementAPI.Models
{
    public class AiSavedExplanation
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public string Explanation { get; set; } = string.Empty;
        public DateTime SavedAt { get; set; } = DateTime.UtcNow;
    }
}
