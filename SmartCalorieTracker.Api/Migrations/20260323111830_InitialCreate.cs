using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartCalorieTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DailyLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FoodDictionaryId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GramsConsumed = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FoodDictionaries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FoodName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CaloriesPer100g = table.Column<double>(type: "float", nullable: false),
                    ProteinsPer100g = table.Column<double>(type: "float", nullable: false),
                    CarbsPer100g = table.Column<double>(type: "float", nullable: false),
                    FatsPer100g = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoodDictionaries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DailyCalorieGoal = table.Column<int>(type: "int", nullable: false),
                    DailyProteinGoal = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DailyLogs");

            migrationBuilder.DropTable(
                name: "FoodDictionaries");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
