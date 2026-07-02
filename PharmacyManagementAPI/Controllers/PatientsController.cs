using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmacyManagementAPI.Data;
using PharmacyManagementAPI.Models;

namespace PharmacyManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientsController : ControllerBase
    {
        private readonly ApiDbContext _context;
        public PatientsController(ApiDbContext context) { _context = context; }

        // 1. GET: api/Patients (Fetch all patient records)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Patient>>> GetPatients() => await _context.Patients.ToListAsync();

        // 2. POST: api/Patients (Register a new patient)
        [HttpPost]
        public async Task<ActionResult<Patient>> PostPatient(Patient patient)
        {
            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPatients), new { id = patient.Id }, patient);
        }

        // 3. PUT: api/Patients/{id} (Update personal and account status details)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPatient(int id, [FromBody] Patient updatedPatient)
        {
            if (id != updatedPatient.Id) return BadRequest("ID Mismatch");

            var existingPatient = await _context.Patients.FindAsync(id);
            if (existingPatient == null) return NotFound("Patient not found");

            // Explicitly sync values to database context
            existingPatient.FullName = updatedPatient.FullName;
            existingPatient.PhoneNumber = updatedPatient.PhoneNumber;
            existingPatient.Email = updatedPatient.Email;
            existingPatient.IsActive = updatedPatient.IsActive; // Handles account activation/deactivation switches

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Patients.Any(e => e.Id == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // 4. DELETE: api/Patients/{id} (Cascade data deletion safely)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null)
            {
                return NotFound();
            }

            var history = _context.PurchaseHistories.Where(h => h.PatientId == id);
            _context.PurchaseHistories.RemoveRange(history);

            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 5. GET: api/Patients/{id}/history (Fetch specific log of purchases)
        [HttpGet("{id}/history")]
        public async Task<ActionResult<IEnumerable<PurchaseHistories>>> GetHistory(int id)
        {
            return await _context.PurchaseHistories.Where(ph => ph.PatientId == id).ToListAsync();
        }

        // 6. POST: api/Patients/RecordPurchase (Core business logic processing)
        [HttpPost("RecordPurchase")]
        public async Task<IActionResult> RecordPurchase([FromBody] PurchaseRequest request)
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.PhoneNumber == request.PatientPhone);

            if (patient == null)
            {
                //return BadRequest("Patient phone number was not found in the live registry.");
                // Phone not found or anonymous → fall back to Walk-in Customer
                patient = await _context.Patients
                    .FirstOrDefaultAsync(p => p.PhoneNumber == "0000000000");

                // Create Walk-in patient once if it doesn't exist yet
                if (patient == null)
                {
                    patient = new Patient
                    {
                        FullName = "Walk-in Customer",
                        PhoneNumber = "0000000000",
                        Email = null,
                        TotalSpent = 0,
                        IsActive = true,
                        CreatedAt = DateTime.Now
                    };
                    _context.Patients.Add(patient);
                    await _context.SaveChangesAsync();
                }
            }

            if (!patient.IsActive)
            {
                return BadRequest("🚫 Access Denied: This patient profile is currently disabled and cannot process checkouts.");
            }

            var medicine = await _context.Medicines
                .FirstOrDefaultAsync(m => m.Id == request.MedicineId ||
                                          m.Name.ToLower().Trim() == request.MedicineName.ToLower().Trim());

            if (medicine == null)
                return BadRequest($"Medicine '{request.MedicineName}' (Id: {request.MedicineId}) not found in database.");

            var history = new PurchaseHistories
            {
                PatientId = patient.Id,
                MedicineId = medicine.Id,       
                MedicineName = medicine.Name,
                Quantity = request.Quantity,
                TotalPrice = request.TotalPrice,
                PurchaseDate = DateTime.Now
            };

            _context.PurchaseHistories.Add(history);

            await _context.Database.ExecuteSqlRawAsync(
                "UPDATE Patients SET TotalSpent = TotalSpent + {0} WHERE Id = {1}",
                request.TotalPrice, patient.Id
            );

            medicine.StockQuantity -= request.Quantity;

            await _context.SaveChangesAsync();
            return Ok();
        }

        // 7. GET: api/Patients/AllSales (Global logs feed for Executive Analytics)
        [HttpGet("AllSales")]
        public async Task<ActionResult<IEnumerable<PurchaseHistories>>> GetAllSales()
        {
            return await _context.PurchaseHistories.OrderByDescending(h => h.PurchaseDate).ToListAsync();
        }
    }

    public class PurchaseRequest
    {
        public string PatientPhone { get; set; } = string.Empty;
        public int MedicineId { get; set; }          
        public string MedicineName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
    }
}