using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharmacyManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddConsultationAppointments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConsultationAppointments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientUserId = table.Column<int>(type: "int", nullable: false),
                    PharmacistUserId = table.Column<int>(type: "int", nullable: true),
                    ScheduledAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    ConsultationType = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    StaffNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConsultationAppointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConsultationAppointments_Users_ClientUserId",
                        column: x => x.ClientUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConsultationAppointments_Users_PharmacistUserId",
                        column: x => x.PharmacistUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ConsultationAppointments_ClientUserId",
                table: "ConsultationAppointments",
                column: "ClientUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsultationAppointments_PharmacistUserId_ScheduledAt",
                table: "ConsultationAppointments",
                columns: new[] { "PharmacistUserId", "ScheduledAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ConsultationAppointments_ScheduledAt",
                table: "ConsultationAppointments",
                column: "ScheduledAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConsultationAppointments");
        }
    }
}
