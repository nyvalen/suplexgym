namespace suplex_projektmunka.DTOs
{
    // DTO for listing items/tickets
    // FRONTEND: GET /api/items - product listing page, filter by type_id for category tabs
    public class ItemDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? ImagePath { get; set; }
        public int Price { get; set; }
        public int ValidityDays { get; set; }
        public string? TypeName { get; set; }
        public int Type_id { get; set; }
    }

    // DTO for creating/updating items (admin only)
    // FRONTEND: POST/PUT /api/admin/items - admin item management form
    public class CreateItemDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImagePath { get; set; }
        public int Price { get; set; }
        public int Type_id { get; set; }
        public int ValidityDays { get; set; }
    }
}

namespace suplex_projektmunka.DTOs.Cart
{
    // DTO for viewing cart
    // FRONTEND: GET /api/cart - cart page, display items and total
    public class CartDto
    {
        public int Id { get; set; }
        public int Total { get; set; }
        public List<CartItemDto> Items { get; set; } = new();
    }

    public class CartItemDto
    {
        public int Id { get; set; }
        public int Item_id { get; set; }
        public string? ItemName { get; set; }
        public int Price { get; set; }
        public int Quantity { get; set; }
        public int Subtotal { get; set; }
    }

    // DTO for adding item to cart
    // FRONTEND: POST /api/cart/add - "Add to cart" button handler
    public class AddToCartDto
    {
        public int Item_id { get; set; }
        public int Quantity { get; set; } = 1;
    }

    // DTO for updating cart item quantity
    // FRONTEND: PUT /api/cart/item/{id} - quantity +/- controls in cart
    public class UpdateCartItemDto
    {
        public int Quantity { get; set; }
    }
}




























