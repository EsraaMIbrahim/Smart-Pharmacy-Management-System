using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharmacyManagementAPI.Models
{
    public class Medicine
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        // 🔗 NEW LINK: Instead of just a string, we link to the Ingredient ID
        [Required]
        public int IngredientId { get; set; }

        [ForeignKey("IngredientId")]
        public virtual Ingredient? Ingredient { get; set; }

        public decimal Price { get; set; }

        public decimal BasePrice { get; set; } // For Discount Engine

        public decimal CostPrice { get; set; } // What we paid the supplier

        public int StockQuantity { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string? Category { get; set; }
        public string? Barcode { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        public virtual ICollection<OnlineOrder> OnlineOrders { get; set; } = new List<OnlineOrder>();
        public virtual ICollection<PurchaseHistories> PurchaseHistories { get; set; } = new List<PurchaseHistories>();
    }
}