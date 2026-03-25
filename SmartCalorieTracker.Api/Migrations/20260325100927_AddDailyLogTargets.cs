using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartCalorieTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDailyLogTargets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "TargetCalories",
                table: "DailyLogs",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "TargetCarbs",
                table: "DailyLogs",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "TargetFats",
                table: "DailyLogs",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "TargetProteins",
                table: "DailyLogs",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.CreateIndex(
                name: "IX_DailyLogs_FoodDictionaryId",
                table: "DailyLogs",
                column: "FoodDictionaryId");

            migrationBuilder.AddForeignKey(
                name: "FK_DailyLogs_FoodDictionaries_FoodDictionaryId",
                table: "DailyLogs",
                column: "FoodDictionaryId",
                principalTable: "FoodDictionaries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DailyLogs_FoodDictionaries_FoodDictionaryId",
                table: "DailyLogs");

            migrationBuilder.DropIndex(
                name: "IX_DailyLogs_FoodDictionaryId",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "TargetCalories",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "TargetCarbs",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "TargetFats",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "TargetProteins",
                table: "DailyLogs");
        }
    }
}
