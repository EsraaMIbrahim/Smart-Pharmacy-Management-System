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

        [JsonIgnore]
        public virtual ICollection<Medicine> Medicines { get; set; } = new List<Medicine>();
    }
}