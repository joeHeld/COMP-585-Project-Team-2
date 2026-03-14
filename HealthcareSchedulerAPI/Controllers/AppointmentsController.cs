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

            if (request.AppointmentDateTime <= DateTime.UtcNow)
                return BadRequest("Appointment must be in the future.");

            //  Double booking prevention
            var conflict = await _db.Appointments.AnyAsync(a =>
                a.ProviderId == request.ProviderId &&
                a.AppointmentDateTime == request.AppointmentDateTime &&
                a.Status == "Booked");

            if (conflict)
                return Conflict("That time slot is already booked.");

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
