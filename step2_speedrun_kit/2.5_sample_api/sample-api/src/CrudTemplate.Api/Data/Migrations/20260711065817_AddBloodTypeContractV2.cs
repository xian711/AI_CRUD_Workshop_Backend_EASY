using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CrudTemplate.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBloodTypeContractV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "blood_type",
                table: "template_member",
                type: "text",
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_template_member_blood_type",
                table: "template_member",
                sql: "blood_type IN ('A', 'B', 'AB', 'O')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_template_member_blood_type",
                table: "template_member");

            migrationBuilder.DropColumn(
                name: "blood_type",
                table: "template_member");
        }
    }
}
