using System.ComponentModel.DataAnnotations;
 
namespace suplex_projektmunka.Models.ItemPurchases
{
    public class Discount
    {
        [Key]
        public int Id { get; set; }
 
        /// <summary>Which item this discount applies to</summary>
        public int Item_id { get; set; }
 
        /// <summary>Discount percentage (1-99)</summary>
        public int DiscountPercent { get; set; }
 
        /// <summary>Pre-calculated discounted price in HUF</summary>
        public int DiscountedPrice { get; set; }
 
        /// <summary>null = indefinite</summary>
        public DateTime? ValidUntil { get; set; }
 
        public DateTime CreatedAt { get; set; }
        public DateTime ModifiedAt { get; set; }
        public bool IsActive { get; set; }
 
        // Navigation
        public Item Item { get; set; } = null!;
    }
}
 