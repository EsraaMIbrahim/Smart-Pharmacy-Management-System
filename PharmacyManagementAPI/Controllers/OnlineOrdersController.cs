using Microsoft.AspNetCore.Mvc;

using Microsoft.EntityFrameworkCore;

using PharmacyManagementAPI.Data;

using PharmacyManagementAPI.Models;

[ApiController]
[Route("api/[controller]")]
public class OnlineOrdersController : ControllerBase
{
    private readonly ApiDbContext _context;

    public OnlineOrdersController(ApiDbContext context)
    {
        _context = context;
    }

    // ============================================
    // GET ALL ORDERS
    // ============================================

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OnlineOrder>>> GetOrders()
    {
        return await _context.OnlineOrders.ToListAsync();
    }

    // ============================================
    // GET USER HISTORY
    // ============================================

    [HttpGet("MyHistory/{userId}")]
    public async Task<ActionResult<IEnumerable<OnlineOrder>>> GetHistory(int userId)
    {
        return await _context.OnlineOrders
            .Where(o => o.UserId == userId)
            .ToListAsync();
    }

    // ============================================
    // CREATE ORDER
    // ============================================

    [HttpPost]
    public async Task<ActionResult<OnlineOrder>> CreateOrder(OnlineOrder order)
    {
        _context.OnlineOrders.Add(order);

        await _context.SaveChangesAsync();

        return Ok(order);
    }
}