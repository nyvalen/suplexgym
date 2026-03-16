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
    // [Authorize(Roles = "admin")] // All endpoints in this controller require admin role
    public class AdminController : ControllerBase
    {
        private readonly GymContext _context;
        private readonly IQrCodeService _qrCodeService;

        public AdminController(GymContext context, IQrCodeService qrCodeService)
        {
            _context = context;
            _qrCodeService = qrCodeService;
        }

        // ─── USER MANAGEMENT ─────────────────────────────────────────────────────

        /// <summary>
        /// List all users.
        /// FRONTEND: Admin user management table with search/filter.
        /// </summary>
        [HttpGet("users")]
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

        /// <summary>
        /// Get a single user's details.
        /// FRONTEND: Admin user detail/edit page.
        /// </summary>
        [HttpGet("users/{userId}")]
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

        /// <summary>
        /// Update a user's role or active status.
        /// FRONTEND: Admin user edit — role dropdown + "Ban/Unban" toggle button.
        /// </summary>
        [HttpPut("users/{userId}")]
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

        /// <summary>
        /// View all tickets for a specific user, including expiry and remaining days.
        /// FRONTEND: Admin "view user tickets" panel — show expiry countdown and renewal history.
        /// </summary>
        [HttpGet("users/{userId}/tickets")]
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

        /// <summary>
        /// Manually add a ticket to a user's account (no cart/payment needed).
        /// FRONTEND: Admin "Add ticket" form in user detail page.
        /// POST body: { userId, itemId, quantity }
        /// </summary>
        [HttpPost("users/{userId}/tickets")]
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

        // ─── ITEM / TICKET MANAGEMENT ─────────────────────────────────────────────

        /// <summary>
        /// Create a new item/pass available for purchase.
        /// FRONTEND: Admin item creation form → POST body with all item fields.
        /// </summary>
        [HttpPost("items")]
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

        /// <summary>
        /// Update an existing item/pass.
        /// FRONTEND: Admin item edit form → PUT body with updated fields.
        /// </summary>
        [HttpPut("items/{id}")]
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

        /// <summary>
        /// Soft-delete an item (set IsActive = false).
        /// FRONTEND: "Deactivate" button in admin items table.
        /// </summary>
        [HttpDelete("items/{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null) return NotFound();

            item.IsActive = false;
            item.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Item deactivated." });
        }

        // ─── EQUIPMENT MANAGEMENT ─────────────────────────────────────────────────

        /// <summary>
        /// Get all gym equipment. Admin only (not visible to regular users).
        /// FRONTEND: Admin "Equipment" tab — shows table of machines with status badges.
        /// </summary>
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

        /// <summary>
        /// Add new equipment to the system.
        /// FRONTEND: Admin "Add equipment" form.
        /// </summary>
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

        /// <summary>
        /// Update equipment status (operational / maintenance / out_of_order).
        /// FRONTEND: Status dropdown per equipment row in admin panel.
        /// Allowed values: "operational", "maintenance", "out_of_order"
        /// </summary>
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

        /// <summary>
        /// Soft-delete equipment.
        /// FRONTEND: "Remove" button in admin equipment list.
        /// </summary>
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