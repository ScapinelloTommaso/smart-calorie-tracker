using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartCalorieTracker.Api.Data;
using System.Security.Claims;

namespace SmartCalorieTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        private Guid GetUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
                throw new UnauthorizedAccessException("Utente non valido");
            return userId;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var user = await _context.Users.FindAsync(GetUserId());
                if (user == null) return NotFound("Utente non trovato");

                return Ok(new
                {
                    username = user.Username,
                    dailyCalorieGoal = user.DailyCalorieGoal,
                    dailyProteinGoal = user.DailyProteinGoal,
                    dailyCarbsGoal = user.DailyCarbsGoal,
                    dailyFatsGoal = user.DailyFatsGoal
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            try
            {
                var user = await _context.Users.FindAsync(GetUserId());
                if (user == null) return NotFound("Utente non trovato");

                user.DailyCalorieGoal = dto.DailyCalorieGoal;
                user.DailyProteinGoal = dto.DailyProteinGoal;
                user.DailyCarbsGoal = dto.DailyCarbsGoal;
                user.DailyFatsGoal = dto.DailyFatsGoal;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Profilo aggiornato con successo" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }

    public class UpdateProfileDto
    {
        public int DailyCalorieGoal { get; set; }
        public int DailyProteinGoal { get; set; }
        public double DailyCarbsGoal { get; set; }
        public double DailyFatsGoal { get; set; }
    }
}
