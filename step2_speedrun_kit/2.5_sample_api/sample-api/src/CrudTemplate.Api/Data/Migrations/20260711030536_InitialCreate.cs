using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CrudTemplate.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence<int>(
                name: "template_member_seq",
                startValue: 25L);

            migrationBuilder.CreateTable(
                name: "template_member",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    gender = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false),
                    birth_date = table.Column<DateOnly>(type: "date", nullable: false),
                    id_type = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    national_id = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    phone = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    residence_county = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    residence_township = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    residence_address = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    group_name = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    position_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    qualifications = table.Column<List<string>>(type: "text[]", nullable: false, defaultValueSql: "'{}'"),
                    status = table.Column<string>(type: "character varying(4)", maxLength: 4, nullable: false),
                    note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    updated_at = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_template_member", x => x.id);
                    table.CheckConstraint("ck_template_member_gender", "gender IN ('男', '女')");
                    table.CheckConstraint("ck_template_member_id_type", "id_type IN ('身分證', '居留證', '護照')");
                    table.CheckConstraint("ck_template_member_position_code", "position_code IN ('director', 'deputy', 'leader', 'member')");
                    table.CheckConstraint("ck_template_member_status", "status IN ('在職', '停用')");
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "template_member");

            migrationBuilder.DropSequence(
                name: "template_member_seq");
        }
    }
}
