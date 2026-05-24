using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharmacyManagementAPI.Models
{
    public class PurchaseHistories
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MedicineId { get; set; }

        [ForeignKey("MedicineId")]
        public virtual Medicine? Medicine { get; set; }

        // 🔗 THE MISSING CONNECTOR: Linked to the Patient table
        [Required]
        public int PatientId { get; set; }

        [ForeignKey("PatientId")]
        public virtual Patient? Patient { get; set; } 

        [Required]
        public string MedicineName { get; set; } = string.Empty;

        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime PurchaseDate { get; set; } = DateTime.Now;
    }
}