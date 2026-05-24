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
            // loads the Ingredient table so React has seamless access to names via medicine.ingredient.name
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
            {
                medicine.Barcode = null;
            }

            var nameExists = await _context.Medicines
                .AnyAsync(m => m.Name.ToLower().Trim() == medicine.Name.ToLower().Trim());

            if (nameExists)
            {
                return Conflict(new { message = $"The medicine '{medicine.Name}' is already in the pharmacy stock." });
            }

            if (medicine.Barcode != null)
            {
                var barcodeExists = await _context.Medicines
                    .AnyAsync(m => m.Barcode == medicine.Barcode);

                if (barcodeExists)
                {
                    return Conflict(new { message = $"The barcode '{medicine.Barcode}' is already assigned to another medicine." });
                }
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

            // Uses the true IngredientId relational link to query identical clinical compounds
            return await _context.Medicines
                .Include(m => m.Ingredient)
                .Where(m => m.IngredientId == target.IngredientId
                    && m.Name.ToLower().Trim() != target.Name.ToLower().Trim()
                    && m.StockQuantity > 0
                    && m.IsActive != false)
                .ToListAsync();
        }

        // 4. PUT: api/Medicines/{id} (Update Medicine Inventory Details)
        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> PutMedicine(int id, [FromBody] Medicine medicine)
        {
            var existingEntry = await _context.Medicines.FindAsync(id);
            if (existingEntry == null) return NotFound();

            // Explicitly sync properties to safely commit changes to SQL Server
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

            // Flip the switch to maintain historical operational tracking integrity 
            medicine.IsActive = false;
            _context.Entry(medicine).State = EntityState.Modified;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}