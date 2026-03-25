namespace SmartCalorieTracker.Api.Models
{
    public class FoodDictionary
    {
        public int Id { get; set; }
        public string FoodName { get; set; } = string.Empty;
        public double CaloriesPer100g { get; set; }
        public double ProteinsPer100g { get; set; }
        public double CarbsPer100g { get; set; }
        public double FatsPer100g { get; set; }
    }
}