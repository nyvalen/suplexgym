namespace suplex_projektmunka.DTOs
{
    // DTO for viewing order history
    // FRONTEND: GET /api/orders - "My orders" page
    public class OrderDto
    {
        public int Id { get; set; }
        public int Total { get; set; }
        public DateTime Created { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }

    public class OrderItemDto
    {
        public int Id { get; set; }
        public string? ItemName { get; set; }
        public int Quantity { get; set; }
        public int Price { get; set; }

        // Ticket/pass details
        // FRONTEND: show expiry badge on ticket card; if expired show "Expired" + renew button
        public DateTime? ActivatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsExpired => ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;
        public bool IsUsed { get; set; }

        // FRONTEND: display QR code image from this Base64 string
        // Use: <img src="data:image/png;base64,{QrCodeBase64}" />
        public string? QrCodeBase64 { get; set; }
    }

    // DTO for placing an order (checkout)
    // FRONTEND: POST /api/orders/checkout - checkout button handler
    public class CheckoutDto
    {
        // If null, uses the user's stored billing address
        public int? BillingAddressId { get; set; }
    }

    // DTO for renewing an expired ticket
    // FRONTEND: POST /api/orders/renew/{purchaseItemId} - "Renew" button on expired ticket
    public class RenewTicketDto
    {
        public int PurchaseItemId { get; set; }
    }
}