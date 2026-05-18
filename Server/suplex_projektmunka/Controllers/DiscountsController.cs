using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using suplex_projektmunka.DTOs;
using suplex_projektmunka.Models.Context;
using suplex_projektmunka.Models.ItemPurchases;

namespace suplex_projektmunka.Controllers
{
    [ApiController]
    [Route("api/discounts")]
    public class DiscountsController : ControllerBase
    {
        private readonly GymContext _context;

        public DiscountsController(GymContext context)
        {
            _context = context;
        }

        // ── PUBLIC ───────────────────────────────────────────────────────────

        /// <summary>
        /// Get all currently active discounts.
        /// FRONTEND (mobile + web): Call on purchase screen to overlay discounted
        /// prices on ticket cards. Match by itemId to the items list.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetActiveDiscounts()
        {
            var now = DateTime.UtcNow;
            var discounts = await _context.Discounts
                .Include(d => d.Item)
                .Where(d => d.IsActive && (d.ValidUntil == null || d.ValidUntil > now))
                .Select(d => new DiscountDto
                {
                    Id = d.Id,
                    ItemId = d.Item_id,
                    ItemName = d.Item.Name,
                    OriginalPrice = d.Item.Price,
                    DiscountPercent = d.DiscountPercent,
                    DiscountedPrice = d.DiscountedPrice,
                    ValidUntil = d.ValidUntil,
                    CreatedAt = d.CreatedAt
                })
                .ToListAsync();

            return Ok(discounts);
        }

        // ── ADMIN ─────────────────────────────────────────────────────────────

        /// <summary>Get ALL discounts including expired (admin only)</summary>
        [HttpGet("all")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllDiscounts()
        {
            var discounts = await _context.Discounts
                .Include(d => d.Item)
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => new DiscountDto
                {
                    Id = d.Id,
                    ItemId = d.Item_id,
                    ItemName = d.Item.Name,
                    OriginalPrice = d.Item.Price,
                    DiscountPercent = d.DiscountPercent,
                    DiscountedPrice = d.DiscountedPrice,
                    ValidUntil = d.ValidUntil,
                    CreatedAt = d.CreatedAt
                })
                .ToListAsync();

            return Ok(discounts);
        }

        /// <summary>
        /// Create a discount for an item. Replaces any existing active discount
        /// for the same item.
        /// FRONTEND: POST body: { itemId, discountPercent (1-99), validUntil? (ISO) }
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreateDiscount([FromBody] CreateDiscountDto dto)
        {
            if (dto.DiscountPercent < 1 || dto.DiscountPercent > 99)
                return BadRequest(new { message = "Discount percent must be between 1 and 99." });

            var item = await _context.Items.FindAsync(dto.ItemId);
            if (item == null || !item.IsActive)
                return NotFound(new { message = "Item not found." });

            // Deactivate any existing discount for this item
            var existing = await _context.Discounts
                .Where(d => d.Item_id == dto.ItemId && d.IsActive)
                .ToListAsync();
            foreach (var old in existing)
            {
                old.IsActive = false;
                old.ModifiedAt = DateTime.UtcNow;
            }

            var discountedPrice = (int)Math.Round(item.Price * (1 - dto.DiscountPercent / 100.0));

            var discount = new Discount
            {
                Item_id = dto.ItemId,
                DiscountPercent = dto.DiscountPercent,
                DiscountedPrice = discountedPrice,
                ValidUntil = dto.ValidUntil,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                ModifiedAt = DateTime.UtcNow
            };

            _context.Discounts.Add(discount);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetActiveDiscounts), new { },
                new DiscountDto
                {
                    Id = discount.Id,
                    ItemId = discount.Item_id,
                    ItemName = item.Name,
                    OriginalPrice = item.Price,
                    DiscountPercent = discount.DiscountPercent,
                    DiscountedPrice = discount.DiscountedPrice,
                    ValidUntil = discount.ValidUntil,
                    CreatedAt = discount.CreatedAt
                });
        }

        /// <summary>Delete (deactivate) a discount</summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteDiscount(int id)
        {
            var discount = await _context.Discounts.FindAsync(id);
            if (discount == null) return NotFound();

            discount.IsActive = false;
            discount.ModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Discount removed." });
        }
    }
}
