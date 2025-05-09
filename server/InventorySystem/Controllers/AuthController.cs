using Microsoft.AspNetCore.Mvc;
using InventorySystem.Data;
using InventorySystem.Model;
using InventorySystem.Model.Entities;
using InventorySystem.Model.DTO;
using Microsoft.EntityFrameworkCore;

namespace InventorySystem.Controllers
{
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AuthController(AppDbContext context)
        {
            _context = context;
        }

         [HttpPost("register")]
         public IActionResult Register([FromBody] CreateUserDTO createUserDto)
         {
            var existingUser = _context.Users
                .FirstOrDefault(u => u.userEmail == createUserDto.userEmail);

            if (existingUser != null)
            {
                return BadRequest("Username already exists.");
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(createUserDto.userPassword);

            var user = new Users
            {
                userFullName = createUserDto.userFullName,
                userEmail = createUserDto.userEmail,
                userPassword = hashedPassword,
                createdAt = DateTime.Now
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "User registered successfully", userId = user.userId });
         }

        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLoginDTO loginDto)
        {
            var user = _context.Users
                .FirstOrDefault(u => u.userEmail == loginDto.userEmail);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.userPassword, user.userPassword))
            {
                return Unauthorized("Invalid email or password.");
            }

            return Ok(new { message = "Login successful", userId = user.userId });
        }
    }
}
