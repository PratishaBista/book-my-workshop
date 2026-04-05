using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddProviderVerificationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DocumentsReviewedAt",
                table: "Providers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExtractedIdName",
                table: "Providers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExtractedPanNumber",
                table: "Providers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdCardUrl",
                table: "Providers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdFileName",
                table: "Providers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsIdVerified",
                table: "Providers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsManuallyVerified",
                table: "Providers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPanVerified",
                table: "Providers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PanCardUrl",
                table: "Providers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PanFileName",
                table: "Providers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReviewNotes",
                table: "Providers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrustAnalysisJson",
                table: "Providers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<float>(
                name: "TrustScore",
                table: "Providers",
                type: "real",
                nullable: false,
                defaultValue: 0f);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocumentsReviewedAt",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "ExtractedIdName",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "ExtractedPanNumber",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "IdCardUrl",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "IdFileName",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "IsIdVerified",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "IsManuallyVerified",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "IsPanVerified",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "PanCardUrl",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "PanFileName",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "ReviewNotes",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "TrustAnalysisJson",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "TrustScore",
                table: "Providers");
        }
    }
}
