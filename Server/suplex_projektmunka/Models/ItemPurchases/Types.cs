using System.ComponentModel.DataAnnotations;

namespace suplex_projektmunka.Models.ItemPurchases
{
    // Ticket types: daily (napi), monthly (havi), yearly (eves)
    public class Types
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(255)]
        public string? Type { get; set; }

        public ICollection<Item> Items { get; set; } = new List<Item>();
    }
}