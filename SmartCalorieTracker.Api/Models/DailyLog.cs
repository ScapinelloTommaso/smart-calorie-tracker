namespace SmartCalorieTracker.Api.Models;

public class DailyLog
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public int FoodDictionaryId { get; set; }
    public DateTime Date { get; set; }
    public double GramsConsumed { get; set; }
    public string MealType { get; set; } = "Spuntino";

    // Snapshot of user targets at time of entry
    public double TargetCalories { get; set; }
    public double TargetProteins { get; set; }
    public double TargetCarbs { get; set; }
    public double TargetFats { get; set; }

    public FoodDictionary FoodDictionary { get; set; } = null!;
}