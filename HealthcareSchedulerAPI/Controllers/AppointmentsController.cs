using HealthcareSchedulerAPI.Data;
using HealthcareSchedulerAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthcareSchedulerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AppointmentsController(AppDbContext db)
        {
            _db = db;
        }

// POST: api/appointments
[HttpPost]
public async Task<IActionResult> Book([FromBody] Appointment request)
{
    if (request.PatientId <= 0 || request.ProviderId <= 0)
        return BadRequest("PatientId and ProviderId are required.");

    if (string.IsNullOrWhiteSpace(request.Reason))
        return BadRequest("Reason is required.");

    var appointmentDateTime = request.AppointmentDateTime.Kind == DateTimeKind.Utc
        ? request.AppointmentDateTime.ToLocalTime()
        : request.AppointmentDateTime;

    if (appointmentDateTime <= DateTime.Now)
        return BadRequest("Appointment must be in the future.");

    var dayOfWeek = appointmentDateTime.DayOfWeek;
    if (dayOfWeek == DayOfWeek.Saturday || dayOfWeek == DayOfWeek.Sunday)
        return BadRequest("The office is closed on weekends.");

    var hour = appointmentDateTime.Hour;
    if (hour < 9 || hour >= 17)
        return BadRequest("Appointments must be booked during office hours.");

    request.AppointmentDateTime = appointmentDateTime;

    var providerConflict = await _db.Appointments.AnyAsync(a =>
        a.ProviderId == request.ProviderId &&
        a.AppointmentDateTime == request.AppointmentDateTime &&
        a.Status != "Cancelled");

    if (providerConflict)
        return Conflict("That time slot is already booked for this provider.");

    var patientConflict = await _db.Appointments.AnyAsync(a =>
        a.PatientId == request.PatientId &&
        a.AppointmentDateTime == request.AppointmentDateTime &&
        a.Status != "Cancelled");

    if (patientConflict)
        return Conflict("You already have an appointment at that time.");

    if (string.IsNullOrWhiteSpace(request.Status))
        request.Status = "Booked";

    _db.Appointments.Add(request);
    await _db.SaveChangesAsync();

    return Ok(request);
}

        // GET: api/appointments/patient/1
        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetForPatient(int patientId)
        {
            var list = await _db.Appointments
                .Where(a => a.PatientId == patientId)
                .ToListAsync();

            return Ok(list);
        }

        // GET: api/appointments/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var appt = await _db.Appointments.FindAsync(id);
            if (appt == null) return NotFound("Appointment not found.");
            return Ok(appt);
        }

        // PUT: api/appointments/reschedule/5
        [HttpPut("reschedule/{id:int}")]
        public async Task<IActionResult> Reschedule(int id, [FromBody] RescheduleDto dto)
        {
            var appt = await _db.Appointments.FindAsync(id);
            if (appt == null) return NotFound("Appointment not found.");
            if (appt.Status == "Cancelled") return BadRequest("Cancelled appointments cannot be rescheduled.");

            var dt = dto.AppointmentDateTime.Kind == DateTimeKind.Utc
                ? dto.AppointmentDateTime.ToLocalTime()
                : dto.AppointmentDateTime;

            if (dt <= DateTime.Now) return BadRequest("Appointment must be in the future.");
            if (dt.DayOfWeek == DayOfWeek.Saturday || dt.DayOfWeek == DayOfWeek.Sunday)
                return BadRequest("The office is closed on weekends.");
            if (dt.Hour < 9 || dt.Hour >= 17) return BadRequest("Appointments must be booked during office hours.");

            var conflict = await _db.Appointments.AnyAsync(a =>
                a.Id != id && a.ProviderId == appt.ProviderId &&
                a.AppointmentDateTime == dt && a.Status != "Cancelled");
            if (conflict) return Conflict("That time slot is already booked for this provider.");

            appt.AppointmentDateTime = dt;
            if (!string.IsNullOrWhiteSpace(dto.Reason)) appt.Reason = dto.Reason.Trim();
            await _db.SaveChangesAsync();
            return Ok(appt);
        }

        // POST: api/appointments/cancel/5
        [HttpPost("cancel/{id}")]
        public async Task<IActionResult> Cancel(int id)
        {
            var appt = await _db.Appointments.FindAsync(id);
            if (appt == null)
                return NotFound();

            appt.Status = "Cancelled";
            await _db.SaveChangesAsync();

            return Ok(appt);
        }

        // PUT: api/appointments/5/notes
        [HttpPut("{id:int}/notes")]
        public async Task<IActionResult> UpdateNotes(int id, [FromBody] NotesDto dto)
        {
            var appt = await _db.Appointments.FindAsync(id);
            if (appt == null) return NotFound("Appointment not found.");
            appt.Notes = dto.Notes?.Trim();
            await _db.SaveChangesAsync();
            return Ok(appt);
        }
    }

    public class RescheduleDto
    {
        public DateTime AppointmentDateTime { get; set; }
        public string? Reason { get; set; }
    }

    public class NotesDto
    {
        public string? Notes { get; set; }
    }
}
