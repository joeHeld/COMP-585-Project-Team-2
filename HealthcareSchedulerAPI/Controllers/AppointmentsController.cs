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

    if (request.AppointmentDateTime <= DateTime.Now)
        return BadRequest("Appointment must be in the future.");

    var dayOfWeek = request.AppointmentDateTime.DayOfWeek;
    if (dayOfWeek == DayOfWeek.Saturday || dayOfWeek == DayOfWeek.Sunday)
        return BadRequest("The office is closed on weekends.");

    var hour = request.AppointmentDateTime.Hour;
    if (hour < 9 || hour >= 17)
        return BadRequest("Appointments must be booked during office hours.");

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
// GET: api/appointments/patient/1
[HttpGet("patient/{patientId}")]
public async Task<IActionResult> GetForPatient(int patientId)
{
    var list = await _db.Appointments
        .Where(a => a.PatientId == patientId)
        .Join(
            _db.Providers,
            appointment => appointment.ProviderId,
            provider => provider.Id,
            (appointment, provider) => new
            {
                appointment.Id,
                appointment.PatientId,
                appointment.ProviderId,
                appointment.AppointmentDateTime,
                appointment.Reason,
                appointment.Status,
                providerName = provider.FullName,
                providerSpecialty = provider.Specialty
            }
        )
        .ToListAsync();

    return Ok(list);
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
    }
}
