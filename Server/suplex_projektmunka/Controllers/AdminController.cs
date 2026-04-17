using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using suplex_projektmunka.DTOs;
using suplex_projektmunka.Models.Context;
using suplex_projektmunka.Models.FrontendExtraData;
using suplex_projektmunka.Models.ItemPurchases;
using suplex_projektmunka.Services;

namespace suplex_projektmunka.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "admin,staff")] // Both admin and staff can reach this controller
    public class AdminController : ControllerBase
    {
        private readonly GymContext _context;
        private readonly IQrCodeService _qrCodeService;

        public AdminController(GymContext context, IQrCodeService qrCodeService)
        {
            _context = context;
            _qrCodeService = qrCodeService;
        }

        // ── Helpers ──────────────────────────────────────────────────────────
        private bool IsAdmin() => User.IsInRole("admin");

        // ── USER MANAGEMENT (admin only) ──────────────────────────────────────

        [HttpGet("users")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.Roles)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Roles.Role,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("users/{userId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetUser(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return NotFound();

            return Ok(new AdminUserDto
            {
                Id = user.Id,
                Name = user.Name,
                Username = user.Username,
                Email = user.Email,
                Role = user.Roles.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            });
        }

        [HttpPut("users/{userId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateUser(int userId, [FromBody] AdminUpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            if (dto.RoleId.HasValue) user.Role_id = dto.RoleId.Value;
            if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;

            user.ModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User updated." });
        }

        [HttpGet("roles")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Roles
                .Where(r => r.IsActive)
                .Select(r => new { r.Id, r.Role })
                .ToListAsync();

            return Ok(roles);
        }

        [HttpGet("users/{userId}/tickets")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetUserTickets(int userId)
        {
            var tickets = await _context.PurchaseItems
                .Include(pi => pi.Item)
                .Include(pi => pi.PurchaseDetail)
                .Where(pi => pi.PurchaseDetail != null && pi.PurchaseDetail.User_id == userId)
                .ToListAsync();

            return Ok(tickets.Select(pi => new AdminTicketDto
            {
                Id = pi.Id,
                ItemName = pi.Item?.Name,
                ValidityDays = pi.Item?.ValidityDays ?? 0,
                ActivatedAt = pi.ActivatedAt,
                ExpiresAt = pi.ExpiresAt
            }));
        }

        [HttpPost("users/{userId}/tickets")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> AddTicketToUser(int userId, [FromBody] AdminAddTicketDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "User not found." });

            var item = await _context.Items.FindAsync(dto.ItemId);
            if (item == null) return NotFound(new { message = "Item not found." });

            var purchase = new PurchaseDetail
            {
                User_id = userId,
                Total = item.Price * dto.Quantity,
                Created = DateTime.UtcNow,
                Modified = DateTime.UtcNow
            };
            _context.PurchaseDetails.Add(purchase);
            await _context.SaveChangesAsync();

            var activatedAt = DateTime.UtcNow;
            var expiresAt = activatedAt.AddDays(item.ValidityDays);
            var qr = _qrCodeService.GenerateTicketQrCode(purchase.Id, userId, item.Name ?? "Ticket", expiresAt);

            var ticket = new PurchaseItem
            {
                Purchase_id = purchase.Id,
                Item_id = item.Id,
                Quantity = dto.Quantity,
                ActivatedAt = activatedAt,
                ExpiresAt = expiresAt,
                IsUsed = false,
                QrCodeData = qr,
                Created = DateTime.UtcNow,
                Modified = DateTime.UtcNow
            };
            _context.PurchaseItems.Add(ticket);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Ticket added to user.", ticketId = ticket.Id });
        }

        // ── ITEM MANAGEMENT (admin only) ──────────────────────────────────────

        [HttpPost("items")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreateItem([FromBody] CreateItemDto dto)
        {
            var item = new Item
            {
                Name = dto.Name,
                Description = dto.Description,
                ImagePath = dto.ImagePath,
                Price = dto.Price,
                Type_id = dto.Type_id,
                ValidityDays = dto.ValidityDays,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                ModifiedAt = DateTime.UtcNow
            };
            _context.Items.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetItem", "Items", new { id = item.Id },
                new { message = "Item created.", id = item.Id });
        }

        [HttpPut("items/{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateItem(int id, [FromBody] CreateItemDto dto)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null) return NotFound();

            item.Name = dto.Name;
            item.Description = dto.Description;
            item.ImagePath = dto.ImagePath;
            item.Price = dto.Price;
            item.Type_id = dto.Type_id;
            item.ValidityDays = dto.ValidityDays;
            item.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Item updated." });
        }

        [HttpDelete("items/{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null) return NotFound();

            item.IsActive = false;
            item.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Item deactivated." });
        }

        // ── EQUIPMENT MANAGEMENT (admin + staff) ──────────────────────────────

        [HttpGet("equipment")]
        public async Task<IActionResult> GetEquipment()
        {
            var equipment = await _context.Equipments
                .Where(e => e.IsActive)
                .Select(e => new EquipmentDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    SerialNumber = e.SerialNumber,
                    Status = e.Status,
                    IsActive = e.IsActive,
                    ModifiedAt = e.ModifiedAt
                })
                .ToListAsync();

            return Ok(equipment);
        }

        [HttpPost("equipment")]
        public async Task<IActionResult> CreateEquipment([FromBody] CreateEquipmentDto dto)
        {
            var equipment = new Equipment
            {
                Name = dto.Name,
                SerialNumber = dto.SerialNumber,
                Status = dto.Status,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                ModifiedAt = DateTime.UtcNow
            };

            _context.Equipments.Add(equipment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEquipment), new { id = equipment.Id },
                new { message = "Equipment added.", id = equipment.Id });
        }

        [HttpPut("equipment/{id}/status")]
        public async Task<IActionResult> UpdateEquipmentStatus(int id, [FromBody] UpdateEquipmentStatusDto dto)
        {
            var allowed = new[] { "operational", "maintenance", "out_of_order" };
            if (!allowed.Contains(dto.Status))
                return BadRequest(new { message = "Invalid status. Use: operational, maintenance, out_of_order" });

            var equipment = await _context.Equipments.FindAsync(id);
            if (equipment == null) return NotFound();

            equipment.Status = dto.Status;
            equipment.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Equipment status updated." });
        }

        [HttpDelete("equipment/{id}")]
        public async Task<IActionResult> DeleteEquipment(int id)
        {
            var equipment = await _context.Equipments.FindAsync(id);
            if (equipment == null) return NotFound();

            equipment.IsActive = false;
            equipment.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Equipment removed." });
        }
    }
}
