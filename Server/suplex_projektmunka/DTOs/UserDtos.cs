namespace suplex_projektmunka.DTOs
{
    // DTO for viewing user profile
    // FRONTEND: GET /api/user/profile - display user info on profile page
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
        public BillingAddressDto? BillingAddress { get; set; }
        public SettingsDto? Settings { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // DTO for updating profile
    // FRONTEND: PUT /api/user/profile - profile edit form fields
    public class UpdateProfileDto
    {
        public string? Name { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
    }

    // DTO for changing password
    // FRONTEND: PUT /api/user/change-password - password change form
    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    // DTO for billing address
    // FRONTEND: used in profile page billing section
    public class BillingAddressDto
    {
        public int? Id { get; set; }
        public int ZIP_code { get; set; }
        public string? Name { get; set; }
        public string? StreetAddress { get; set; }
        public int ApartmentNumber { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
    }

    // DTO for user settings
    // FRONTEND: used in settings page (dark mode toggle, language selector)
    public class SettingsDto
    {
        public int? Id { get; set; }
        public bool DarkMode { get; set; }
        public bool Animation { get; set; }
        public string Language { get; set; } = "hu";
    }
}




























