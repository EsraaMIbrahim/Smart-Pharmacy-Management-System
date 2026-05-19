using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharmacyManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddIngredientAndCostPrice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CostPrice",
                table: "Medicines",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "IngredientId",
                table: "Medicines",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Ingredient",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ingredient", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_IngredientId",
                table: "Medicines",
                column: "IngredientId");

            migrationBuilder.AddForeignKey(
                name: "FK_Medicines_Ingredient_IngredientId",
                table: "Medicines",
                column: "IngredientId",
                principalTable: "Ingredient",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Medicines_Ingredient_IngredientId",
                table: "Medicines");

            migrationBuilder.DropTable(
                name: "Ingredient");

            migrationBuilder.DropIndex(
                name: "IX_Medicines_IngredientId",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "CostPrice",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "IngredientId",
                table: "Medicines");
        }
    }
}
