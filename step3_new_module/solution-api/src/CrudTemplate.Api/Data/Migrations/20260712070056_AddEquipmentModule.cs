using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CrudTemplate.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEquipmentModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence<int>(
                name: "equipment_item_seq",
                startValue: 25L);

            migrationBuilder.CreateTable(
                name: "equipment_item",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    category_key = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    qty = table.Column<int>(type: "integer", nullable: false),
                    unit = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    spec1 = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    keeper = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    keeper_phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    location_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    status = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: false),
                    purchase_date = table.Column<DateOnly>(type: "date", nullable: true),
                    spec_note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    updated_at = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_equipment_item", x => x.id);
                    table.CheckConstraint("ck_equipment_item_category_key", "category_key IN ('ICT', 'POWER', 'STORAGE', 'OFFICE', 'PPE', 'SHELTER_SUPPLY', 'EMFOOD', 'MEDICAL', 'DECON', 'OTHER')");
                    table.CheckConstraint("ck_equipment_item_status", "status IN ('normal', 'maintenance', 'scrapped')");
                });

            migrationBuilder.CreateIndex(
                name: "ux_equipment_item_code",
                table: "equipment_item",
                column: "code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "equipment_item");

            migrationBuilder.DropSequence(
                name: "equipment_item_seq");
        }
    }
}
