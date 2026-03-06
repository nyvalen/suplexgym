using System.ComponentModel.DataAnnotations;

namespace suplex_projektmunka.Models.FrontendExtraData
{
    public class News
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(50)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(255)]
        public string ImagePath { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime ModifiedAt { get; set; }
        public bool IsActive { get; set; }
    }
}
