using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PharmacyManagementAPI.Data;
using PharmacyManagementAPI.Models;
using System.Threading.Tasks;

namespace PharmacyManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly PaymobService _paymobService;
        private readonly ApiDbContext _context;

        public PaymentController(PaymobService paymobService, ApiDbContext context)
        {
            _paymobService = paymobService;
            _context = context;
        }

        /// Handles the full checkout JSON payload dynamic data sent from the React page.
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
        {
            // Input Validation: Ensure data binding succeeded and required fields are valid
            if (request == null || request.TotalAmount <= 0 )
            {
                return BadRequest(new { message = "Invalid payment data. Amount must be greater than 0." });
            }

            // Split the full name into First Name and Last Name for Paymob requirements
            string firstName = "Customer";
            string lastName = "User";

            if (!string.IsNullOrEmpty(request.CustomerName))
            {
                var nameParts = request.CustomerName.Trim().Split(' ');
                firstName = nameParts[0];
                lastName = nameParts.Length > 1 ? nameParts[1] : "Customer";
            }

            // Fallback values in case optional contact fields are missing
            string email = string.IsNullOrEmpty(request.CustomerEmail) ? "customer@example.com" : request.CustomerEmail;
            string phone = string.IsNullOrEmpty(request.CustomerPhone) ? "+201234567890" : request.CustomerPhone;

            string merchant_order_id = string.IsNullOrEmpty(request.MerchantOrderId) ? "0" : request.MerchantOrderId;
            try
            {
                // Execute the service layer using dynamic customer credentials passed from React
                var (paymentUrl, paymobOrderId) = await _paymobService.CreatePaymentLink(
                    request.TotalAmount,
                    firstName,
                    lastName,
                    email,
                    phone,
                    merchant_order_id
                );

                // If this checkout is linked to an existing local order, persist the Paymob order id mapping
                if (request.OrderId.HasValue)
                {
                    var order = await _context.OnlineOrders.FindAsync(request.OrderId.Value);
                    if (order != null)
                    {
                        order.Status = "Processing";
                        await _context.SaveChangesAsync();
                    }
                }

                return Ok(new { paymentUrl = paymentUrl, paymobOrderId = paymobOrderId });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("callback")]
        public async Task<IActionResult> PaymentCallback(
    [FromQuery] string success,
    [FromQuery] string merchant_order_id,
    [FromQuery] string id) // id الخاص ببايموب
        {
            // 1. تحديد حالة الطلب الجديدة بناءً على نجاح الدفع في بايموب
            bool isSuccess = success?.ToLower() == "true";
            string newStatus = isSuccess ? "Pending" : "Failed";

            // 2. تحديث حالة الطلب في قاعدة البيانات
            if (int.TryParse(merchant_order_id, out int localOrderId))
            {
                var order = await _context.OnlineOrders.FindAsync(localOrderId);
                if (order != null)
                {
                    order.Status = newStatus;
                    await _context.SaveChangesAsync();
                }
            }

            // 3. إعادة توجيه متصفح العميل إلى صفحة النتيجة في الـ React (بورت 3000)
            // سنمرر الحالات في الـ URL للـ React لكي يعرض صفحة نجاح أو فشل للمستخدم
            string reactRedirectUrl = $"http://localhost:3000/payment-result?success={success}&orderId={merchant_order_id}";

            return Redirect(reactRedirectUrl);
        }

        /// Webhook endpoint to receive Paymob notifications (configure in Paymob dashboard)
        /// POST api/Payment/webhook
        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook([FromBody] System.Text.Json.JsonElement payload)
        {
            try
            {
                // سحب البيانات الديناميكية من الـ JSON المرسل من بايموب مباشرة
                var obj = payload.GetProperty("obj");
                bool isSuccess = obj.GetProperty("success").GetBoolean();
                string merchantOrderIdStr = obj.GetProperty("order").GetProperty("merchant_order_id").GetString();

                if (int.TryParse(merchantOrderIdStr, out int localOrderId))
                {
                    var order = await _context.OnlineOrders.FindAsync(localOrderId);
                    if (order != null)
                    {
                        // الانتقال الآمن للحالة: إذا نجحت العملية تتحول لـ Pending
                        order.Status = isSuccess ? "Pending" : "Failed";
                        await _context.SaveChangesAsync();
                    }
                }
                return Ok();
            }
            catch
            {
                // بايموب يحتاج دائماً لرؤية 200 OK حتى لا يكرر إرسال الإشعار
                return Ok();
            }
        }

        /// Endpoint called by client or webhook after payment is completed to update order status.
        /// POST api/Payment/confirm
        [HttpPost("confirm")]
        public async Task<IActionResult> ConfirmPayment([FromBody] PaymentConfirmationRequest request)
        {
            if (request == null)
            {
                return BadRequest("OrderId is required.");
            }

            var order = await _context.OnlineOrders.FindAsync(request.OrderId);
            if (order == null)
            {
                return NotFound($"Order with id {request.OrderId} not found.");
            }

            if (request.Success)
            {
                // Use provided status if present, otherwise default to Pending
                order.Status = string.IsNullOrWhiteSpace(request.Status) ? "Pending" : request.Status;
            }
            else
            {
                order.Status = string.IsNullOrWhiteSpace(request.Status) ? "Failed" : request.Status;
            }

            try
            {
                await _context.SaveChangesAsync();
                return Ok(order);
            }
            catch (System.Exception ex)
            {
                var detailedError = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new
                {
                    error = ex.Message,
                    details = detailedError,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }


    /// Dynamic Data Transfer Object (DTO) mapping the dynamic fields from React.
    public class CheckoutRequest
    {
        public decimal TotalAmount { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerPhone { get; set; }
        public string MerchantOrderId { get; set; } = string.Empty;
        // Optional: link this checkout to an existing OnlineOrder
        public int? OrderId { get; set; }
    }

    public class PaymentConfirmationRequest
    {
        public int OrderId { get; set; }
        public bool Success { get; set; } = true;
        public string? Status { get; set; }
    }
}
