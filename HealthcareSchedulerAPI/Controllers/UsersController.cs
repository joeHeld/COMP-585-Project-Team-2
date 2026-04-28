using BCrypt.Net;
using HealthcareSchedulerAPI.Data;
using HealthcareSchedulerAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthcareSchedulerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UsersController(AppDbContext db)
        {
            _db = db;
        }

        // POST: api/users/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("Email and password are required.");

            var exists = await _db.Users.AnyAsync(u => u.Email == dto.Email);
            if (exists) return BadRequest("Email already exists.");

            var user = new User
            {
                FullName = dto.FullName ?? "",
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role ?? "Patient",
                Phone = dto.Phone ?? "",
                DateOfBirth = dto.DateOfBirth ?? ""
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok(new { user.Id, user.FullName, user.Email, user.Role, user.Phone, user.DateOfBirth });
        }

        // POST: api/users/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null) return Unauthorized("Invalid email or password.");

            var ok = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            if (!ok) return Unauthorized("Invalid email or password.");

            return Ok(new { user.Id, user.FullName, user.Email, user.Role, user.Phone, user.DateOfBirth });
        }

        // GET: api/users/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound("User not found.");

            return Ok(new { user.Id, user.FullName, user.Email, user.Role, user.Phone, user.DateOfBirth });
        }

        // PUT: api/users/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UserUpdateDto dto)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound("User not found.");

            if (string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest("Full name and email are required.");

            var emailTaken = await _db.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id);
            if (emailTaken) return BadRequest("Email already exists.");

            user.FullName = dto.FullName.Trim();
            user.Email = dto.Email.Trim();
            user.Phone = dto.Phone?.Trim() ?? user.Phone;
            user.DateOfBirth = dto.DateOfBirth?.Trim() ?? user.DateOfBirth;

            await _db.SaveChangesAsync();

            return Ok(new { user.Id, user.FullName, user.Email, user.Role, user.Phone, user.DateOfBirth });
        }
    }

    public class UserRegisterDto
    {
        public string? FullName { get; set; }
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string? Role { get; set; } // Patient/Admin/etc.
        public string? Phone { get; set; }
        public string? DateOfBirth { get; set; }
    }

    public class UserLoginDto
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class UserUpdateDto
    {
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string? Phone { get; set; }
        public string? DateOfBirth { get; set; }
    }
}
