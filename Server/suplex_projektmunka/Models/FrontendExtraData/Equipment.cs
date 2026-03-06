using System.ComponentModel.DataAnnotations;

namespace suplex_projektmunka.Models.FrontendExtraData
{
    public class Equipment
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        public int SerialNumber { get; set; }

        [MaxLength(30)]
        public string Status { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime ModifiedAt { get; set; }
        public bool IsActive { get; set; }
    }
}

