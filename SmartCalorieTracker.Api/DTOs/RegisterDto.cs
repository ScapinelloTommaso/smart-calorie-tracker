namespace SmartCalorieTracker.Api.DTOs;

public class RegisterDto
{
    public required string Username { get; set; }
    public required string Password { get; set; }
    public double DailyCalorieGoal { get; set; }
    public double DailyProteinGoal { get; set; }
    public double DailyCarbsGoal { get; set; }
    public double DailyFatsGoal { get; set; }
}
