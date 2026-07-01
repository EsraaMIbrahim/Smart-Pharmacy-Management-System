using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharmacyManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class Phase4Changes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DrugInteractions_Ingredient1Id",
                table: "DrugInteractions");

            migrationBuilder.DropIndex(
                name: "IX_DrugInteractions_Ingredient2Id",
                table: "DrugInteractions");

            migrationBuilder.AddColumn<string>(
                name: "TherapeuticClass",
                table: "Ingredients",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Ingredients_TherapeuticClass",
                table: "Ingredients",
                column: "TherapeuticClass");

            migrationBuilder.CreateIndex(
                name: "IX_DrugInteractions_Ingredient1Id_Ingredient2Id",
                table: "DrugInteractions",
                columns: new[] { "Ingredient1Id", "Ingredient2Id" });

            migrationBuilder.CreateIndex(
                name: "IX_DrugInteractions_Ingredient2Id_Ingredient1Id",
                table: "DrugInteractions",
                columns: new[] { "Ingredient2Id", "Ingredient1Id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Ingredients_TherapeuticClass",
                table: "Ingredients");

            migrationBuilder.DropIndex(
                name: "IX_DrugInteractions_Ingredient1Id_Ingredient2Id",
                table: "DrugInteractions");

            migrationBuilder.DropIndex(
                name: "IX_DrugInteractions_Ingredient2Id_Ingredient1Id",
                table: "DrugInteractions");

            migrationBuilder.DropColumn(
                name: "TherapeuticClass",
                table: "Ingredients");

            migrationBuilder.CreateIndex(
                name: "IX_DrugInteractions_Ingredient1Id",
                table: "DrugInteractions",
                column: "Ingredient1Id");

            migrationBuilder.CreateIndex(
                name: "IX_DrugInteractions_Ingredient2Id",
                table: "DrugInteractions",
                column: "Ingredient2Id");
        }
    }
}
