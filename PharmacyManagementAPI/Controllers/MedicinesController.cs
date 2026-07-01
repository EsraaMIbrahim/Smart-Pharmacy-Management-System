using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using PharmacyManagementAPI.Data;
using PharmacyManagementAPI.Models;

namespace PharmacyManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicinesController : ControllerBase
    {
        private readonly ApiDbContext _context;

        public MedicinesController(ApiDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/Medicines (Fetch all with unified relational data)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Medicine>>> GetMedicines()
        {
            return await _context.Medicines
                .Include(m => m.Ingredient)
                .ToListAsync();
        }

        // 2. POST: api/Medicines (Add New Stock Record)
        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult<Medicine>> PostMedicine(Medicine medicine)
        {
            if (string.IsNullOrWhiteSpace(medicine.Barcode))
                medicine.Barcode = null;

            var nameExists = await _context.Medicines
                .AnyAsync(m => m.Name.ToLower().Trim() == medicine.Name.ToLower().Trim());

            if (nameExists)
                return Conflict(new { message = $"The medicine '{medicine.Name}' is already in the pharmacy stock." });

            if (medicine.Barcode != null)
            {
                var barcodeExists = await _context.Medicines
                    .AnyAsync(m => m.Barcode == medicine.Barcode);
                if (barcodeExists)
                    return Conflict(new { message = $"The barcode '{medicine.Barcode}' is already assigned to another medicine." });
            }

            _context.Medicines.Add(medicine);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetMedicines), new { id = medicine.Id }, medicine);
        }

        // 3. GET: api/Medicines/FindAlternatives/{name} 
        [HttpGet("FindAlternatives/{name}")]
        public async Task<ActionResult<IEnumerable<Medicine>>> GetAlternatives(string name)
        {
            var target = await _context.Medicines
                .FirstOrDefaultAsync(m => m.Name.ToLower().Trim() == name.ToLower().Trim());

            if (target == null) return NotFound("Medicine not found in active catalog.");

            return await _context.Medicines
                .Include(m => m.Ingredient)
                .Where(m => m.IngredientId == target.IngredientId
                    && m.Name.ToLower().Trim() != target.Name.ToLower().Trim()
                    && m.StockQuantity > 0
                    && m.IsActive != false)
                .ToListAsync();
        }

        // Smart Alternative & Substitution Engine (3-Tier)
        //
        // GET api/Medicines/SmartAlternatives/{name}
        //
        // Uses the EXISTING schema (Medicine → IngredientId FK, Ingredient.TherapeuticClass):
        //
        //   Level 1 — Bio-Equivalent   : same IngredientId (identical active ingredient)
        //   Level 2 — Therapeutic Match: same IngredientId, different Category/price tier
        //                                (currently same as L1 since we have 1 ingredient per
        //                                 medicine — ready for future multi-ingredient expansion)
        //   Level 3 — Class Match      : different IngredientId but same TherapeuticClass
        //                                (e.g. Ibuprofen ↔ Diclofenac ↔ Naproxen, all "NSAID")
        [HttpGet("SmartAlternatives/{name}")]
        public async Task<IActionResult> GetSmartAlternatives(string name)
        {
            var target = await _context.Medicines
                .Include(m => m.Ingredient)
                .FirstOrDefaultAsync(m => m.Name.ToLower().Trim() == name.ToLower().Trim());

            if (target == null)
                return NotFound(new { message = $"'{name}' not found in the active catalog." });

            var therapeuticClass = target.Ingredient?.TherapeuticClass;

            // All other medicines that are in stock and active
            var candidates = await _context.Medicines
                .Include(m => m.Ingredient)
                .Where(m => m.Id != target.Id && m.StockQuantity > 0 && m.IsActive)
                .ToListAsync();

            // ── Level 1: Bio-Equivalent ──
            // Exactly the same active ingredient (same IngredientId)
            var level1 = candidates
                .Where(m => m.IngredientId == target.IngredientId)
                .Select(m => ToAlternativeDto(m, 1, "Bio-Equivalent"))
                .ToList();

            var level1Ids = level1.Select(a => a.Id).ToHashSet();

            // ── Level 2: Therapeutic Match ──
            // Same primary ingredient, meaningfully different in category or cost tier
            // (Priced >20% differently — different brand/formulation segment)
            var level2 = candidates
                .Where(m => m.IngredientId == target.IngredientId
                    && !level1Ids.Contains(m.Id)
                    && Math.Abs((double)(m.Price - target.Price) / (double)target.Price) > 0.20)
                .Select(m => ToAlternativeDto(m, 2, "Therapeutic Match"))
                .ToList();

            // ── Level 3: Class Match ──
            // Different active ingredient but same TherapeuticClass
            var level3 = new List<AlternativeDto>();
            if (!string.IsNullOrEmpty(therapeuticClass))
            {
                var usedIds = level1Ids.Union(level2.Select(a => a.Id)).ToHashSet();
                level3 = candidates
                    .Where(m => !usedIds.Contains(m.Id)
                        && m.IngredientId != target.IngredientId
                        && m.Ingredient?.TherapeuticClass == therapeuticClass)
                    .Select(m => ToAlternativeDto(m, 3, "Class Match"))
                    .ToList();
            }

            return Ok(new
            {
                targetMedicine = target.Name,
                activeIngredient = target.Ingredient?.Name,
                therapeuticClass,
                level1BioEquivalent = level1,
                level2TherapeuticMatch = level2,
                level3ClassMatch = level3,
                totalAlternativesFound = level1.Count + level2.Count + level3.Count
            });
        }

        // 4. PUT: api/Medicines/{id} — 
        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> PutMedicine(int id, [FromBody] Medicine medicine)
        {
            var existingEntry = await _context.Medicines.FindAsync(id);
            if (existingEntry == null) return NotFound();

            existingEntry.Name = medicine.Name;
            existingEntry.IngredientId = medicine.IngredientId;
            existingEntry.Price = medicine.Price;
            existingEntry.BasePrice = medicine.BasePrice;
            existingEntry.CostPrice = medicine.CostPrice;
            existingEntry.StockQuantity = medicine.StockQuantity;
            existingEntry.ExpiryDate = medicine.ExpiryDate;
            existingEntry.Category = medicine.Category;
            existingEntry.Barcode = medicine.Barcode;
            existingEntry.IsActive = medicine.IsActive;

            _context.Entry(existingEntry).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine("SQL Engine Save Error: " + ex.Message);
                return StatusCode(500, "Database context synchronization update failed.");
            }
        }

        // 5. DELETE: api/Medicines/{id} (Soft-Delete Toggle Switch)
        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> DeleteMedicine(int id)
        {
            var medicine = await _context.Medicines.FindAsync(id);
            if (medicine == null) return NotFound();

            medicine.IsActive = false;
            _context.Entry(medicine).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ── Helper ──
        private static AlternativeDto ToAlternativeDto(Medicine m, int level, string label) => new()
        {
            Id = m.Id,
            Name = m.Name,
            Price = m.Price,
            StockQuantity = m.StockQuantity,
            Category = m.Category,
            ActiveIngredient = m.Ingredient?.Name,
            TherapeuticClass = m.Ingredient?.TherapeuticClass,
            MatchLevel = level,
            MatchLabel = label
        };
    }

    // ── DTO ──
    public class AlternativeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string? Category { get; set; }
        public string? ActiveIngredient { get; set; }
        public string? TherapeuticClass { get; set; }
        public int MatchLevel { get; set; }
        public string MatchLabel { get; set; } = "";
    }
}