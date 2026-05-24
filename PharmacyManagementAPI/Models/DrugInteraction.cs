using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharmacyManagementAPI.Models
{
    public class DrugInteraction
    {
        [Key]
        public int Id { get; set; }

        // 🔗 PHYSICAL LINK: This one will show a line in your diagram
        [Required]
        public int Ingredient1Id { get; set; }

        [ForeignKey("Ingredient1Id")]
        public virtual Ingredients? Ingredient1 { get; set; }

        // We keep the ID for logic, but remove the physical constraint 
        // to stop the "Multiple Cascade Paths" error.
        [Required]
        public int Ingredient2Id { get; set; }

        public string? Severity { get; set; }
        public string? WarningMessage { get; set; }
        //hey my team friends, I think we should add more than one ingredient to the interaction, because some interactions involve more than two medicines, so we can add a list of ingredients and then we can check if any of the ingredients in the list interact with each other, but for now I will stick with two ingredients for simplicity
    }
}