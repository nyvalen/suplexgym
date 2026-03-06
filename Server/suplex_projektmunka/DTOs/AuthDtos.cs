namespace suplex_projektmunka.DTOs
{
    // DTO for registration request
    // FRONTEND: POST /api/auth/register
    public class RegisterDto
    {
        public string Name { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    // DTO for login request
    // FRONTEND: POST /api/auth/login
    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    // DTO returned after successful login/register
    // FRONTEND: Store AccessToken in memory, RefreshToken in secure storage
    public class AuthResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
    }

    // DTO for refreshing the access token
    // FRONTEND: POST /api/auth/refresh when receiving 401 Unauthorized
    public class RefreshTokenDto
    {
        public string RefreshToken { get; set; } = string.Empty;
    }
}