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
    }
}