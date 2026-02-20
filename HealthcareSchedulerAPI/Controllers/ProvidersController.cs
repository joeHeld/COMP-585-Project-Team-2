using HealthcareSchedulerAPI.Data;
using HealthcareSchedulerAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthcareSchedulerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProvidersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ProvidersController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/providers
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var providers = await _db.Providers.ToListAsync();
            return Ok(providers);
        }

        // POST: api/providers
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Provider provider)
        {
            if (string.IsNullOrWhiteSpace(provider.FullName) ||
                string.IsNullOrWhiteSpace(provider.Specialty))
            {
                return BadRequest("Provider name and specialty required.");
            }

            _db.Providers.Add(provider);
            await _db.SaveChangesAsync();

            return Ok(provider);
        }
    }
}
