namespace SmartCalorieTracker.Api.DTOs;

public class DiaryResponseDto
{
    public string Messaggio { get; set; } = string.Empty;
    public string Pasto { get; set; } = string.Empty;
    public string Quantita { get; set; } = string.Empty;
    public string MealType { get; set; } = string.Empty;
    public double CalorieDelPasto { get; set; }
    public double ProteineDelPasto { get; set; }
    public double CarboidratiDelPasto { get; set; }
    public double GrassiDelPasto { get; set; }
    public double TotaleCalorieOggi { get; set; }
    public double TotaleProteineOggi { get; set; }
    public double TotaleCarboidratiOggi { get; set; }
    public double TotaleGrassiOggi { get; set; }
}
