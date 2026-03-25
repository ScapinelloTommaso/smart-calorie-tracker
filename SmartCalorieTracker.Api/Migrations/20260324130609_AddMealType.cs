using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartCalorieTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMealType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MealType",
                table: "DailyLogs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MealType",
                table: "DailyLogs");
        }
    }
}
