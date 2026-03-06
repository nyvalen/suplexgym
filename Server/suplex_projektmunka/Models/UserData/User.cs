using suplex_projektmunka.Models.ItemPurchases;
using System.ComponentModel.DataAnnotations;

namespace suplex_projektmunka.Models.UserData
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(50)]
        public string? Name { get; set; }

        [MaxLength(15)]
        public string? Username { get; set; }

        [MaxLength(255)]
        public string? PasswordHash { get; set; }

        [MaxLength(255)]
        public string? JWT_token { get; set; }

        [MaxLength(255)]
        public string? RefreshToken { get; set; }

        public DateTime? RefreshTokenExpiry { get; set; }

        public string? Email { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime ModifiedAt { get; set; }
        public bool IsActive { get; set; }

        public int Role_id { get; set; }
        public int? BillingAddress_id { get; set; }
        public int? Settings_id { get; set; }

        // Navigation properties
        public PurchaseDetail? PurchaseDetail { get; set; }
        public Roles Roles { get; set; } = null!;
        public BillingAddress? BillingAddress { get; set; }
        public Settings? Settings { get; set; }
        public Cart? Cart { get; set; }

    }
}