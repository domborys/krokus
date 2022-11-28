using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace krokusapi.Migrations
{
    /// <inheritdoc />
    public partial class CreateObservationConfirmationTag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "Observation");

            migrationBuilder.DropColumn(
                name: "Place",
                table: "Observation");

            migrationBuilder.AddColumn<Polygon>(
                name: "Boundary",
                table: "Observation",
                type: "geography",
                nullable: true);

            migrationBuilder.AddColumn<Point>(
                name: "Location",
                table: "Observation",
                type: "geography",
                nullable: false);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Observation",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Observation",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Confirmation",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IsConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    DateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ObservationId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Confirmation", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Confirmation_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Confirmation_Observation_ObservationId",
                        column: x => x.ObservationId,
                        principalTable: "Observation",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tag",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tag", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ObservationTag",
                columns: table => new
                {
                    ObservationsId = table.Column<long>(type: "bigint", nullable: false),
                    TagsId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ObservationTag", x => new { x.ObservationsId, x.TagsId });
                    table.ForeignKey(
                        name: "FK_ObservationTag_Observation_ObservationsId",
                        column: x => x.ObservationsId,
                        principalTable: "Observation",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ObservationTag_Tag_TagsId",
                        column: x => x.TagsId,
                        principalTable: "Tag",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Observation_UserId",
                table: "Observation",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Confirmation_ObservationId",
                table: "Confirmation",
                column: "ObservationId");

            migrationBuilder.CreateIndex(
                name: "IX_Confirmation_UserId",
                table: "Confirmation",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ObservationTag_TagsId",
                table: "ObservationTag",
                column: "TagsId");

            migrationBuilder.AddForeignKey(
                name: "FK_Observation_AspNetUsers_UserId",
                table: "Observation",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Observation_AspNetUsers_UserId",
                table: "Observation");

            migrationBuilder.DropTable(
                name: "Confirmation");

            migrationBuilder.DropTable(
                name: "ObservationTag");

            migrationBuilder.DropTable(
                name: "Tag");

            migrationBuilder.DropIndex(
                name: "IX_Observation_UserId",
                table: "Observation");

            migrationBuilder.DropColumn(
                name: "Boundary",
                table: "Observation");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Observation");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Observation");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Observation");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Observation",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Place",
                table: "Observation",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
