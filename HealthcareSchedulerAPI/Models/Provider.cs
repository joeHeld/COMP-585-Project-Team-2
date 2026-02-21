namespace HealthcareSchedulerAPI.Models
{
    public class Provider
    {
        public int ProviderId { get; set; }
        public string FullName { get; set; } = "";
        public string Specialty { get; set; } = "";
        public string WorkingHours { get; set; } = ""; // Example: "Mon-Fri 9am-5pm"
    }
}
