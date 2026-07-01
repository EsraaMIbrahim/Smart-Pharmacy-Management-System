using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using PharmacyManagementAPI.Models;

public class OnlineOrder
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public string MedicineName { get; set; } = string.Empty;

    [Required]
    public int Quantity { get; set; }

    [Required]
    public decimal TotalPrice { get; set; }
    [ForeignKey("MedicineId")]
    public virtual Medicine? Medicine { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.Now;

    public string ShippingAddress { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = "Cash";
    public string Status { get; set; } = "Processing";

    public int? MedicineId { get; set; }

    // Paymob order id mapping (nullable)
    //public int? PaymobOrderId { get; set; }

}
//hey! this is the online order model, I added some fields that I think are necessary for the online order, such as shipping address, payment method and status, but we can add more fields 
//fail there is something off but I did not know till now what is it, help! help! Help! I am so confused, I think I got a headache, I think I need to take a break!