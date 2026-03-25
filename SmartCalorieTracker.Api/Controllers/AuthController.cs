using Microsoft.AspNetCore.Mvc;
using SmartCalorieTracker.Api.DTOs;
using SmartCalorieTracker.Api.Services;
using SmartCalorieTracker.Api.Data;
using SmartCalorieTracker.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SmartCalorieTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(IAuthService authService, AppDbContext context, IConfiguration config)
    {
        _authService = authService;
        _context = context;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            var result = await _authService.RegisterAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var result = await _authService.LoginAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Step 1 of Google Login. If user exists → 200 + JWT.
    /// If user is NEW → 202 Accepted + tempToken (the Google email) so the frontend
    /// can redirect to onboarding to collect macro goals before creating the account.
    /// </summary>
    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto dto)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(dto.Credential) as JwtSecurityToken;

            if (jsonToken == null)
                return BadRequest(new { message = "Token Google non valido." });

            var email = jsonToken.Claims.FirstOrDefault(c => c.Type == "email")?.Value;
            var name = jsonToken.Claims.FirstOrDefault(c => c.Type == "name")?.Value ?? email;

            if (string.IsNullOrEmpty(email))
                return BadRequest(new { message = "Impossibile estrarre l'email dal token Google." });

            // Check if user already exists
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == email);

            if (user != null)
            {
                // EXISTING user → return JWT directly (200)
                var token = GenerateJwt(user);
                return Ok(new AuthResponseDto
                {
                    Token = token,
                    UserId = user.Id,
                    Username = user.Username
                });
            }

            // NEW user → 202 Accepted, requires onboarding
            return StatusCode(202, new
            {
                requiresOnboarding = true,
                tempToken = dto.Credential,
                email = email,
                name = name
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Step 2 of Google Login. Called after onboarding quiz with macro goals.
    /// Creates the user and returns a native JWT.
    /// </summary>
    [HttpPost("google-register")]
    public async Task<IActionResult> GoogleRegister([FromBody] GoogleRegisterDto dto)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(dto.Credential) as JwtSecurityToken;

            if (jsonToken == null)
                return BadRequest(new { message = "Token Google non valido." });

            var email = jsonToken.Claims.FirstOrDefault(c => c.Type == "email")?.Value;

            if (string.IsNullOrEmpty(email))
                return BadRequest(new { message = "Impossibile estrarre l'email dal token Google." });

            // Check if already registered (race condition guard)
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == email);
            if (existingUser != null)
            {
                var existingToken = GenerateJwt(existingUser);
                return Ok(new AuthResponseDto
                {
                    Token = existingToken,
                    UserId = existingUser.Id,
                    Username = existingUser.Username
                });
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                DailyCalorieGoal = dto.DailyCalorieGoal,
                DailyProteinGoal = dto.DailyProteinGoal,
                DailyCarbsGoal = dto.DailyCarbsGoal,
                DailyFatsGoal = dto.DailyFatsGoal
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = GenerateJwt(user);
            return Ok(new AuthResponseDto
            {
                Token = token,
                UserId = user.Id,
                Username = user.Username
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private string GenerateJwt(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _config["Jwt:Issuer"],
            Audience = _config["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

public class GoogleLoginDto
{
    public string Credential { get; set; } = string.Empty;
}

public class GoogleRegisterDto
{
    public string Credential { get; set; } = string.Empty;
    public int DailyCalorieGoal { get; set; } = 2000;
    public int DailyProteinGoal { get; set; } = 150;
    public double DailyCarbsGoal { get; set; } = 200;
    public double DailyFatsGoal { get; set; } = 60;
}
