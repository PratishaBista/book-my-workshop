using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class RedesignWorkshopDataModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Workshops_WorkshopCategories_CategoryId",
                table: "Workshops");

            migrationBuilder.DropIndex(
                name: "IX_Workshops_CategoryId",
                table: "Workshops");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "Workshops",
                newName: "WorkshopType");

            migrationBuilder.AddColumn<int>(
                name: "BookingCutoffHours",
                table: "Workshops",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CancellationPolicy",
                table: "Workshops",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SkillLevel",
                table: "Workshops",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Subtitle",
                table: "Workshops",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Suitability",
                table: "Workshops",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VenueDescription",
                table: "Workshops",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatToBring",
                table: "Workshops",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PricingType",
                table: "WorkshopPricings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "AspectRatio",
                table: "WorkshopMedia",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StoryPodId",
                table: "WorkshopMedia",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "WorkshopWorkshopCategory",
                columns: table => new
                {
                    CategoriesId = table.Column<int>(type: "int", nullable: false),
                    WorkshopsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkshopWorkshopCategory", x => new { x.CategoriesId, x.WorkshopsId });
                    table.ForeignKey(
                        name: "FK_WorkshopWorkshopCategory_WorkshopCategories_CategoriesId",
                        column: x => x.CategoriesId,
                        principalTable: "WorkshopCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkshopWorkshopCategory_Workshops_WorkshopsId",
                        column: x => x.WorkshopsId,
                        principalTable: "Workshops",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkshopWorkshopCategory_WorkshopsId",
                table: "WorkshopWorkshopCategory",
                column: "WorkshopsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WorkshopWorkshopCategory");

            migrationBuilder.DropColumn(
                name: "BookingCutoffHours",
                table: "Workshops");

            migrationBuilder.DropColumn(
                name: "CancellationPolicy",
                table: "Workshops");

            migrationBuilder.DropColumn(
                name: "SkillLevel",
                table: "Workshops");

            migrationBuilder.DropColumn(
                name: "Subtitle",
                table: "Workshops");

            migrationBuilder.DropColumn(
                name: "Suitability",
                table: "Workshops");

            migrationBuilder.DropColumn(
                name: "VenueDescription",
                table: "Workshops");

            migrationBuilder.DropColumn(
                name: "WhatToBring",
                table: "Workshops");

            migrationBuilder.DropColumn(
                name: "PricingType",
                table: "WorkshopPricings");

            migrationBuilder.DropColumn(
                name: "AspectRatio",
                table: "WorkshopMedia");

            migrationBuilder.DropColumn(
                name: "StoryPodId",
                table: "WorkshopMedia");

            migrationBuilder.RenameColumn(
                name: "WorkshopType",
                table: "Workshops",
                newName: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Workshops_CategoryId",
                table: "Workshops",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Workshops_WorkshopCategories_CategoryId",
                table: "Workshops",
                column: "CategoryId",
                principalTable: "WorkshopCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
