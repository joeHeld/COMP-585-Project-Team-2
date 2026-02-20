using HealthcareSchedulerAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HealthcareSchedulerAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Provider> Providers => Set<Provider>();
        public DbSet<Appointment> Appointments => Set<Appointment>();
    }
}
