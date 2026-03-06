using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using suplex_projektmunka.DTOs;
using suplex_projektmunka.Models.Context;
using suplex_projektmunka.Models.UserData;
using System.Security.Claims;

namespace suplex_projektmunka.Controllers
{
    [ApiController]
    [Route("api/user")]
    [Authorize] // All endpoints require a valid JWT token
    public class UserController : ControllerBase
    {
        private readonly GymContext _context;

        public UserController(GymContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst("userId");
            if (claim == null) return 0;
            return int.Parse(claim.Value);
        }

        /// <summary>
        /// Get the currently logged-in user's profile.
        /// FRONTEND: Load on profile/account page to display user info.
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized(new { message = "Not logged in." });
            var user = await _context.Users
                .Include(u => u.Roles)
                .Include(u => u.BillingAddress)
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return NotFound();

            return Ok(new UserProfileDto
            {
                Id = user.Id,
                Name = user.Name,
                Username = user.Username,
                Email = user.Email,
                Role = user.Roles.Role,
                CreatedAt = user.CreatedAt,
                BillingAddress = user.BillingAddress == null ? null : new BillingAddressDto
                {
                    Id = user.BillingAddress.Id,
                    ZIP_code = user.BillingAddress.ZIP_code,
                    Name = user.BillingAddress.Name,
                    StreetAddress = user.BillingAddress.StreetAddress,
                    ApartmentNumber = user.BillingAddress.ApartmentNumber,
                    City = user.BillingAddress.City,
                    State = user.BillingAddress.State
                },
                Settings = user.Settings == null ? null : new SettingsDto
                {
                    Id = user.Settings.Id,
                    DarkMode = user.Settings.DarkMode,
                    Animation = user.Settings.Animation,
                    Language = user.Settings.Language
                }
            });
        }

        /// <summary>
        /// Update user's name, username, or email.
        /// FRONTEND: Profile edit form → PUT body: { name?, username?, email? }
        /// </summary>
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = GetUserId();
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.Username) &&
                await _context.Users.AnyAsync(u => u.Username == dto.Username && u.Id != userId))
                return Conflict(new { message = "Username already taken." });

            if (!string.IsNullOrWhiteSpace(dto.Email) &&
                await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != userId))
                return Conflict(new { message = "Email already in use." });

            if (!string.IsNullOrWhiteSpace(dto.Name)) user.Name = dto.Name;
            if (!string.IsNullOrWhiteSpace(dto.Username)) user.Username = dto.Username;
            if (!string.IsNullOrWhiteSpace(dto.Email)) user.Email = dto.Email;

            user.ModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully." });
        }

        /// <summary>
        /// Change the user's password.
        /// FRONTEND: Password change form → PUT body: { currentPassword, newPassword }
        /// </summary>
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = GetUserId();
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return BadRequest(new { message = "Current password is incorrect." });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.ModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully." });
        }

        /// <summary>
        /// Save or update billing address.
        /// FRONTEND: Billing address form on profile page → PUT body: billing address fields
        /// </summary>
        [HttpPut("billing-address")]
        public async Task<IActionResult> UpdateBillingAddress([FromBody] BillingAddressDto dto)
        {
            var userId = GetUserId();
            var user = await _context.Users
                .Include(u => u.BillingAddress)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return NotFound();

            if (user.BillingAddress == null)
            {
                var address = new BillingAddress
                {
                    ZIP_code = dto.ZIP_code,
                    Name = dto.Name,
                    StreetAddress = dto.StreetAddress,
                    ApartmentNumber = dto.ApartmentNumber,
                    City = dto.City,
                    State = dto.State,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    ModifiedAt = DateTime.UtcNow
                };
                _context.BillingAddress.Add(address);
                await _context.SaveChangesAsync();
                user.BillingAddress_id = address.Id;
            }
            else
            {
                user.BillingAddress.ZIP_code = dto.ZIP_code;
                user.BillingAddress.Name = dto.Name;
                user.BillingAddress.StreetAddress = dto.StreetAddress;
                user.BillingAddress.ApartmentNumber = dto.ApartmentNumber;
                user.BillingAddress.City = dto.City;
                user.BillingAddress.State = dto.State;
                user.BillingAddress.ModifiedAt = DateTime.UtcNow;
            }

            user.ModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Billing address saved." });
        }

        /// <summary>
        /// Update user's app settings (dark mode, language, animations).
        /// FRONTEND: Settings page toggles → PUT body: { darkMode, animation, language }
        /// Apply settings immediately in the UI after successful response.
        /// </summary>
        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSettings([FromBody] SettingsDto dto)
        {
            var userId = GetUserId();
            var user = await _context.Users
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return NotFound();

            if (user.Settings == null)
            {
                var settings = new Settings
                {
                    DarkMode = dto.DarkMode,
                    Animation = dto.Animation,
                    Language = dto.Language,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    ModifiedAt = DateTime.UtcNow
                };
                _context.Settings.Add(settings);
                await _context.SaveChangesAsync();
                user.Settings_id = settings.Id;
            }
            else
            {
                user.Settings.DarkMode = dto.DarkMode;
                user.Settings.Animation = dto.Animation;
                user.Settings.Language = dto.Language;
                user.Settings.ModifiedAt = DateTime.UtcNow;
            }

            user.ModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Settings saved." });
        }
    }
}