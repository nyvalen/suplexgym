using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using suplex_projektmunka.DTOs;
using suplex_projektmunka.Models.Context;
namespace suplex_projektmunka.Controllers
{
    [ApiController]
    [Route("api/items")]
    public class ItemsController : ControllerBase
    {
        private readonly GymContext _context;

        public ItemsController(GymContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all available tickets/passes, optionally filtered by type.
        /// FRONTEND: Product listing page. Use ?typeId=1 for daily, 2 for monthly, 3 for yearly.
        /// Render category tabs that call this endpoint with the matching typeId.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetItems([FromQuery] int? typeId)
        {
            var query = _context.Items
                .Include(i => i.Type)
                .Where(i => i.IsActive);

            if (typeId.HasValue)
                query = query.Where(i => i.Type_id == typeId.Value);

            var items = await query.Select(i => new ItemDto
            {
                Id = i.Id,
                Name = i.Name,
                Description = i.Description,
                ImagePath = i.ImagePath,
                Price = i.Price,
                ValidityDays = i.ValidityDays,
                TypeName = i.Type != null ? i.Type.Type : null,
                Type_id = i.Type_id
            }).ToListAsync();

            return Ok(items);
        }

        /// <summary>
        /// Get a single item by ID.
        /// FRONTEND: Item detail page or product modal.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetItem(int id)
        {
            var item = await _context.Items
                .Include(i => i.Type)
                .FirstOrDefaultAsync(i => i.Id == id && i.IsActive);

            if (item == null) return NotFound();

            return Ok(new ItemDto
            {
                Id = item.Id,
                Name = item.Name,
                Description = item.Description,
                ImagePath = item.ImagePath,
                Price = item.Price,
                ValidityDays = item.ValidityDays,
                TypeName = item.Type?.Type,
                Type_id = item.Type_id
            });
        }

        /// <summary>
        /// Get all ticket types (daily, monthly, yearly).
        /// FRONTEND: Use to populate category filter tabs/buttons on product listing page.
        /// </summary>
        [HttpGet("types")]
        public async Task<IActionResult> GetTypes()
        {
            var types = await _context.Types.ToListAsync();
            return Ok(types.Select(t => new { t.Id, t.Type }));
        }
    }
}