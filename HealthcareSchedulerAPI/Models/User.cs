namespace HealthcareSchedulerAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string PasswordHash { get; set; } = "";
        public string Role { get; set; } = "Patient"; // Patient or Admin
        public string Phone { get; set; } = "";
        public string DateOfBirth { get; set; } = "";
    }
}
