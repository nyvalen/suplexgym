using System.ComponentModel.DataAnnotations;

namespace suplex_projektmunka.Models.ItemPurchases
{
    public class PurchaseItem
    {
        [Key]
        public int Id { get; set; }
        public int Purchase_id { get; set; }
        public int Item_id { get; set; }
        public int Quantity { get; set; }

        // Ticket expiry tracking
        public DateTime? ActivatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsUsed { get; set; } = false;

        // QR code data (stored as Base64 string)
        public string? QrCodeData { get; set; }

        public DateTime Created { get; set; }
        public DateTime Modified { get; set; }

        // Navigation properties
        public Item Item { get; set; } = null!;
        public PurchaseDetail? PurchaseDetail { get; set; }
    }
}
