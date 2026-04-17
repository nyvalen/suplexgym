using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using suplex_projektmunka.DTOs;
using suplex_projektmunka.Models.Context;
using suplex_projektmunka.Models.FrontendExtraData;

namespace suplex_projektmunka.Controllers
{
    [ApiController]
    [Route("api/news")]
    public class NewsController : ControllerBase
    {
        private readonly GymContext _context;

        public NewsController(GymContext context)
        {
            _context = context;
        }

        /// <summary>Get all active news articles. Public.</summary>
        [HttpGet]
        public async Task<IActionResult> GetNews()
        {
            var news = await _context.News
                .Where(n => n.IsActive)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NewsDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    ImagePath = n.ImagePath,
                    Content = n.Content,
                    CreatedAt = n.CreatedAt,
                    IsActive = n.IsActive
                })
                .ToListAsync();

            return Ok(news);
        }

        /// <summary>Get a single news article. Public.</summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetNewsById(int id)
        {
            var news = await _context.News.FindAsync(id);
            if (news == null || !news.IsActive) return NotFound();

            return Ok(new NewsDto
            {
                Id = news.Id,
                Title = news.Title,
                ImagePath = news.ImagePath,
                Content = news.Content,
                CreatedAt = news.CreatedAt,
                IsActive = news.IsActive
            });
        }

        /// <summary>Create a news article. Admin or staff.</summary>
        [HttpPost]
        [Authorize(Roles = "admin,staff")]
        public async Task<IActionResult> CreateNews([FromBody] CreateNewsDto dto)
        {
            var news = new News
            {
                Title = dto.Title,
                ImagePath = dto.ImagePath,
                Content = dto.Content,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                ModifiedAt = DateTime.UtcNow
            };

            _context.News.Add(news);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNewsById), new { id = news.Id },
                new { message = "News created.", id = news.Id });
        }

        /// <summary>Update a news article. Admin or staff.</summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,staff")]
        public async Task<IActionResult> UpdateNews(int id, [FromBody] CreateNewsDto dto)
        {
            var news = await _context.News.FindAsync(id);
            if (news == null) return NotFound();

            news.Title = dto.Title;
            news.ImagePath = dto.ImagePath;
            news.Content = dto.Content;
            news.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "News updated." });
        }

        /// <summary>Soft-delete a news article. Admin or staff.</summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,staff")]
        public async Task<IActionResult> DeleteNews(int id)
        {
            var news = await _context.News.FindAsync(id);
            if (news == null) return NotFound();

            news.IsActive = false;
            news.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "News deleted." });
        }
    }
}
