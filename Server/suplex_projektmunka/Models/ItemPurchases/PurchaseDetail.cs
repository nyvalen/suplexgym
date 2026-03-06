using suplex_projektmunka.Models.UserData;
using System.ComponentModel.DataAnnotations;

namespace suplex_projektmunka.Models.ItemPurchases
{
    public class PurchaseDetail
    {
        [Key]
        public int Id { get; set; }
        public int User_id { get; set; }
        public int Total { get; set; }
        public DateTime Created { get; set; }
        public DateTime Modified { get; set; }

        // Navigation properties
        public User User { get; set; } = null!;
        public ICollection<PurchaseItem> PurchaseItems { get; set; } = new List<PurchaseItem>();
    }
}