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
            // ── Add staff role (only if it doesn't exist) ──────────────────────
            migrationBuilder.Sql(@"
                INSERT INTO Roles (Id, Role, CreatedAt, ModifiedAt, IsActive)
                SELECT 3, 'staff', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Roles WHERE Id = 3 OR Role = 'staff' LIMIT 1);
            ");

            // ── Add seasonal ticket type (type 4) ────────────────────────────
            // Types 1=daily, 2=monthly, 3=yearly already exist.
            // We add seasonal as type 4 (3 months).
            migrationBuilder.Sql(@"
                INSERT INTO Types (Id, Type)
                SELECT 4, 'seasonal'
                WHERE NOT EXISTS (SELECT 1 FROM Types WHERE Id = 4 LIMIT 1);
            ");

            // ── Seed default items (daily, monthly, seasonal, annual) ─────────
            // Only insert if they do not already exist (guard: check count via raw SQL)
            migrationBuilder.Sql(@"
                INSERT INTO Items (Name, Description, ImagePath, Price, Type_id, ValidityDays, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Napijegy', 'Teljes hozzáférés egy napra. Nincs kötelezettség.', NULL, 2900, 1, 1, '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Items WHERE Type_id = 1 LIMIT 1);

                INSERT INTO Items (Name, Description, ImagePath, Price, Type_id, ValidityDays, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Havi bérlet', 'Korlátlan hozzáférés 30 napra. Részt vehetsz az összes csoportos edzésen.', NULL, 12900, 2, 30, '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Items WHERE Type_id = 2 LIMIT 1);

                INSERT INTO Items (Name, Description, ImagePath, Price, Type_id, ValidityDays, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Szezonális bérlet', '90 nap korlátlan hozzáférés. Kiváló választás elkötelezett edzeni vágyóknak.', NULL, 32900, 4, 90, '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Items WHERE Type_id = 4 LIMIT 1);

                INSERT INTO Items (Name, Description, ImagePath, Price, Type_id, ValidityDays, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Éves bérlet', 'Legjobb ár-érték arány – teljes hozzáférés 365 napra.', NULL, 99900, 3, 365, '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Items WHERE Type_id = 3 LIMIT 1);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Only delete the items we added
            migrationBuilder.Sql(@"
                DELETE FROM Items WHERE Name IN ('Daily Pass','Monthly Pass','Seasonal Pass','Annual Pass');
            ");

            // Note: Staff role and seasonal type are now part of the initial migration,
            // so we don't delete them here to maintain consistency
        }
    }
}
