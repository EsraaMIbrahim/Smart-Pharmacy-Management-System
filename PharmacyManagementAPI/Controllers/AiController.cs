using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmacyManagementAPI.Data;
using PharmacyManagementAPI.Models;
using System.Text;
using System.Text.Json;

namespace PharmacyManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AiController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ApiDbContext _context;

        public AiController(IConfiguration config, IHttpClientFactory httpClientFactory, ApiDbContext context)
        {
            _config = config;
            _httpClientFactory = httpClientFactory;
            _context = context;
        }

        [HttpPost("explain-medicine")]
        public async Task<IActionResult> ExplainMedicine([FromBody] ExplainRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.MedicineName))
                return BadRequest(new { message = "Medicine name is required." });

            var apiKey = _config["GroqSettings:ApiKey"];
            var model = _config["GroqSettings:Model"] ?? "llama-3.1-8b-instant";

            var prompt = $"Explain the medicine '{request.MedicineName}' to a patient with no medical background. Use exactly these 4 sections with bold headers:\n\n**What it does:**\n**How to take it:**\n**Common side effects:**\n**What to avoid:**\n\nKeep each section to 1-3 sentences. Be clear and simple.";

            var requestBody = new
            {
                model,
                messages = new[]
                {
                    new { role = "system", content = "You are a helpful pharmacy assistant. Explain real medicines in simple, patient-friendly language. Never give specific dosage amounts. Keep responses concise. If the medicine name is not a real medicine, respond with exactly: 'UNKNOWN_MEDICINE' and nothing else." },
                    new { role = "user", content = prompt }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

            var response = await client.PostAsync("https://api.groq.com/openai/v1/chat/completions", content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, new { message = "AI service error.", details = responseBody });

            using var doc = JsonDocument.Parse(responseBody);
            var text = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            if (text != null && text.Trim() != "UNKNOWN_MEDICINE")
            {
                var normalizedName = request.MedicineName.Trim().ToLower();
                var existing = await _context.AiMedicineSearches
                    .FirstOrDefaultAsync(x => x.MedicineName.ToLower() == normalizedName);

                if (existing != null)
                {
                    existing.SearchCount++;
                    existing.LastSearchedAt = DateTime.UtcNow;
                }
                else
                {
                    _context.AiMedicineSearches.Add(new AiMedicineSearch
                    {
                        MedicineName = request.MedicineName.Trim(),
                        SearchCount = 1,
                        LastSearchedAt = DateTime.UtcNow
                    });
                }
                await _context.SaveChangesAsync();
            }

            return Ok(new { explanation = text });
        }

        [HttpGet("most-searched")]
        public async Task<IActionResult> GetMostSearched()
        {
            var top = await _context.AiMedicineSearches
                .OrderByDescending(x => x.SearchCount)
                .Take(8)
                .Select(x => new { x.MedicineName, x.SearchCount })
                .ToListAsync();

            return Ok(top);
        }

        [HttpPost("save-explanation")]
        public async Task<IActionResult> SaveExplanation([FromBody] SaveExplanationRequest request)
        {
            if (request.UserId <= 0 || string.IsNullOrWhiteSpace(request.MedicineName))
                return BadRequest(new { message = "Invalid request." });

            var alreadySaved = await _context.AiSavedExplanations
                .AnyAsync(x => x.UserId == request.UserId &&
                               x.MedicineName.ToLower() == request.MedicineName.ToLower());

            if (alreadySaved)
                return Conflict(new { message = "Already saved." });

            _context.AiSavedExplanations.Add(new AiSavedExplanation
            {
                UserId = request.UserId,
                MedicineName = request.MedicineName.Trim(),
                Explanation = request.Explanation,
                SavedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Saved successfully." });
        }

        [HttpGet("saved/{userId}")]
        public async Task<IActionResult> GetSaved(int userId)
        {
            var saved = await _context.AiSavedExplanations
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.SavedAt)
                .Select(x => new { x.Id, x.MedicineName, x.Explanation, x.SavedAt })
                .ToListAsync();

            return Ok(saved);
        }

        [HttpDelete("saved/{id}")]
        public async Task<IActionResult> DeleteSaved(int id)
        {
            var item = await _context.AiSavedExplanations.FindAsync(id);
            if (item == null) return NotFound();

            _context.AiSavedExplanations.Remove(item);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Removed." });
        }
    }

    public record ExplainRequest(string MedicineName);
    public record SaveExplanationRequest(int UserId, string MedicineName, string Explanation);
}
