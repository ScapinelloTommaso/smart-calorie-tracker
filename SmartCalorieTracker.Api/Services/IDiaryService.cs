using SmartCalorieTracker.Api.DTOs;

namespace SmartCalorieTracker.Api.Services;

public interface IDiaryService
{
    Task<DiaryResponseDto> AddEntryAsync(Guid userId, string userInput, string mealType, DateTime? date = null);
    Task<(double Calories, double Proteins, double Carbs, double Fats, double TargetCalories, double TargetProteins, double TargetCarbs, double TargetFats)> GetTotalsByDateAsync(Guid userId, DateTime date);
    Task<IEnumerable<object>> GetLogsByDateAsync(Guid userId, DateTime date);
    Task<IEnumerable<object>> GetMonthSummaryAsync(Guid userId, int year, int month);
    Task DeleteEntryAsync(Guid userId, int logId);
    Task<DiaryResponseDto> UpdateEntryAsync(Guid userId, int logId, string userInput, string mealType);
    Task<string> SuggestMealAsync(Guid userId);
    Task<IEnumerable<string>> GetKnownFoodsAsync(Guid userId);
    Task<IEnumerable<object>> GetKnownFoodsDetailsAsync(Guid userId);
}
