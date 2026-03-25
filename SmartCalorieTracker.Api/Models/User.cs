namespace SmartCalorieTracker.Api.Models;

public class User
{
    public Guid Id { get; set; }
    public required string Username { get; set; }
    public int DailyCalorieGoal { get; set; }
    public int DailyProteinGoal { get; set; }
    public double DailyCarbsGoal { get; set; }
    public double DailyFatsGoal { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
}