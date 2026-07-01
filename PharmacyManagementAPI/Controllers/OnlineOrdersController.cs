using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmacyManagementAPI.Data;
using PharmacyManagementAPI.Models;

namespace PharmacyManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OnlineOrdersController : ControllerBase
    {
        private readonly ApiDbContext _context;

        public OnlineOrdersController(ApiDbContext context)
        {
            _context = context;
        }

        // --- 1. SAVE NEW ORDER 
        [HttpPost]
        public async Task<ActionResult<OnlineOrder>> PostOrder([FromBody] OnlineOrder order)
        {
            // If the data from React is missing or null, return an error immediately
            if (order == null)
            {
                return BadRequest("Order data is null.");
            }

            try
            {
                // Safety: Ensure these are set even if React forgot them
                order.OrderDate = DateTime.Now;
                if (string.IsNullOrEmpty(order.Status))
                {
                    order.Status = "Processing";
                }

                _context.OnlineOrders.Add(order);
                await _context.SaveChangesAsync();

                return Ok(order);
            }
            catch (Exception ex)
            {
                // print the exact SQL error in the Visual Studio output window
                Console.WriteLine($"Database Error: {ex.Message}");
                return BadRequest($"Error saving order: {ex.Message}");
            }
        }
        // --- 2. GET USER HISTORY (Updated for Payment Method) ---
        [HttpGet("MyHistory/{userId}")]
        public async Task<ActionResult<IEnumerable<OnlineOrder>>> GetClientHistory(int userId)
        {
            // We explicitly select the fields to ensure PaymentMethod is sent to React
            var history = await _context.OnlineOrders
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new {
                    o.Id,
                    o.OrderDate,
                    o.MedicineName,   
                    o.TotalPrice,
                    o.ShippingAddress,
                    o.PaymentMethod,  
                    o.Status
                })
                .ToListAsync();

            return Ok(history);
        }

        // --- 3. UPDATE ORDER STATUS ---
        // Example: PUT api/OnlineOrders/123/status with body { "status": "Pending" }
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Status))
            {
                return BadRequest("Status is required.");
            }

            var order = await _context.OnlineOrders.FindAsync(id);
            if (order == null)
            {
                return NotFound($"Order with id {id} not found.");
            }

            order.Status = request.Status;
            try
            {
                await _context.SaveChangesAsync();
                return Ok(order);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Database Error when updating status: {ex.Message}");
                return StatusCode(500, $"Error updating order status: {ex.Message}");
            }
        }

        [HttpGet("AllOrders")]
        public async Task<ActionResult<IEnumerable<OnlineOrder>>> GetAllOnlineOrders()
        {
            var allOrders = await _context.OnlineOrders
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new {
                    o.Id,
                    o.OrderDate,
                    o.MedicineName,
                    o.TotalPrice,
                    o.ShippingAddress,
                    o.PaymentMethod,
                    o.Status
                })
                .ToListAsync();

            return Ok(allOrders);
        }
    }

    public class StatusUpdateRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}