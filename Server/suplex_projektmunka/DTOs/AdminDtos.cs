namespace suplex_projektmunka.DTOs
{
    // DTO for admin user list
    // FRONTEND: GET /api/admin/users - admin user management table
    public class AdminUserDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // DTO for admin to update user role or active status
    // FRONTEND: PUT /api/admin/users/{id} - role dropdown + ban toggle in admin panel
    public class AdminUpdateUserDto
    {
        public int? RoleId { get; set; }
        public bool? IsActive { get; set; }
    }

    // DTO for admin to manually add a ticket to a user
    // FRONTEND: POST /api/admin/users/{userId}/tickets - "Add ticket" form in admin panel
    public class AdminAddTicketDto
    {
        public int UserId { get; set; }
        public int ItemId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    // DTO for news management
    // FRONTEND: POST/PUT /api/admin/news - news create/edit form
    public class NewsDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ImagePath { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateNewsDto
    {
        public string Title { get; set; } = string.Empty;
        public string ImagePath { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }

    // DTO for equipment management
    // FRONTEND: GET/POST/PUT /api/admin/equipment - equipment status panel (admin only)
    public class EquipmentDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int SerialNumber { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime ModifiedAt { get; set; }
    }

    public class CreateEquipmentDto
    {
        public string Name { get; set; } = string.Empty;
        public int SerialNumber { get; set; }
        public string Status { get; set; } = "operational";
    }

    public class UpdateEquipmentStatusDto
    {
        // Allowed values: "operational", "maintenance", "out_of_order"
        // FRONTEND: Status dropdown with these 3 options in equipment panel
        public string Status { get; set; } = string.Empty;
    }

    // DTO for admin viewing a user's ticket details
    // FRONTEND: GET /api/admin/users/{userId}/tickets - ticket detail view with expiry countdown
    public class AdminTicketDto
    {
        public int Id { get; set; }
        public string? ItemName { get; set; }
        public int ValidityDays { get; set; }
        public DateTime? ActivatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsExpired => ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;

        // Remaining days until expiry (negative means already expired)
        // FRONTEND: show as progress bar or countdown badge
        public int? DaysRemaining => ExpiresAt.HasValue
            ? (int)(ExpiresAt.Value - DateTime.UtcNow).TotalDays
            : null;
    }
}