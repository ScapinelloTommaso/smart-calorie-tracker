using Microsoft.AspNetCore.Mvc;
using SmartCalorieTracker.Api.Services;

namespace SmartCalorieTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FoodController : ControllerBase
{
    private readonly IFoodProcessingService _foodService;

    public FoodController(IFoodProcessingService foodService)
    {
        _foodService = foodService;
    }

    [HttpPost("analyze")]
    public async Task<IActionResult> Analyze([FromBody] string input)
    {
        var result = await _foodService.AnalyzeFoodAsync(input);
        return Ok(result);
    }
}