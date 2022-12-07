using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace krokusapi.Migrations
{
    /// <inheritdoc />
    public partial class AddPictureDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Confirmation_Observation_ObservationId",
                table: "Confirmation");

            migrationBuilder.AlterColumn<long>(
                name: "ObservationId",
                table: "Confirmation",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.CreateTable(
                name: "Picture",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Filename = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConfirmationId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Picture", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Picture_Confirmation_ConfirmationId",
                        column: x => x.ConfirmationId,
                        principalTable: "Confirmation",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Picture_ConfirmationId",
                table: "Picture",
                column: "ConfirmationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Confirmation_Observation_ObservationId",
                table: "Confirmation",
                column: "ObservationId",
                principalTable: "Observation",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Confirmation_Observation_ObservationId",
                table: "Confirmation");

            migrationBuilder.DropTable(
                name: "Picture");

            migrationBuilder.AlterColumn<long>(
                name: "ObservationId",
                table: "Confirmation",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Confirmation_Observation_ObservationId",
                table: "Confirmation",
                column: "ObservationId",
                principalTable: "Observation",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
