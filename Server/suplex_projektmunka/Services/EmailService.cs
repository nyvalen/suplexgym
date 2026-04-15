using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace suplex_projektmunka.Services
{
    public interface IEmailService
    {
        Task SendConfirmationEmailAsync(string toEmail, string username);
        Task SendGenericEmailAsync(string toEmail, string subject, string htmlBody);
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
            var subject = "Welcome to Suplex Gym — Registration Confirmed";
            var htmlBody = $"""
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#09090b;color:#fafafa;border-radius:16px;">
                  <div style="margin-bottom:24px;">
                    <span style="font-size:11px;letter-spacing:3px;color:#7c3aed;text-transform:uppercase;font-weight:700;">SUPLEX GYM</span>
                  </div>
                  <h1 style="font-size:24px;font-weight:800;margin:0 0 8px;">Welcome, {username}!</h1>
                  <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 24px;">
                    Your registration is confirmed. You can now sign in and start purchasing tickets.
                  </p>
                  <p style="color:#71717a;font-size:12px;margin-top:32px;border-top:1px solid #27272a;padding-top:16px;">
                    If you didn't create this account, please ignore this email.
                  </p>
                </div>
            """;

            await SendGenericEmailAsync(toEmail, subject, htmlBody);
        }

        public async Task SendGenericEmailAsync(string toEmail, string subject, string htmlBody)
        {
            var smtpHost = _config["Email:SmtpHost"];
            var smtpPortStr = _config["Email:SmtpPort"];
            var senderName = _config["Email:SenderName"] ?? "Suplex Gym";
            var senderAddress = _config["Email:SenderAddress"];
            var username = _config["Email:Username"];
            var password = _config["Email:Password"];

            // If email is not configured, log a warning and return gracefully
            if (string.IsNullOrWhiteSpace(smtpHost) ||
                string.IsNullOrWhiteSpace(senderAddress) ||
                string.IsNullOrWhiteSpace(username) ||
                string.IsNullOrWhiteSpace(password) ||
                username == "your_email@gmail.com")
            {
                _logger.LogWarning(
                    "Email not configured. Skipping email to {Email}. " +
                    "Set Email:SmtpHost, Email:SenderAddress, Email:Username, Email:Password in appsettings.",
                    toEmail);
                return;
            }

            if (!int.TryParse(smtpPortStr, out var smtpPort))
                smtpPort = 587;

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(senderName, senderAddress));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
            message.Body = bodyBuilder.ToMessageBody();

            try
            {
                using var client = new SmtpClient();

                // Use STARTTLS on port 587, or SSL on 465
                var secureOption = smtpPort == 465
                    ? SecureSocketOptions.SslOnConnect
                    : SecureSocketOptions.StartTls;

                await client.ConnectAsync(smtpHost, smtpPort, secureOption);
                await client.AuthenticateAsync(username, password);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email sent to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                // Don't rethrow — email failure should not break registration
            }
        }
    }
}
