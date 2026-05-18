namespace suplex_projektmunka.DTOs
{
    // DTO returned by GET /api/discounts and GET /api/admin/discounts
    public class DiscountDto
    {
        public int Id { get; set; }
        public int ItemId { get; set; }
        public string? ItemName { get; set; }
        public int OriginalPrice { get; set; }
        public int DiscountPercent { get; set; }
        public int DiscountedPrice { get; set; }
        public DateTime? ValidUntil { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsExpired => ValidUntil.HasValue && ValidUntil.Value < DateTime.UtcNow;
    }

    // DTO for creating a discount (admin only)
    public class CreateDiscountDto
    {
        public int ItemId { get; set; }
        public int DiscountPercent { get; set; }
        public DateTime? ValidUntil { get; set; }
    }
}
