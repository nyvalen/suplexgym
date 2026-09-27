using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace suplex_projektmunka.Controllers
{
    [ApiController]
    [Route("api/upload")]
    [Authorize(Roles = "admin")]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _configuration;

        public UploadController(IWebHostEnvironment env, IConfiguration configuration)
        {
            _env = env;
            _configuration = configuration;
        }

        /// <summary>
        /// Upload an image (news or item cover). Returns the public URL path.
        /// FRONTEND: POST multipart/form-data with field "file".
        /// Use the returned `url` as imagePath when creating/updating news or items.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file provided." });

            // Validate image type
            var allowed = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
            if (!allowed.Contains(file.ContentType.ToLower()))
                return BadRequest(new { message = "Only JPEG, PNG, WebP and GIF images are allowed." });

            // Max 10 MB
            if (file.Length > 10 * 1024 * 1024)
                return BadRequest(new { message = "File size must not exceed 10 MB." });

            // Save to the configured persistent storage directory.
            var uploadsPath = GetUploadsPath();
            Directory.CreateDirectory(uploadsPath);

            var ext = Path.GetExtension(file.FileName).ToLower();
            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = System.IO.File.Create(filePath))
            {
                await file.CopyToAsync(stream);
            }

            var url = $"/uploads/{fileName}";
            return Ok(new { url, message = "File uploaded successfully." });
        }

        /// <summary>
        /// Delete an uploaded image by filename.
        /// FRONTEND: DELETE /api/upload?fileName=uuid.jpg
        /// </summary>
        [HttpDelete]
        public IActionResult Delete([FromQuery] string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName) || fileName.Contains(".."))
                return BadRequest(new { message = "Invalid file name." });

            var uploadsPath = GetUploadsPath();
            if (!string.Equals(fileName, Path.GetFileName(fileName), StringComparison.Ordinal))
                return BadRequest(new { message = "Invalid file name." });
            var filePath = Path.Combine(uploadsPath, fileName);

            if (!System.IO.File.Exists(filePath))
                return NotFound(new { message = "File not found." });

            System.IO.File.Delete(filePath);
            return Ok(new { message = "File deleted." });
        }

        private string GetUploadsPath()
        {
            var dataDirectory = _configuration["Storage:DataDirectory"];
            var root = string.IsNullOrWhiteSpace(dataDirectory)
                ? Path.Combine(_env.ContentRootPath, "App_Data")
                : dataDirectory;
            return Path.Combine(root, "uploads");
        }
    }
}
