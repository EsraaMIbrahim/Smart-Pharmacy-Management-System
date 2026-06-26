using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmacyManagementAPI.Data;
using PharmacyManagementAPI.Models;

namespace PharmacyManagementAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ConsultationAppointmentsController : ControllerBase
{
    private static readonly string[] ValidStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];
    private readonly ApiDbContext _context;

    public ConsultationAppointmentsController(ApiDbContext context) => _context = context;

    [HttpPost]
    public async Task<ActionResult> Create(CreateAppointmentRequest request)
    {
        var client = await _context.Users.FindAsync(request.ClientUserId);
        if (client is null || !client.Role.Equals("Client", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "A valid client account is required." });

        var scheduledAt = request.ScheduledAt;
        if (scheduledAt <= DateTime.Now.AddHours(1))
            return BadRequest(new { message = "Appointments must be reserved at least one hour in advance." });
        if (scheduledAt.TimeOfDay < TimeSpan.FromHours(9) || scheduledAt.TimeOfDay >= TimeSpan.FromHours(18))
            return BadRequest(new { message = "Consultations are available from 9:00 AM to 6:00 PM." });

        var slotEnd = scheduledAt.AddMinutes(30);
        var slotStart = scheduledAt.AddMinutes(-30);
        bool hasConflict;
        try
        {
            hasConflict = await _context.ConsultationAppointments.AnyAsync(a =>
                a.ClientUserId == request.ClientUserId &&
                a.Status != "Cancelled" &&
                a.ScheduledAt < slotEnd && a.ScheduledAt > slotStart);
        }
        catch (Exception ex)
        {
            return DatabaseError(ex);
        }
        if (hasConflict)
            return Conflict(new { message = "You already have an appointment during this time." });

        var appointment = new ConsultationAppointment
        {
            ClientUserId = request.ClientUserId,
            ScheduledAt = scheduledAt,
            ConsultationType = request.ConsultationType.Trim(),
            Reason = request.Reason.Trim()
        };
        try
        {
            _context.ConsultationAppointments.Add(appointment);
            await _context.SaveChangesAsync();
            return Ok(ToDto(appointment, client, null));
        }
        catch (Exception ex)
        {
            return DatabaseError(ex);
        }
    }

    [HttpGet("my/{userId:int}")]
    public async Task<ActionResult> GetMine(int userId)
    {
        var appointments = await QueryAppointments()
            .Where(a => a.ClientUserId == userId)
            .OrderByDescending(a => a.ScheduledAt)
            .ToListAsync();
        return Ok(appointments.Select(a => ToDto(a, a.ClientUser, a.PharmacistUser)));
    }

    [HttpPatch("{id:int}/cancel")]
    public async Task<ActionResult> Cancel(int id, CancelAppointmentRequest request)
    {
        var appointment = await _context.ConsultationAppointments.FindAsync(id);
        if (appointment is null) return NotFound();
        if (appointment.ClientUserId != request.ClientUserId)
            return Forbid();
        if (appointment.Status is "Completed" or "Cancelled")
            return BadRequest(new { message = "This appointment can no longer be cancelled." });
        if (appointment.ScheduledAt <= DateTime.Now)
            return BadRequest(new { message = "Past appointments cannot be cancelled." });

        appointment.Status = "Cancelled";
        appointment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("management")]
    public async Task<ActionResult> GetForManagement([FromQuery] int actorUserId)
    {
        var actor = await GetManager(actorUserId);
        if (actor is null) return Forbid();

        var query = QueryAppointments();
        if (actor.Role.Equals("Pharmacist", StringComparison.OrdinalIgnoreCase))
            query = query.Where(a => a.PharmacistUserId == null || a.PharmacistUserId == actorUserId);

        var appointments = await query.OrderBy(a => a.ScheduledAt).ToListAsync();
        return Ok(appointments.Select(a => ToDto(a, a.ClientUser, a.PharmacistUser)));
    }

    [HttpGet("pharmacists")]
    public async Task<ActionResult> GetPharmacists([FromQuery] int actorUserId)
    {
        if (await GetManager(actorUserId) is null) return Forbid();
        return Ok(await _context.Users.Where(u => u.Role == "Pharmacist")
            .Select(u => new { u.Id, name = u.FullName ?? u.Username }).OrderBy(u => u.name).ToListAsync());
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult> Update(int id, UpdateAppointmentRequest request)
    {
        var actor = await GetManager(request.ActorUserId);
        if (actor is null) return Forbid();
        if (!ValidStatuses.Contains(request.Status))
            return BadRequest(new { message = "Invalid appointment status." });

        var appointment = await _context.ConsultationAppointments.FindAsync(id);
        if (appointment is null) return NotFound();

        if (actor.Role.Equals("Pharmacist", StringComparison.OrdinalIgnoreCase) &&
            appointment.PharmacistUserId.HasValue && appointment.PharmacistUserId != actor.Id)
            return Forbid();

        var pharmacistId = actor.Role.Equals("Pharmacist", StringComparison.OrdinalIgnoreCase)
            ? actor.Id : request.PharmacistUserId;
        if (pharmacistId.HasValue && !await _context.Users.AnyAsync(u => u.Id == pharmacistId && u.Role == "Pharmacist"))
            return BadRequest(new { message = "The selected pharmacist is invalid." });

        if (pharmacistId.HasValue && request.Status != "Cancelled")
        {
            var end = appointment.ScheduledAt.AddMinutes(30);
            var start = appointment.ScheduledAt.AddMinutes(-30);
            var conflict = await _context.ConsultationAppointments.AnyAsync(a => a.Id != id &&
                a.PharmacistUserId == pharmacistId && a.Status != "Cancelled" &&
                a.ScheduledAt < end && a.ScheduledAt > start);
            if (conflict) return Conflict(new { message = "This pharmacist already has an appointment in that time slot." });
        }

        appointment.Status = request.Status;
        appointment.PharmacistUserId = pharmacistId;
        appointment.StaffNotes = string.IsNullOrWhiteSpace(request.StaffNotes) ? null : request.StaffNotes.Trim();
        appointment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private Task<User?> GetManager(int id) => _context.Users.FirstOrDefaultAsync(u => u.Id == id && (u.Role == "Admin" || u.Role == "Pharmacist"));
    private IQueryable<ConsultationAppointment> QueryAppointments() => _context.ConsultationAppointments.AsNoTracking().Include(a => a.ClientUser).Include(a => a.PharmacistUser);
    private ObjectResult DatabaseError(Exception exception)
    {
        var message = exception.InnerException?.Message ?? exception.Message;
        Console.Error.WriteLine($"Consultation database error: {message}");
        return StatusCode(500, new { message = $"Database error: {message}" });
    }
    private static object ToDto(ConsultationAppointment a, User client, User? pharmacist) => new
    {
        a.Id, a.ClientUserId, clientName = client.FullName ?? client.Username, client.PhoneNumber,
        a.PharmacistUserId, pharmacistName = pharmacist == null ? null : pharmacist.FullName ?? pharmacist.Username,
        a.ScheduledAt, a.DurationMinutes, a.ConsultationType, a.Reason, a.StaffNotes, a.Status, a.CreatedAt
    };
}

public record CreateAppointmentRequest(
    [Range(1, int.MaxValue)] int ClientUserId,
    DateTime ScheduledAt,
    [Required, StringLength(80)] string ConsultationType,
    [Required, StringLength(1000)] string Reason);
public record CancelAppointmentRequest([Range(1, int.MaxValue)] int ClientUserId);
public record UpdateAppointmentRequest(
    [Range(1, int.MaxValue)] int ActorUserId,
    [Required] string Status,
    int? PharmacistUserId,
    [StringLength(1000)] string? StaffNotes);
