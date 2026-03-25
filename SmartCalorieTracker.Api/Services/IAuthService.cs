using SmartCalorieTracker.Api.DTOs;

namespace SmartCalorieTracker.Api.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
}
