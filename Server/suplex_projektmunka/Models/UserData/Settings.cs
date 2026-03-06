using System.ComponentModel.DataAnnotations;

namespace suplex_projektmunka.Models.UserData
{
    public class Settings
    {
        [Key]
        public int Id { get; set; }
        public bool DarkMode { get; set; }
        public bool Animation { get; set; }

        [MaxLength(255)]
        public string Language { get; set; } = "hu";

        public DateTime CreatedAt { get; set; }
        public DateTime ModifiedAt { get; set; }
        public bool IsActive { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
