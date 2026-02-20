using System;

namespace HealthcareSchedulerAPI.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int ProviderId { get; set; }
        public DateTime AppointmentDateTime { get; set; }
        public string Reason { get; set; } = "";
        public string Status { get; set; } = "Booked"; // Booked, Cancelled
    }
}
