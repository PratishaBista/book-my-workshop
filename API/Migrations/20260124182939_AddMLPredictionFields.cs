using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddMLPredictionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "AIConfidenceScore",
                table: "Workshops",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AIIsConfident",
                table: "Workshops",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AISuggestedCategory",
                table: "Workshops",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AIConfidenceScore",
                table: "Workshops");

            migrationBuilder.DropColumn(
                name: "AIIsConfident",
                table: "Workshops");

            migrationBuilder.DropColumn(
                name: "AISuggestedCategory",
                table: "Workshops");
        }
    }
}
