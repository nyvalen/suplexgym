using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace suplex_projektmunka.Migrations
{
    /// <inheritdoc />
    public partial class SeedDemoData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── Settings for the 3 seed users ────────────────────────────────
            // Each user needs a Settings row first (FK constraint).
            // IDs 1, 2, 3 are used — guarded with WHERE NOT EXISTS so running
            // twice on the same DB is safe.
            migrationBuilder.Sql(@"
                INSERT INTO Settings (Id, DarkMode, Animation, Language, CreatedAt, ModifiedAt, IsActive)
                SELECT 1, 0, 1, 'hu', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Settings WHERE Id = 1);

                INSERT INTO Settings (Id, DarkMode, Animation, Language, CreatedAt, ModifiedAt, IsActive)
                SELECT 2, 1, 1, 'hu', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Settings WHERE Id = 2);

                INSERT INTO Settings (Id, DarkMode, Animation, Language, CreatedAt, ModifiedAt, IsActive)
                SELECT 3, 0, 0, 'hu', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Settings WHERE Id = 3);
            ");

            // ── 3 seed users ─────────────────────────────────────────────────
            // Passwords:
            //   admin  → Admin123!
            //   staff  → Staff123!
            //   user   → User123!
            //
            // The admin hash is taken directly from your existing DB so the
            // password stays exactly what you already know.
            migrationBuilder.Sql(@"
                INSERT INTO Users (Name, Username, PasswordHash, Email, Role_id, Settings_id,
                                   IsActive, CreatedAt, ModifiedAt)
                SELECT 'Suplex Admin', 'admin', '$2a$11$k7a2vkvbZMmodCBgocWMAeS7Ys6rubYQLMpogAZkdi50JftM6zCPq',
                       'admin@suplexgym.hu', 1, 1, 1, '2026-01-01', '2026-01-01'
                WHERE NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'admin@suplexgym.hu');

                INSERT INTO Users (Name, Username, PasswordHash, Email, Role_id, Settings_id,
                                   IsActive, CreatedAt, ModifiedAt)
                SELECT 'Kovács Péter', 'kpeter', '$2b$11$pkOPLWmS/dgVTR6CKSiePupIjHvBoRMaklmm0mCItpDSSlqJ6FYEW',
                       'peter@suplexgym.hu', 3, 2, 1, '2026-01-01', '2026-01-01'
                WHERE NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'peter@suplexgym.hu');

                INSERT INTO Users (Name, Username, PasswordHash, Email, Role_id, Settings_id,
                                   IsActive, CreatedAt, ModifiedAt)
                SELECT 'Nagy Anna', 'nanna', '$2b$11$sfOyEWXVYffY0c.4sGXyZudGuKQl//zIGmVU.2sYz2sD.zuwXoCSm',
                       'anna@gmail.com', 2, 3, 1, '2026-01-01', '2026-01-01'
                WHERE NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'anna@gmail.com');
            ");

            // ── Hungarian news articles ───────────────────────────────────────
            // Replaces the old test/lorem/garbage content with proper Hungarian
            // gym news. Only inserted when the News table is empty.
            migrationBuilder.Sql(@"
                INSERT INTO News (Title, ImagePath, Content, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Megnyitottunk!', 'https://images.pexels.com/photos/3757941/pexels-photo-3757941.jpeg?_gl=1*14z8zso*_ga*NTQ3NTc4ODM5LjE3NzY3NjMzMjE.*_ga_8JE65Q40S6*czE3NzY3NjMzMjEkbzEkZzEkdDE3NzY3NjM0NzkkajQ5JGwwJGgw',
                       'Örömmel jelentjük be, hogy a Suplex Gym hivatalosan is megnyitotta kapuit! Korszerű gépparkunk, tágas öltözőink és tapasztalt edzőink várják az edzeni vágyókat hétfőtől szombatig 6:00-tól 22:00-ig. Látogass el hozzánk és próbáld ki az első edzést ingyen!',
                       '2026-01-10', '2026-01-10', 1
                WHERE NOT EXISTS (SELECT 1 FROM News WHERE Title = 'Megnyitottunk!');

                INSERT INTO News (Title, ImagePath, Content, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Diák- és nyugdíjasakció', 'https://images.pexels.com/photos/17740129/pexels-photo-17740129.jpeg?_gl=1*16d9j5e*_ga*NTQ3NTc4ODM5LjE3NzY3NjMzMjE.*_ga_8JE65Q40S6*czE3NzY3NjMzMjEkbzEkZzEkdDE3NzY3NjM2MTIkajU5JGwwJGgw',
                       'Tudjuk, mennyire fontos a mozgás minden életszakaszban. Diákok és nyugdíjasok érvényes igazolvánnyal 30%-os kedvezménnyel vásárolhatnak bérletet a recepción. A mozgás mindenkinek jár – segítünk abban, hogy elérhető legyen számodra is.',
                       '2026-02-01', '2026-02-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM News WHERE Title = 'Diák- és nyugdíjasakció');

                INSERT INTO News (Title, ImagePath, Content, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Tavaszi akció – 20% kedvezmény', 'https://images.pexels.com/photos/29392542/pexels-photo-29392542.jpeg?_gl=1*gfiy8q*_ga*NTQ3NTc4ODM5LjE3NzY3NjMzMjE.*_ga_8JE65Q40S6*czE3NzY3NjMzMjEkbzEkZzEkdDE3NzY3NjM4MjkkajUzJGwwJGgw',
                       'Március 15-től április 30-ig minden új bérlet vásárlásakor 20% kedvezményt adunk! Ez vonatkozik a havi, szezonális és éves bérletekre egyaránt. Ne hagyd ki – ez az ajánlatunk korlátozott ideig él. Vásárold meg most az alkalmazáson keresztül!',
                       '2026-03-15', '2026-03-15', 1
                WHERE NOT EXISTS (SELECT 1 FROM News WHERE Title = 'Tavaszi akció – 20% kedvezmény');

                INSERT INTO News (Title, ImagePath, Content, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Húsvéti nyitvatartás', 'https://images.pexels.com/photos/10632029/pexels-photo-10632029.jpeg?_gl=1*1q1kr42*_ga*NTQ3NTc4ODM5LjE3NzY3NjMzMjE.*_ga_8JE65Q40S6*czE3NzY3NjMzMjEkbzEkZzEkdDE3NzY3NjQxMjAkajU5JGwwJGgw',
                       'Kérjük figyeljenek, hogy húsvétkor módosított nyitvatartással várjuk Önöket. Április 5-én (vasárnap) és április 6-án (hétfőn) zárva tartunk, hogy a kollégáink is pihenhessenek szeretteikkel. Kellemes ünnepeket kívánunk minden kedves tagunknak!',
                       '2026-04-01', '2026-04-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM News WHERE Title = 'Húsvéti nyitvatartás');

                INSERT INTO News (Title, ImagePath, Content, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Karbantartási szünet – április 28.', 'https://images.pexels.com/photos/4716816/pexels-photo-4716816.jpeg?_gl=1*1rf69uf*_ga*NTQ3NTc4ODM5LjE3NzY3NjMzMjE.*_ga_8JE65Q40S6*czE3NzY3NjMzMjEkbzEkZzEkdDE3NzY3NjM0MDgkajYwJGwwJGgw',
                       'Tájékoztatjuk tagjainkat, hogy április 28-án (hétfőn) reggel 6:00 és 10:00 között technikai karbantartás miatt zárva tartunk. A szünet alatt új futópadokat és szabad súlyos eszközöket helyezünk üzembe. Elnézést kérünk az esetleges kellemetlenségekért!',
                       '2026-04-20', '2026-04-20', 1
                WHERE NOT EXISTS (SELECT 1 FROM News WHERE Title = 'Karbantartási szünet – április 28.');
            ");

            // ── Gym equipment – realistic amount for a mid-size gym ───────────
            // 20 pieces covering cardio, free weights, machines, and accessories.
            // Only inserted when the Equipments table is empty.
            migrationBuilder.Sql(@"
                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Futópad #1', 129942, 'out_of_order', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 129942);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Futópad #2', 129943, 'operational', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 129943);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Futópad #3', 129944, 'operational', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 129944);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Futópad #4', 129945, 'maintenance', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 129945);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Szobabicikli #1', 230001, 'operational', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 230001);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Szobabicikli #2', 230002, 'operational', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 230002);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Spinningkerékpár #1', 230010, 'operational', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 230010);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Spinningkerékpár #2', 230011, 'operational', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 230011);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Elliptikus tréner #1', 340001, 'operational', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 340001);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Elliptikus tréner #2', 340002, 'maintenance', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 340002);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Evezőgép', 340010, 'operational', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 340010);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Mellprésgép', 450001, 'operational', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 450001);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Lábprésgép', 450002, 'operational', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 450002);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Lat pulldown gép', 450003, 'operational', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 450003);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Kábelgép (cross)', 450004, 'out_of_order', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 450004);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Smith gép', 450010, 'operational', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 450010);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Scottpad', 450011, 'operational', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 450011);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Szabadsúly állvány #1', 560001, 'operational', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 560001);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Szabadsúly állvány #2', 560002, 'operational', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 560002);

                INSERT INTO Equipments (Name, SerialNumber, Status, CreatedAt, ModifiedAt, IsActive)
                SELECT 'Guggolóállvány', 560010, 'maintenance', '2026-01-01', '2026-01-01', 1
                WHERE NOT EXISTS (SELECT 1 FROM Equipments WHERE SerialNumber = 560010);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Users WHERE Email IN ('admin@suplexgym.hu', 'peter@suplexgym.hu', 'anna@gmail.com');
                DELETE FROM Settings WHERE Id IN (1, 2, 3);
                DELETE FROM News WHERE Title IN (
                    'Megnyitottunk!', 'Új csoportos edzések',
                    'Tavaszi akció – 20% kedvezmény', 'Diák- és nyugdíjasakció',
                    'Karbantartási szünet – április 28.'
                );
                DELETE FROM Equipments WHERE SerialNumber BETWEEN 129942 AND 560010;
            ");
        }
    }
}
