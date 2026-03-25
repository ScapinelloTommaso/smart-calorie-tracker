using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartCalorieTracker.Api.Services;
using System.Security.Claims;

namespace SmartCalorieTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DiaryController : ControllerBase
{
    private readonly IDiaryService _diaryService;

    public DiaryController(IDiaryService diaryService)
    {
        _diaryService = diaryService;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    public class DiaryRequestDto
    {
        public required string Input { get; set; }
        public string MealType { get; set; } = "Spuntino";
        public DateTime? Date { get; set; }
    }

    [HttpPost("add")]
    public async Task<IActionResult> Add([FromBody] DiaryRequestDto request)
    {
        try
        {
            var result = await _diaryService.AddEntryAsync(GetUserId(), request.Input, request.MealType, request.Date);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] string? date)
    {
        try
        {
            var targetDate = string.IsNullOrEmpty(date) ? DateTime.UtcNow.Date : DateTime.Parse(date).Date;
            
            var totals = await _diaryService.GetTotalsByDateAsync(GetUserId(), targetDate);
            var logs = await _diaryService.GetLogsByDateAsync(GetUserId(), targetDate);

            return Ok(new
            {
                TotaleCalorieOggi = totals.Calories,
                TotaleProteineOggi = totals.Proteins,
                TotaleCarboidratiOggi = totals.Carbs,
                TotaleGrassiOggi = totals.Fats,
                TargetCalorie = totals.TargetCalories,
                TargetProteine = totals.TargetProteins,
                TargetCarboidrati = totals.TargetCarbs,
                TargetGrassi = totals.TargetFats,
                Logs = logs
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("month")]
    public async Task<IActionResult> GetMonthSummary([FromQuery] int year, [FromQuery] int month)
    {
        try
        {
            var result = await _diaryService.GetMonthSummaryAsync(GetUserId(), year, month);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _diaryService.DeleteEntryAsync(GetUserId(), id);
            return Ok(new { message = "Eliminato con successo" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] DiaryRequestDto request)
    {
        try
        {
            var result = await _diaryService.UpdateEntryAsync(GetUserId(), id, request.Input, request.MealType);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("suggest-meal")]
    public async Task<IActionResult> SuggestMeal()
    {
        try
        {
            var suggestion = await _diaryService.SuggestMealAsync(GetUserId());
            return Ok(new { suggestion });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("known-foods")]
    public async Task<IActionResult> GetKnownFoods()
    {
        try
        {
            var foods = await _diaryService.GetKnownFoodsAsync(GetUserId());
            return Ok(foods);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
    [HttpGet("known-foods-details")]
    public async Task<IActionResult> GetKnownFoodsDetails()
    {
        try
        {
            var foods = await _diaryService.GetKnownFoodsDetailsAsync(GetUserId());
            return Ok(foods);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
