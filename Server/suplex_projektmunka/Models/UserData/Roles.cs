using System.ComponentModel.DataAnnotations;

namespace suplex_projektmunka.Models.UserData
{
    public class Roles
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(255)]
        public string? Role { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime ModifiedAt { get; set; }
        public bool IsActive { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
