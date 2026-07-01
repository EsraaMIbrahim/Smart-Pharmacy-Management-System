using System.ComponentModel.DataAnnotations;

namespace PharmacyManagementAPI.Models;

public class ConsultationAppointment
{
    public int Id { get; set; }

    public int ClientUserId { get; set; }
    public User ClientUser { get; set; } = null!;

    public int? PharmacistUserId { get; set; }
    public User? PharmacistUser { get; set; }

    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; } = 30;

    [Required, StringLength(80)]
    public string ConsultationType { get; set; } = string.Empty;

    [Required, StringLength(1000)]
    public string Reason { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? StaffNotes { get; set; }

    [Required, StringLength(20)]
    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
