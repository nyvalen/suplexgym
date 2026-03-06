using System.ComponentModel.DataAnnotations;

namespace suplex_projektmunka.Models.ItemPurchases
{
    public class Item
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(30)]
        public string? Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? ImagePath { get; set; }

        public int Price { get; set; }
        public int Type_id { get; set; }

        // Ticket validity in days (1 = daily, 30 = monthly, 365 = yearly)
        public int ValidityDays { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime ModifiedAt { get; set; }
        public bool IsActive { get; set; }

        // Navigation properties
        public CartItem? CartItem { get; set; }
        public ICollection<PurchaseItem> PurchaseItems { get; set; } = new List<PurchaseItem>();
        public Types? Type { get; set; }
    }
}
