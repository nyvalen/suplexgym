using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace suplex_projektmunka.Models.ItemPurchases
{
    public class CartItem
    {
        [Key]
        public int Id { get; set; }
        public int Item_id { get; set; }
        public int Cart_id { get; set; }
        public int Quantity { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime ModifiedAt { get; set; }

        // Navigation properties
        public Item Item { get; set; } = null!;
        public Cart Cart { get; set; } = null!;
    }
}
