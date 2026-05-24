using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmacyManagementAPI.Data;

namespace PharmacyManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly ApiDbContext _context;

        public AnalyticsController(ApiDbContext context)
        {
            _context = context;
        }

        // ══════════════════════════════════════════════════════════════
        // ENDPOINT 1: Dashboard KPI Cards
        // GET /api/Analytics/DashboardMetrics
        // ══════════════════════════════════════════════════════════════
        [HttpGet("DashboardMetrics")]
        public async Task<IActionResult> GetDashboardMetrics()
        {
            try
            {
                var today = DateTime.Today;
                var sevenDaysAgo = today.AddDays(-7);
                var thirtyDaysAgo = today.AddDays(-30);

                // ── IN-STORE SALES (PurchaseHistory table) ──
                var staffSales = await _context.PurchaseHistories.ToListAsync();

                var staffTotalToday = staffSales.Where(s => s.PurchaseDate.Date == today).Sum(s => s.TotalPrice);
                var staffTotalWeek = staffSales.Where(s => s.PurchaseDate >= sevenDaysAgo).Sum(s => s.TotalPrice);
                var staffTotalMonth = staffSales.Where(s => s.PurchaseDate >= thirtyDaysAgo).Sum(s => s.TotalPrice);
                var totalStaffRevenue = staffSales.Sum(s => s.TotalPrice);

                // ── ONLINE ORDERS (OnlineOrders table) ──
                var onlineOrders = await _context.OnlineOrders.ToListAsync();
                var validOnline = onlineOrders.Where(o => o.Status != "Cancelled").ToList();

                var onlineTotalToday = validOnline.Where(o => o.OrderDate.Date == today).Sum(o => o.TotalPrice);
                var onlineTotalWeek = validOnline.Where(o => o.OrderDate >= sevenDaysAgo).Sum(o => o.TotalPrice);
                var onlineTotalMonth = validOnline.Where(o => o.OrderDate >= thirtyDaysAgo).Sum(o => o.TotalPrice);
                var totalOnlineRevenue = validOnline.Sum(o => o.TotalPrice);

                // ── PROCUREMENT COSTS (PurchaseOrders table) ──
                // Real cost = CostPrice (per unit) × QuantityReceived
                var supplierOrders = await _context.PurchaseOrders.ToListAsync();
                var totalExpenses = supplierOrders.Sum(s => s.CostPrice * s.QuantityReceived);

                // ── EXPIRY RISK (Medicines table) ──
                var medicines = await _context.Medicines.ToListAsync();
                var capitalAtRisk = medicines
                    .Where(m => m.IsActive != false
                             && m.ExpiryDate >= today
                             && m.ExpiryDate <= today.AddDays(30))
                    .Sum(m => m.StockQuantity * m.Price);

                // ── PAYMENT METHOD BREAKDOWN (OnlineOrders) ──
                var paymentBreakdown = onlineOrders
                    .Where(o => !string.IsNullOrEmpty(o.PaymentMethod))
                    .GroupBy(o => o.PaymentMethod)
                    .Select(g => new { method = g.Key, count = g.Count() })
                    .ToList();

                // ── FINANCIAL CONSOLIDATION ──
                var grossRevenue = totalStaffRevenue + totalOnlineRevenue;
                var netProfit = grossRevenue - totalExpenses;

                return Ok(new
                {
                    timeFrames = new
                    {
                        todayTotal = staffTotalToday + onlineTotalToday,
                        weekTotal = staffTotalWeek + onlineTotalWeek,
                        monthTotal = staffTotalMonth + onlineTotalMonth
                    },
                    inStoreVsOnline = new
                    {
                        inStoreTotal = totalStaffRevenue,
                        onlineTotal = totalOnlineRevenue
                    },
                    finances = new
                    {
                        grossRevenue = grossRevenue,
                        totalExpenses = totalExpenses,
                        netProfit = netProfit
                    },
                    riskMetrics = new
                    {
                        capitalAtRisk = capitalAtRisk
                    },
                    clientMetrics = new
                    {
                        totalPendingOrders = onlineOrders.Count(o => o.Status == "Processing"),
                        totalCompletedOrders = onlineOrders.Count(o => o.Status == "Completed" || o.Status == "Delivered"),
                        paymentBreakdown = paymentBreakdown,
                        topShippingAddresses = onlineOrders
                            .Where(o => !string.IsNullOrEmpty(o.ShippingAddress))
                            .GroupBy(o => o.ShippingAddress)
                            .Select(g => new { address = g.Key, count = g.Count() })
                            .OrderByDescending(x => x.count)
                            .Take(3)
                            .ToList()
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DashboardMetrics Error]: {ex.Message}");
                return StatusCode(500, $"Analytics error: {ex.Message}");
            }
        }

        // ══════════════════════════════════════════════════════════════
        // ENDPOINT 2: Revenue vs Cost chart data (daily, last 30 days)
        // GET /api/Analytics/SalesTrend
        // ══════════════════════════════════════════════════════════════
        [HttpGet("SalesTrend")]
        public async Task<IActionResult> GetSalesTrend()
        {
            try
            {
                // Revenue comes from PurchaseHistory (in-store sales per day)
                var staffSales = await _context.PurchaseHistories.ToListAsync();

                // Cost comes from PurchaseOrders (what we paid suppliers per day)
                var supplierOrders = await _context.PurchaseOrders.ToListAsync();

                // Build a full list of the last 30 days so days with no sales still appear
                var last30Days = Enumerable.Range(0, 30)
                    .Select(i => DateTime.Today.AddDays(-29 + i))
                    .ToList();

                var result = last30Days.Select(day => {
                    var dayRevenue = staffSales
                        .Where(s => s.PurchaseDate.Date == day.Date)
                        .Sum(s => s.TotalPrice);

                    var dayCost = supplierOrders
                        .Where(p => p.OrderDate.Date == day.Date)
                        .Sum(p => p.CostPrice * p.QuantityReceived);

                    return new
                    {
                        date = day.ToString("yyyy-MM-dd"),
                        revenue = dayRevenue,
                        cost = dayCost,
                        profit = dayRevenue - dayCost,
                        orders = staffSales.Count(s => s.PurchaseDate.Date == day.Date)
                    };
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SalesTrend Error]: {ex.Message}");
                return StatusCode(500, $"SalesTrend error: {ex.Message}");
            }
        }

        // ══════════════════════════════════════════════════════════════
        // ENDPOINT 3: Top selling medicines by revenue
        // GET /api/Analytics/TopProducts
        // ══════════════════════════════════════════════════════════════
        [HttpGet("TopProducts")]
        public async Task<IActionResult> GetTopProducts()
        {
            try
            {
                // PurchaseHistory has MedicineName, Quantity, TotalPrice
                var result = await _context.PurchaseHistories
                    .GroupBy(s => s.MedicineName)
                    .Select(g => new
                    {
                        name = g.Key,
                        sold = g.Sum(s => s.Quantity),
                        revenue = g.Sum(s => s.TotalPrice)
                    })
                    .OrderByDescending(x => x.revenue)
                    .Take(6)
                    .ToListAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[TopProducts Error]: {ex.Message}");
                return StatusCode(500, $"TopProducts error: {ex.Message}");
            }
        }

        // ══════════════════════════════════════════════════════════════
        // ENDPOINT 4: Shipments table (PurchaseOrders joined with names)
        // GET /api/Analytics/Shipments
        // ══════════════════════════════════════════════════════════════
        [HttpGet("Shipments")]
        public async Task<IActionResult> GetShipments()
        {
            try
            {
                // Reuse the same manual join pattern you already use in SuppliersController
                var result = await _context.PurchaseOrders
                    .OrderByDescending(p => p.OrderDate)
                    .Take(10)
                    .Select(p => new
                    {
                        supplier = _context.Suppliers
                            .Where(s => s.Id == p.SupplierId)
                            .Select(s => s.Name)
                            .FirstOrDefault() ?? "Unknown",
                        medicine = _context.Medicines
                            .Where(m => m.Id == p.MedicineId)
                            .Select(m => m.Name)
                            .FirstOrDefault() ?? "Unknown",
                        date = p.OrderDate.ToString("yyyy-MM-dd"),
                        items = p.QuantityReceived,
                        // Real total cost of this shipment
                        amount = p.CostPrice * p.QuantityReceived
                    })
                    .ToListAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Shipments Error]: {ex.Message}");
                return StatusCode(500, $"Shipments error: {ex.Message}");
            }
        }

        // ══════════════════════════════════════════════════════════════
        // ENDPOINT 5: Monthly online orders breakdown (client portal)
        // GET /api/Analytics/ClientOrders
        // ══════════════════════════════════════════════════════════════
        [HttpGet("ClientOrders")]
        public async Task<IActionResult> GetClientOrders()
        {
            try
            {
                var onlineOrders = await _context.OnlineOrders
                    .Where(o => o.Status != "Cancelled")
                    .ToListAsync();

                // In-store sales by month from PurchaseHistory
                var staffSales = await _context.PurchaseHistories.ToListAsync();

                // Group both by month name for the last 6 months
                var last6Months = Enumerable.Range(0, 6)
                    .Select(i => DateTime.Today.AddMonths(-5 + i))
                    .ToList();

                var result = last6Months.Select(m => new
                {
                    month = m.ToString("MMM"),
                    online = onlineOrders.Count(o => o.OrderDate.Year == m.Year && o.OrderDate.Month == m.Month),
                    inStore = staffSales.Count(s => s.PurchaseDate.Year == m.Year && s.PurchaseDate.Month == m.Month),
                    onlineRevenue = onlineOrders
                        .Where(o => o.OrderDate.Year == m.Year && o.OrderDate.Month == m.Month)
                        .Sum(o => o.TotalPrice),
                    inStoreRevenue = staffSales
                        .Where(s => s.PurchaseDate.Year == m.Year && s.PurchaseDate.Month == m.Month)
                        .Sum(s => s.TotalPrice)
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ClientOrders Error]: {ex.Message}");
                return StatusCode(500, $"ClientOrders error: {ex.Message}");
            }
        }

        // ══════════════════════════════════════════════════════════════
        // ENDPOINT 6: Expiry engine — medicines with active discounts
        // GET /api/Analytics/ExpiryEngine
        // ══════════════════════════════════════════════════════════════
        [HttpGet("ExpiryEngine")]
        public async Task<IActionResult> GetExpiryEngine()
        {
            try
            {
                var today = DateTime.Today;
                var medicines = await _context.Medicines
                    .Where(m => m.IsActive != false
                             && m.ExpiryDate >= today
                             && m.ExpiryDate <= today.AddDays(30)
                             && m.BasePrice > m.Price) // discount has been applied
                    .ToListAsync();

                var result = medicines.Select(m =>
                {
                    var daysLeft = (m.ExpiryDate - today).Days;
                    var discountPct = m.BasePrice > 0
                        ? Math.Round(((m.BasePrice - m.Price) / m.BasePrice) * 100, 0)
                        : 0;
                    // Capital saved = what we recovered vs selling at 0
                    var recovered = m.Price * m.StockQuantity ;

                    return new
                    {
                        medicine = m.Name,
                        daysLeft = daysLeft,
                        basePrice = m.BasePrice,
                        currentPrice = m.Price,
                        discountPct = discountPct,
                        units = m.StockQuantity,
                        mechanism = $"{discountPct}% discount",
                        saved = recovered  // EGP recoverable before expiry
                    };
                })
                .OrderBy(x => x.daysLeft)
                .ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ExpiryEngine Error]: {ex.Message}");
                return StatusCode(500, $"ExpiryEngine error: {ex.Message}");
            }
        }
    }
}