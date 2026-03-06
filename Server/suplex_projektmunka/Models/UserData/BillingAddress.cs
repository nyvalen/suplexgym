using System.ComponentModel.DataAnnotations;

namespace suplex_projektmunka.Models.UserData
{
    public class BillingAddress
    {
        [Key]
        public int Id { get; set; }
        public int ZIP_code { get; set; }

        [MaxLength(50)]
        public string? Name { get; set; }

        [MaxLength(100)]
        public string? StreetAddress { get; set; }
        public int ApartmentNumber { get; set; }

        [MaxLength(30)]
        public string? City { get; set; }

        [MaxLength(30)]
        public string? State { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime ModifiedAt { get; set; }
        public bool IsActive { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
