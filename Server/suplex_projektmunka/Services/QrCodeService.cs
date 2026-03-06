using QRCoder;
using System.Text.Json;

namespace suplex_projektmunka.Services
{
    public interface IQrCodeService
    {
        string GenerateTicketQrCode(int purchaseItemId, int userId, string itemName, DateTime? expiresAt);
    }

    public class QrCodeService : IQrCodeService
    {
        // Generates a Base64 PNG QR code encoding ticket information
        // FRONTEND (mobile): Decode Base64 and display as image
        //   Usage: <Image source={{ uri: `data:image/png;base64,${qrCodeBase64}` }} />
        //   The QR code contains a JSON payload which can be scanned at the gym entrance
        public string GenerateTicketQrCode(int purchaseItemId, int userId, string itemName, DateTime? expiresAt)
        {
            // Build a JSON payload that staff can scan to verify ticket validity
            var payload = new
            {
                ticketId = purchaseItemId,
                userId = userId,
                item = itemName,
                expiresAt = expiresAt?.ToString("o"),
                issuedBy = "SuplexGym",
                timestamp = DateTime.UtcNow.ToString("o")
            };

            var json = JsonSerializer.Serialize(payload);

            using var qrGenerator = new QRCodeGenerator();
            var qrData = qrGenerator.CreateQrCode(json, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(qrData);
            var pngBytes = qrCode.GetGraphic(10);

            return Convert.ToBase64String(pngBytes);
        }
    }
}