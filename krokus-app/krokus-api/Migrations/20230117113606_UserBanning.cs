using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace krokusapi.Migrations
{
    /// <inheritdoc />
    public partial class UserBanning : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "BannedUntil",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PermanentlyBanned",
                table: "AspNetUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BannedUntil",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "PermanentlyBanned",
                table: "AspNetUsers");
        }
    }
}
