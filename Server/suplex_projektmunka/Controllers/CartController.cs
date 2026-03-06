using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using suplex_projektmunka.DTOs.Cart;
using suplex_projektmunka.Models.Context;
using suplex_projektmunka.Models.ItemPurchases;

namespace suplex_projektmunka.Controllers
{
    [ApiController]
    [Route("api/cart")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly GymContext _context;

        public CartController(GymContext context)
        {
            _context = context;
        }

        private int GetUserId() => int.Parse(User.FindFirst("userId")!.Value);

        private async Task<Cart> GetOrCreateCartAsync(int userId)
        {
            // Each user has one active cart at a time
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Item)
                .FirstOrDefaultAsync(c => c.User_id == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    User_id = userId,
                    Total = 0,
                    CreatedAt = DateTime.UtcNow,
                    ModifiedAt = DateTime.UtcNow
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return cart;
        }

        /// <summary>
        /// Get the current user's cart with all items.
        /// FRONTEND: Load on cart page to display items and total price.
        /// Poll this or use after any cart mutation to refresh the UI.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetUserId();
            var cart = await GetOrCreateCartAsync(userId);

            return Ok(new CartDto
            {
                Id = cart.Id,
                Total = cart.Total,
                Items = cart.CartItems.Select(ci => new CartItemDto
                {
                    Id = ci.Id,
                    Item_id = ci.Item_id,
                    ItemName = ci.Item?.Name,
                    Price = ci.Item?.Price ?? 0,
                    Quantity = ci.Quantity,
                    Subtotal = (ci.Item?.Price ?? 0) * ci.Quantity
                }).ToList()
            });
        }

        /// <summary>
        /// Add an item to the cart.
        /// FRONTEND: "Add to cart" button on product cards → POST body: { item_id, quantity }
        /// Refresh cart badge/counter after success.
        /// </summary>
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
        {
            var userId = GetUserId();
            var item = await _context.Items.FindAsync(dto.Item_id);

            if (item == null || !item.IsActive)
                return NotFound(new { message = "Item not found." });

            var cart = await GetOrCreateCartAsync(userId);

            // If item already in cart, increase quantity
            var existingItem = cart.CartItems.FirstOrDefault(ci => ci.Item_id == dto.Item_id);
            if (existingItem != null)
            {
                existingItem.Quantity += dto.Quantity;
                existingItem.ModifiedAt = DateTime.UtcNow;
            }
            else
            {
                var cartItem = new CartItem
                {
                    Cart_id = cart.Id,
                    Item_id = dto.Item_id,
                    Quantity = dto.Quantity,
                    CreatedAt = DateTime.UtcNow,
                    ModifiedAt = DateTime.UtcNow
                };
                _context.CartItems.Add(cartItem);
            }

            // Recalculate total
            await _context.SaveChangesAsync();
            await RecalculateCartTotal(cart.Id);

            return Ok(new { message = "Item added to cart." });
        }

        /// <summary>
        /// Update quantity of a cart item.
        /// FRONTEND: +/- quantity controls in cart → PUT body: { quantity }
        /// Send quantity=0 or use DELETE endpoint to remove item.
        /// </summary>
        [HttpPut("item/{cartItemId}")]
        public async Task<IActionResult> UpdateCartItem(int cartItemId, [FromBody] UpdateCartItemDto dto)
        {
            var userId = GetUserId();
            var cartItem = await _context.CartItems
                .Include(ci => ci.Cart)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.Cart.User_id == userId);

            if (cartItem == null) return NotFound();

            if (dto.Quantity <= 0)
            {
                _context.CartItems.Remove(cartItem);
            }
            else
            {
                cartItem.Quantity = dto.Quantity;
                cartItem.ModifiedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            await RecalculateCartTotal(cartItem.Cart_id);

            return Ok(new { message = "Cart updated." });
        }

        /// <summary>
        /// Remove a specific item from the cart.
        /// FRONTEND: "Remove" button (trash icon) on each cart item.
        /// </summary>
        [HttpDelete("item/{cartItemId}")]
        public async Task<IActionResult> RemoveCartItem(int cartItemId)
        {
            var userId = GetUserId();
            var cartItem = await _context.CartItems
                .Include(ci => ci.Cart)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.Cart.User_id == userId);

            if (cartItem == null) return NotFound();

            var cartId = cartItem.Cart_id;
            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();
            await RecalculateCartTotal(cartId);

            return Ok(new { message = "Item removed from cart." });
        }

        /// <summary>
        /// Clear all items from the cart.
        /// FRONTEND: "Clear cart" button, or call after successful checkout.
        /// </summary>
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetUserId();
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.User_id == userId);

            if (cart == null) return Ok(new { message = "Cart is already empty." });

            _context.CartItems.RemoveRange(cart.CartItems);
            cart.Total = 0;
            cart.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cart cleared." });
        }

        private async Task RecalculateCartTotal(int cartId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Item)
                .FirstOrDefaultAsync(c => c.Id == cartId);

            if (cart == null) return;

            cart.Total = cart.CartItems.Sum(ci => (ci.Item?.Price ?? 0) * ci.Quantity);
            cart.ModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}