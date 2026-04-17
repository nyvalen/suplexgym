using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace suplex_projektmunka.Migrations
{
    /// <inheritdoc />
    public partial class AddStaffRoleAndSeededItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── Add staff role ───────────────────────────────────────────────
            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "CreatedAt", "IsActive", "ModifiedAt", "Role" },
                values: new object[]
                {
                    3,
                    new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                    true,
                    new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                    "staff"
                });

            // ── Add seasonal ticket type (type 4) ────────────────────────────
            // Types 1=daily, 2=monthly, 3=yearly already exist.
            // We add seasonal as type 4 (3 months).
            migrationBuilder.InsertData(
                table: "Types",
                columns: new[] { "Id", "Type" },
                values: new object[] { 4, "seasonal" });

            // ── Seed default items (daily, monthly, seasonal, annual) ─────────
            // Only insert if they do not already exist (guard: check count via raw SQL)
            migrationBuilder.Sql(@"
                INSERT INTO Items (Name, Description, ImagePath, Price, Type_id, ValidityDays, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Daily Pass', 'Full facility access for one day. No commitment required.', NULL, 2900, 1, 1, '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Items WHERE Type_id = 1 LIMIT 1);

                INSERT INTO Items (Name, Description, ImagePath, Price, Type_id, ValidityDays, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Monthly Pass', 'Unlimited access for 30 days. Includes all group classes.', NULL, 12900, 2, 30, '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Items WHERE Type_id = 2 LIMIT 1);

                INSERT INTO Items (Name, Description, ImagePath, Price, Type_id, ValidityDays, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Seasonal Pass', '90 days of unlimited access. Great value for committed trainers.', NULL, 32900, 4, 90, '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Items WHERE Type_id = 4 LIMIT 1);

                INSERT INTO Items (Name, Description, ImagePath, Price, Type_id, ValidityDays, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Annual Pass', 'Best value — full access for 365 days. Priority booking included.', NULL, 99900, 3, 365, '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Items WHERE Type_id = 3 LIMIT 1);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Items WHERE Name IN ('Daily Pass','Monthly Pass','Seasonal Pass','Annual Pass');
            ");

            migrationBuilder.DeleteData(table: "Types", keyColumn: "Id", keyValue: 4);
            migrationBuilder.DeleteData(table: "Roles", keyColumn: "Id", keyValue: 3);
        }
    }
}
