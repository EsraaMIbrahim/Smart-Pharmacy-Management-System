using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PharmacyManagementAPI.Models
{
    public class Ingredient
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Used by Level 3 (Class Match) substitution engine.
        /// Examples: "NSAID", "Statin", "Antihistamine", "Penicillin-Antibiotic"
        /// No schema change needed — just a new nullable column on the existing table.
        /// </summary>
        [MaxLength(100)]
        public string? TherapeuticClass { get; set; }

        [JsonIgnore]
        public virtual ICollection<Medicine> Medicines { get; set; } = new List<Medicine>();
    }
}