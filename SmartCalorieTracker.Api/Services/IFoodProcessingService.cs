using SmartCalorieTracker.Api.Models;

namespace SmartCalorieTracker.Api.Services;

public interface IFoodProcessingService
{
    Task<FoodDictionary> AnalyzeFoodAsync(string userInput);
}