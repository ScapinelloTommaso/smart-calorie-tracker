using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SmartCalorieTracker.Api.Data;
using SmartCalorieTracker.Api.DTOs;
using SmartCalorieTracker.Api.Models;

namespace SmartCalorieTracker.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
        {
            throw new Exception("Nome utente già in uso.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            DailyCalorieGoal = (int)dto.DailyCalorieGoal,
            DailyProteinGoal = (int)dto.DailyProteinGoal,
            DailyCarbsGoal = dto.DailyCarbsGoal,
            DailyFatsGoal = dto.DailyFatsGoal
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = string.Empty,
            UserId = user.Id,
            Username = user.Username
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            throw new Exception("Credenziali non valide.");
        }

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

        return new AuthResponseDto
        {
            Token = tokenHandler.WriteToken(token),
            UserId = user.Id,
            Username = user.Username
        };
    }
}
