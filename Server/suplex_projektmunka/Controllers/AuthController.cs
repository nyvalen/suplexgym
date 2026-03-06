using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using suplex_projektmunka.DTOs;
using suplex_projektmunka.Models.Context;
using suplex_projektmunka.Models.UserData;
using suplex_projektmunka.Services;

namespace suplex_projektmunka.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly GymContext _context;
        private readonly IJwtService _jwtService;
        private readonly IEmailService _emailService;

        public AuthController(GymContext context, IJwtService jwtService, IEmailService emailService)
        {
            _context = context;
            _jwtService = jwtService;
            _emailService = emailService;
        }

        /// <summary>
        /// Register a new user account.
        /// FRONTEND: Registration form → POST body: { name, username, password, email }
        /// On success show "Check your email" message and redirect to login.
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return Conflict(new { message = "Email already in use." });

            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                return Conflict(new { message = "Username already taken." });

            // Create default settings for new user
            var settings = new Settings
            {
                DarkMode = false,
                Animation = true,
                Language = "hu",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                ModifiedAt = DateTime.UtcNow
            };
            _context.Settings.Add(settings);
            await _context.SaveChangesAsync();

            var user = new User
            {
                Name = dto.Name,
                Username = dto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Email = dto.Email,
                Role_id = 2, // Default role: "user"
                Settings_id = settings.Id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                ModifiedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Send registration confirmation email
            await _emailService.SendConfirmationEmailAsync(user.Email!, user.Username!);

            return Ok(new { message = "Registration successful. Please check your email." });
        }

        /// <summary>
        /// Login with email and password.
        /// FRONTEND: Login form → POST body: { email, password }
        /// Store accessToken in memory (not localStorage), refreshToken in httpOnly cookie or secure storage.
        /// Add header to all requests: Authorization: Bearer {accessToken}
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password." });

            if (!user.IsActive)
                return Unauthorized(new { message = "Account is disabled." });

            var accessToken = _jwtService.GenerateAccessToken(user, user.Roles.Role!);
            var refreshToken = _jwtService.GenerateRefreshToken();

            user.JWT_token = accessToken;
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            user.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                Role = user.Roles.Role!,
                UserId = user.Id,
                Username = user.Username!
            });
        }

        /// <summary>
        /// Refresh the access token using a valid refresh token.
        /// FRONTEND: Call this automatically when any API request returns 401.
        /// If this also returns 401, log the user out and redirect to login.
        /// </summary>
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenDto dto)
        {
            var user = await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u =>
                    u.RefreshToken == dto.RefreshToken &&
                    u.RefreshTokenExpiry > DateTime.UtcNow);

            if (user == null)
                return Unauthorized(new { message = "Invalid or expired refresh token." });

            var newAccessToken = _jwtService.GenerateAccessToken(user, user.Roles.Role!);
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            user.JWT_token = newAccessToken;
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            user.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new AuthResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                Role = user.Roles.Role!,
                UserId = user.Id,
                Username = user.Username!
            });
        }

        /// <summary>
        /// Logout — invalidates the refresh token server-side.
        /// FRONTEND: Call on logout button, then clear stored tokens and redirect to login.
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var userId = int.Parse(User.FindFirst("userId")!.Value);
            var user = await _context.Users.FindAsync(userId);

            if (user != null)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiry = null;
                user.JWT_token = null;
                user.ModifiedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Logged out successfully." });
        }
    }
}