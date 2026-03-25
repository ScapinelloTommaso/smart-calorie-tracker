using Microsoft.EntityFrameworkCore;
using SmartCalorieTracker.Api.Models;

namespace SmartCalorieTracker.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<FoodDictionary> FoodDictionaries { get; set; }
    public DbSet<DailyLog> DailyLogs { get; set; }
}