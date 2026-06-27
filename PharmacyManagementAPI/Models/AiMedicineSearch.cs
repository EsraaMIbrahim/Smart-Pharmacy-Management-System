namespace PharmacyManagementAPI.Models
{
    public class AiMedicineSearch
    {
        public int Id { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public int SearchCount { get; set; } = 1;
        public DateTime LastSearchedAt { get; set; } = DateTime.UtcNow;
    }
}
