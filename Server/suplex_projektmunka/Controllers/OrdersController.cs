using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using suplex_projektmunka.DTOs;
using suplex_projektmunka.Models.Context;
using suplex_projektmunka.Models.ItemPurchases;
using suplex_projektmunka.Services;

namespace suplex_projektmunka.Controllers
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly GymContext _context;
        private readonly IQrCodeService _qrCodeService;

        public OrdersController(GymContext context, IQrCodeService qrCodeService)
        {
            _context = context;
            _qrCodeService = qrCodeService;
        }

        private int GetUserId() => int.Parse(User.FindFirst("userId")!.Value);

        /// <summary>
        /// Get the current user's order history.
        /// FRONTEND: "My tickets" / "My orders" page.
        /// Each order contains ticket items with expiry info and QR codes.
        /// Display expiry status badge: green (active), yellow (expiring soon), red (expired).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            var userId = GetUserId();

            var orders = await _context.PurchaseDetails
                .Include(pd => pd.PurchaseItems)
                    .ThenInclude(pi => pi.Item)
                .Where(pd => pd.User_id == userId)
                .OrderByDescending(pd => pd.Created)
                .ToListAsync();

            return Ok(orders.Select(o => new OrderDto
            {
                Id = o.Id,
                Total = o.Total,
                Created = o.Created,
                Items = o.PurchaseItems.Select(pi => new OrderItemDto
                {
                    Id = pi.Id,
                    ItemName = pi.Item?.Name,
                    Quantity = pi.Quantity,
                    Price = pi.Item?.Price ?? 0,
                    ActivatedAt = pi.ActivatedAt,
                    ExpiresAt = pi.ExpiresAt,
                    IsUsed = pi.IsUsed,
                    // FRONTEND: Render QR image: <img src="data:image/png;base64,{QrCodeBase64}" />
                    QrCodeBase64 = pi.QrCodeData
                }).ToList()
            }));
        }

        /// <summary>
        /// Get a single order by ID.
        /// FRONTEND: Order detail page when user taps on an order from history.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var userId = GetUserId();
            var order = await _context.PurchaseDetails
                .Include(pd => pd.PurchaseItems)
                    .ThenInclude(pi => pi.Item)
                .FirstOrDefaultAsync(pd => pd.Id == id && pd.User_id == userId);

            if (order == null) return NotFound();

            return Ok(new OrderDto
            {
                Id = order.Id,
                Total = order.Total,
                Created = order.Created,
                Items = order.PurchaseItems.Select(pi => new OrderItemDto
                {
                    Id = pi.Id,
                    ItemName = pi.Item?.Name,
                    Quantity = pi.Quantity,
                    Price = pi.Item?.Price ?? 0,
                    ActivatedAt = pi.ActivatedAt,
                    ExpiresAt = pi.ExpiresAt,
                    IsUsed = pi.IsUsed,
                    QrCodeBase64 = pi.QrCodeData
                }).ToList()
            });
        }

        /// <summary>
        /// Checkout — converts cart items into a purchase.
        /// FRONTEND: "Checkout" / "Purchase" button on cart page.
        /// After success, clear cart UI and redirect to order confirmation page.
        /// Tickets start with ActivatedAt = now, ExpiresAt = now + validityDays.
        /// </summary>
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutDto dto)
        {
            var userId = GetUserId();

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Item)
                .FirstOrDefaultAsync(c => c.User_id == userId);

            if (cart == null || !cart.CartItems.Any())
                return BadRequest(new { message = "Cart is empty." });

            // Create purchase record
            var purchase = new PurchaseDetail
            {
                User_id = userId,
                Total = cart.Total,
                Created = DateTime.UtcNow,
                Modified = DateTime.UtcNow
            };
            _context.PurchaseDetails.Add(purchase);
            await _context.SaveChangesAsync();

            // Create purchase items with ticket expiry and QR codes
            foreach (var cartItem in cart.CartItems)
            {
                if (cartItem.Item == null) continue;

                var activatedAt = DateTime.UtcNow;
                var expiresAt = activatedAt.AddDays(cartItem.Item.ValidityDays);

                // Generate QR code for this ticket
                var qrBase64 = _qrCodeService.GenerateTicketQrCode(
                    0, // Will be updated after save
                    userId,
                    cartItem.Item.Name ?? "Ticket",
                    expiresAt
                );

                var purchaseItem = new PurchaseItem
                {
                    Purchase_id = purchase.Id,
                    Item_id = cartItem.Item_id,
                    Quantity = cartItem.Quantity,
                    ActivatedAt = activatedAt,
                    ExpiresAt = expiresAt,
                    IsUsed = false,
                    QrCodeData = qrBase64,
                    Created = DateTime.UtcNow,
                    Modified = DateTime.UtcNow
                };

                _context.PurchaseItems.Add(purchaseItem);
            }

            // Clear cart after checkout
            _context.CartItems.RemoveRange(cart.CartItems);
            cart.Total = 0;
            cart.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Order placed successfully.", orderId = purchase.Id });
        }

        /// <summary>
        /// Renew an expired ticket — creates a new ticket for the same item.
        /// FRONTEND: "Renew" button shown on expired tickets in ticket list.
        /// This adds a new ticket directly (does not go through cart).
        /// </summary>
        [HttpPost("renew/{purchaseItemId}")]
        public async Task<IActionResult> RenewTicket(int purchaseItemId)
        {
            var userId = GetUserId();

            var existingTicket = await _context.PurchaseItems
                .Include(pi => pi.Item)
                .Include(pi => pi.PurchaseDetail)
                .FirstOrDefaultAsync(pi => pi.Id == purchaseItemId &&
                                           pi.PurchaseDetail != null &&
                                           pi.PurchaseDetail.User_id == userId);

            if (existingTicket == null)
                return NotFound(new { message = "Ticket not found." });

            if (existingTicket.ExpiresAt.HasValue && existingTicket.ExpiresAt.Value > DateTime.UtcNow)
                return BadRequest(new { message = "Ticket is still active. You can only renew expired tickets." });

            var item = existingTicket.Item;
            if (item == null) return BadRequest(new { message = "Original item not found." });

            // Create a new purchase for the renewal
            var newPurchase = new PurchaseDetail
            {
                User_id = userId,
                Total = item.Price,
                Created = DateTime.UtcNow,
                Modified = DateTime.UtcNow
            };
            _context.PurchaseDetails.Add(newPurchase);
            await _context.SaveChangesAsync();

            var activatedAt = DateTime.UtcNow;
            var expiresAt = activatedAt.AddDays(item.ValidityDays);

            var qrBase64 = _qrCodeService.GenerateTicketQrCode(
                newPurchase.Id, userId, item.Name ?? "Ticket", expiresAt);

            var newTicket = new PurchaseItem
            {
                Purchase_id = newPurchase.Id,
                Item_id = item.Id,
                Quantity = 1,
                ActivatedAt = activatedAt,
                ExpiresAt = expiresAt,
                IsUsed = false,
                QrCodeData = qrBase64,
                Created = DateTime.UtcNow,
                Modified = DateTime.UtcNow
            };
            _context.PurchaseItems.Add(newTicket);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Ticket renewed successfully.",
                newTicketId = newTicket.Id,
                expiresAt = expiresAt
            });
        }

        /// <summary>
        /// Get a single ticket's QR code (for full-screen display on mobile).
        /// FRONTEND: QR code screen — show large QR image when user taps a ticket.
        /// Usage: <img src="data:image/png;base64,{qrCodeBase64}" />
        /// Works offline if QR data was already loaded and cached on device.
        /// </summary>
        [HttpGet("ticket/{purchaseItemId}/qr")]
        public async Task<IActionResult> GetTicketQrCode(int purchaseItemId)
        {
            var userId = GetUserId();
            var ticket = await _context.PurchaseItems
                .Include(pi => pi.PurchaseDetail)
                .FirstOrDefaultAsync(pi => pi.Id == purchaseItemId &&
                                           pi.PurchaseDetail != null &&
                                           pi.PurchaseDetail.User_id == userId);

            if (ticket == null) return NotFound();

            return Ok(new
            {
                ticketId = ticket.Id,
                // FRONTEND: Use this Base64 string to render the QR code image
                qrCodeBase64 = ticket.QrCodeData,
                expiresAt = ticket.ExpiresAt,
                isExpired = ticket.ExpiresAt.HasValue && ticket.ExpiresAt.Value < DateTime.UtcNow
            });
        }
    }
}