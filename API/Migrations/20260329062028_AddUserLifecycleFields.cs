using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddUserLifecycleFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletionScheduledAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "DeletionWarningSent",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeactivated",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CancelledBy",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RefundAmount",
                table: "Bookings",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RefundPercentage",
                table: "Bookings",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletionScheduledAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DeletionWarningSent",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsDeactivated",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CancelledBy",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "RefundAmount",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "RefundPercentage",
                table: "Bookings");
        }
    }
}
