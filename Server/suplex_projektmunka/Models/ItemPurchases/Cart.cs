using suplex_projektmunka.Models.UserData;
using System.ComponentModel.DataAnnotations;

namespace suplex_projektmunka.Models.ItemPurchases
{
    public class Cart
    {
        [Key]
        public int Id { get; set; }
        public int User_id { get; set; }
        public int Total { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime ModifiedAt { get; set; }

        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public User User { get; set; } = null!;
    }
}
