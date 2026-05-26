using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase 
{
    private readonly PaymobService _paymobService;

    public PaymentController(PaymobService paymobService)
    {
        _paymobService = paymobService;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromForm] decimal totalAmount)
    {
        string firstName = "Maurice";
        string lastName = "Rouphail";
        string email = "maurice@example.com";
        string phone = "+201234567890";

        string paymentUrl = await _paymobService.CreatePaymentLink(totalAmount, firstName, lastName, email, phone);

        // Return Redirect url
        return Ok(new { url = paymentUrl });
    }
}