using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartCalorieTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserMacros : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "DailyCarbsGoal",
                table: "Users",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "DailyFatsGoal",
                table: "Users",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DailyCarbsGoal",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DailyFatsGoal",
                table: "Users");
        }
    }
}
