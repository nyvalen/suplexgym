using MailKit.Net.Smtp;
using MimeKit;

namespace suplex_projektmunka.Services
{
    public interface IEmailService
    {
        Task SendConfirmationEmailAsync(string toEmail, string username);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendConfirmationEmailAsync(string toEmail, string username)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(
                    _config["Email:SenderName"] ?? "Suplex Gym",
                    _config["Email:SenderAddress"] ?? "noreply@suplexgym.hu"
                ));
                message.To.Add(new MailboxAddress(username, toEmail));
                message.Subject = "Welcome to Suplex Gym!";

                // FRONTEND: This email is sent automatically on registration
                // No frontend action needed — just display a "Check your email" message after register
                message.Body = new TextPart("html")
                {
                    Text = $@"
                        <h1>Welcome to Suplex Gym, {username}!</h1>
                        <p>Your account has been successfully created.</p>
                        <p>You can now log in and purchase your gym passes.</p>
                        <br/>
                        <p>See you at the gym!</p>
                        <p><strong>Suplex Gym Team</strong></p>"
                };

                using var client = new SmtpClient();
                await client.ConnectAsync(
                    _config["Email:SmtpHost"] ?? "smtp.gmail.com",
                    int.Parse(_config["Email:SmtpPort"] ?? "587"),
                    MailKit.Security.SecureSocketOptions.StartTls
                );
                await client.AuthenticateAsync(
                    _config["Email:Username"],
                    _config["Email:Password"]
                );
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                // Log but don't throw — registration should succeed even if email fails
                _logger.LogError(ex, "Failed to send confirmation email to {Email}", toEmail);
            }
        }
    }
}