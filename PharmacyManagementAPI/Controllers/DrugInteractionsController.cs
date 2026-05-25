using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using PharmacyManagementAPI.Data;
using PharmacyManagementAPI.Models;

namespace PharmacyManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowReactApp")]
    public class DrugInteractionsController : ControllerBase
    {
        private readonly ApiDbContext _context;

        public DrugInteractionsController(ApiDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Checks if an incoming medicine's active ingredient interacts with any medicines currently in the cart.
        /// </summary>
        [HttpGet("check-safety")]
        public async Task<IActionResult> CheckSafety([FromQuery] List<int> cartIngredientIds, [FromQuery] int newIngredientId)
        {
            // If the cart is empty, there's nothing to interact with!
            if (cartIngredientIds == null || !cartIngredientIds.Any())
            {
                return Ok(new { interacts = false });
            }

            // Loop through each ingredient already in the cart
            foreach (var existingIngredientId in cartIngredientIds)
            {
                // Bidirectional check: covers (Ingredient1Id == New AND Ingredient2Id == Existing) 
                // OR (Ingredient1Id == Existing AND Ingredient2Id == New)
                var interaction = await _context.DrugInteractions
                    .FirstOrDefaultAsync(di =>
                        (di.Ingredient1Id == newIngredientId && di.Ingredient2Id == existingIngredientId) ||
                        (di.Ingredient1Id == existingIngredientId && di.Ingredient2Id == newIngredientId));

                // If a matching interaction row is found, trigger the guard immediately!
                if (interaction != null)
                {
                    return Ok(new
                    {
                        interacts = true,
                        severity = interaction.Severity,
                        message = interaction.WarningMessage
                    });
                }
            }

            // Safe to add to cart
            return Ok(new { interacts = false });
        }
        // How it works (no schema changes — uses existing tables):
        //   1. Load each medicine → get its IngredientId from Medicine.IngredientId FK
        //   2. Build the full N×N upper-triangle ingredient pair matrix
        //   3. Fetch ALL interaction rows in ONE query using those ingredient IDs
        //   4. Map each hit back to product names for the UI
        [HttpPost("scan-cart")]
        public async Task<IActionResult> ScanCart([FromBody] CartScanRequest request)
        {
            if (request?.MedicineIds == null || request.MedicineIds.Count < 2)
                return Ok(new { interactions = Array.Empty<object>(), safe = true });

            // Step 1 — Load medicines with their linked Ingredient
            var medicines = await _context.Medicines
                .Include(m => m.Ingredient)
                .Where(m => request.MedicineIds.Contains(m.Id))
                .ToListAsync();

            // Step 2 — Collect all unique ingredient IDs across the cart
            var allIngredientIds = medicines
                .Select(m => m.IngredientId)
                .Distinct()
                .ToList();

            if (allIngredientIds.Count < 2)
                return Ok(new { interactions = Array.Empty<object>(), safe = true });

            // Step 3 — Single query: get ALL interactions where BOTH sides are in the cart
            // The bidirectional indexes on DrugInteractions make this fast
            var allInteractions = await _context.DrugInteractions
                .Include(di => di.Ingredient1)
                .Include(di => di.Ingredient2)
                .Where(di =>
                    allIngredientIds.Contains(di.Ingredient1Id) &&
                    allIngredientIds.Contains(di.Ingredient2Id))
                .ToListAsync();

            if (!allInteractions.Any())
                return Ok(new
                {
                    interactions = Array.Empty<object>(),
                    safe = true,
                    totalPairsScanned = allIngredientIds.Count * (allIngredientIds.Count - 1) / 2
                });

            // Step 4 — Map each interaction back to medicine product names
            var warnings = allInteractions.Select(itx =>
            {
                var meds1 = medicines
                    .Where(m => m.IngredientId == itx.Ingredient1Id)
                    .Select(m => m.Name).ToList();
                var meds2 = medicines
                    .Where(m => m.IngredientId == itx.Ingredient2Id)
                    .Select(m => m.Name).ToList();

                return new
                {
                    severity = itx.Severity,
                    message = itx.WarningMessage,
                    ingredient1 = itx.Ingredient1?.Name,
                    ingredient2 = itx.Ingredient2?.Name,
                    affectedMedicines1 = meds1,
                    affectedMedicines2 = meds2
                };
            }).ToList();

            return Ok(new
            {
                interactions = warnings,
                safe = false,
                totalPairsScanned = allIngredientIds.Count * (allIngredientIds.Count - 1) / 2
            });
        }

        // Patient Profile Safety Check
        //
        // POST api/DrugInteractions/check-against-profile
        // Body: { "patientId": 2, "newMedicineIds": [5, 7] }
        //
        // Cross-references every ingredient in the new cart against the patient's
        // full medication history (from PurchaseHistories table — existing data).
        [HttpPost("check-against-profile")]
        public async Task<IActionResult> CheckAgainstProfile(
            [FromBody] ProfileCheckRequest request)
        {
            if (request?.PatientId == 0 || request?.NewMedicineIds == null)
                return BadRequest("patientId and newMedicineIds are required.");

            // Resolve patient's existing medication ingredient IDs from PurchaseHistories
            var profileIngredientIds = await _context.PurchaseHistories
                .Where(ph => ph.PatientId == request.PatientId)
                .Join(_context.Medicines,
                    ph => ph.MedicineId,
                    m => m.Id,
                    (ph, m) => m.IngredientId)
                .Distinct()
                .ToListAsync();

            if (!profileIngredientIds.Any())
                return Ok(new
                {
                    interactions = Array.Empty<object>(),
                    safe = true,
                    note = "No medication history found for this patient."
                });

            // Resolve new medicines' ingredient IDs
            var newIngredientIds = await _context.Medicines
                .Where(m => request.NewMedicineIds.Contains(m.Id))
                .Select(m => new { m.Id, m.Name, m.IngredientId, IngredientName = m.Ingredient!.Name })
                .ToListAsync();

            var newIngIds = newIngredientIds.Select(m => m.IngredientId).Distinct().ToList();

            // Single query — interactions between new cart and profile
            var interactions = await _context.DrugInteractions
                .Include(di => di.Ingredient1)
                .Include(di => di.Ingredient2)
                .Where(di =>
                    (newIngIds.Contains(di.Ingredient1Id) && profileIngredientIds.Contains(di.Ingredient2Id)) ||
                    (newIngIds.Contains(di.Ingredient2Id) && profileIngredientIds.Contains(di.Ingredient1Id)))
                .ToListAsync();

            var warnings = interactions.Select(itx =>
            {
                // Which new medicine carries the conflicting ingredient?
                var triggeringMed = newIngredientIds
                    .FirstOrDefault(m => m.IngredientId == itx.Ingredient1Id || m.IngredientId == itx.Ingredient2Id);

                var newIngName = newIngIds.Contains(itx.Ingredient1Id)
                    ? itx.Ingredient1?.Name : itx.Ingredient2?.Name;
                var profileIngName = profileIngredientIds.Contains(itx.Ingredient2Id)
                    ? itx.Ingredient2?.Name : itx.Ingredient1?.Name;

                return new
                {
                    severity = itx.Severity,
                    message = itx.WarningMessage,
                    newMedicine = triggeringMed?.Name,
                    newIngredient = newIngName,
                    conflictsWithProfileIngredient = profileIngName
                };
            }).ToList();

            return Ok(new
            {
                interactions = warnings,
                safe = !warnings.Any()
            });
        }
    }

    public class CartScanRequest
    {
        public List<int> MedicineIds { get; set; } = new();
    }

    public class ProfileCheckRequest
    {
        public int PatientId { get; set; }
        public List<int> NewMedicineIds { get; set; } = new();
    }
}