using Microsoft.EntityFrameworkCore;
using suplex_projektmunka.Models.FrontendExtraData;
using suplex_projektmunka.Models.ItemPurchases;
using suplex_projektmunka.Models.UserData;

namespace suplex_projektmunka.Models.Context
{
    public class GymContext : DbContext
    {
        public GymContext(DbContextOptions<GymContext> options)
            : base(options)
        {
        }

        public DbSet<Item> Items { get; set; } = null!;
        public DbSet<Cart> Carts { get; set; } = null!;
        public DbSet<CartItem> CartItems { get; set; } = null!;
        public DbSet<PurchaseItem> PurchaseItems { get; set; } = null!;
        public DbSet<PurchaseDetail> PurchaseDetails { get; set; } = null!;
        public DbSet<Types> Types { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Equipment> Equipments { get; set; } = null!;
        public DbSet<News> News { get; set; } = null!;
        public DbSet<BillingAddress> BillingAddress { get; set; } = null!;
        public DbSet<Roles> Roles { get; set; } = null!;
        public DbSet<Settings> Settings { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ── Relationships ────────────────────────────────────────────────

            // Item -> CartItem (1-to-1)
            modelBuilder.Entity<Item>()
                .HasOne(i => i.CartItem)
                .WithOne(ci => ci.Item)
                .HasForeignKey<CartItem>(ci => ci.Item_id);

            // Types -> Items (1-to-many)
            modelBuilder.Entity<Types>()
                .HasMany(t => t.Items)
                .WithOne(i => i.Type)
                .HasForeignKey(i => i.Type_id);

            // Cart -> CartItems (1-to-many)
            modelBuilder.Entity<Cart>()
                .HasMany(c => c.CartItems)
                .WithOne(ci => ci.Cart)
                .HasForeignKey(ci => ci.Cart_id);

            // Item -> PurchaseItems (1-to-many)
            modelBuilder.Entity<Item>()
                .HasMany(i => i.PurchaseItems)
                .WithOne(pi => pi.Item)
                .HasForeignKey(pi => pi.Item_id);

            // User -> Cart (1-to-1)
            modelBuilder.Entity<User>()
                .HasOne(u => u.Cart)
                .WithOne(c => c.User)
                .HasForeignKey<Cart>(c => c.User_id);

            // User -> PurchaseDetails (1-to-many)
            modelBuilder.Entity<User>()
                .HasMany<PurchaseDetail>()
                .WithOne(pd => pd.User)
                .HasForeignKey(pd => pd.User_id);

            // PurchaseDetail -> PurchaseItems (1-to-many)
            modelBuilder.Entity<PurchaseDetail>()
                .HasMany(pd => pd.PurchaseItems)
                .WithOne(pi => pi.PurchaseDetail)
                .HasForeignKey(pi => pi.Purchase_id);

            // Roles -> Users (1-to-many)
            modelBuilder.Entity<Roles>()
                .HasMany(r => r.Users)
                .WithOne(u => u.Roles)
                .HasForeignKey(u => u.Role_id);

            // BillingAddress -> Users (1-to-many)
            modelBuilder.Entity<BillingAddress>()
                .HasMany(b => b.Users)
                .WithOne(u => u.BillingAddress)
                .HasForeignKey(u => u.BillingAddress_id);

            // User -> Settings (1-to-1)
            modelBuilder.Entity<User>()
                .HasOne(u => u.Settings)
                .WithOne()
                .HasForeignKey<User>(u => u.Settings_id);

            // ── Seed: roles ──────────────────────────────────────────────────
            modelBuilder.Entity<Roles>().HasData(
                new Roles { Id = 1, Role = "admin", IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Roles { Id = 2, Role = "user",  IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Roles { Id = 3, Role = "staff", IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) }
            );

            // ── Seed: ticket types ───────────────────────────────────────────
            // 1=daily  2=monthly  3=annual  4=seasonal (90 days)
            modelBuilder.Entity<Types>().HasData(
                new Types { Id = 1, Type = "daily" },
                new Types { Id = 2, Type = "monthly" },
                new Types { Id = 3, Type = "annual" },
                new Types { Id = 4, Type = "seasonal" }
            );

            // ── Seed: items/passes ───────────────────────────────────────────
            modelBuilder.Entity<Item>().HasData(
                new Item
                {
                    Id = 1, Name = "Daily Pass",
                    Description = "Full facility access for one day. No commitment required.",
                    ImagePath = null, Price = 2900, Type_id = 1, ValidityDays = 1,
                    IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1)
                },
                new Item
                {
                    Id = 2, Name = "Monthly Pass",
                    Description = "Unlimited access for 30 days. Includes all group classes.",
                    ImagePath = null, Price = 12900, Type_id = 2, ValidityDays = 30,
                    IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1)
                },
                new Item
                {
                    Id = 3, Name = "Seasonal Pass",
                    Description = "90 days of unlimited access. Great value for committed trainers.",
                    ImagePath = null, Price = 32900, Type_id = 4, ValidityDays = 90,
                    IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1)
                },
                new Item
                {
                    Id = 4, Name = "Annual Pass",
                    Description = "Best value — full access for 365 days. Priority booking included.",
                    ImagePath = null, Price = 99900, Type_id = 3, ValidityDays = 365,
                    IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1)
                }
            );

            // ── Seed: Settings for the 3 demo users ─────────────────────────
            // Must be seeded before Users because of the FK Settings_id.
            modelBuilder.Entity<Settings>().HasData(
                new Settings { Id = 1, DarkMode = false, Animation = true,  Language = "hu", IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Settings { Id = 2, DarkMode = true,  Animation = true,  Language = "hu", IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Settings { Id = 3, DarkMode = false, Animation = false, Language = "hu", IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) }
            );

            // ── Seed: demo users ─────────────────────────────────────────────
            // Passwords (BCrypt cost 11):
            //   admin@suplexgym.hu  →  Admin123!   (hash from your existing DB)
            //   peter@suplexgym.hu  →  Staff123!
            //   anna@gmail.com      →  User123!
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1, Name = "Suplex Admin", Username = "admin",
                    Email = "admin@suplexgym.hu",
                    PasswordHash = "$2a$11$k7a2vkvbZMmodCBgocWMAeS7Ys6rubYQLMpogAZkdi50JftM6zCPq",
                    Role_id = 1, Settings_id = 1, IsActive = true,
                    CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1)
                },
                new User
                {
                    Id = 2, Name = "Kovács Péter", Username = "kpeter",
                    Email = "peter@suplexgym.hu",
                    PasswordHash = "$2b$11$pkOPLWmS/dgVTR6CKSiePupIjHvBoRMaklmm0mCItpDSSlqJ6FYEW",
                    Role_id = 3, Settings_id = 2, IsActive = true,
                    CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1)
                },
                new User
                {
                    Id = 3, Name = "Nagy Anna", Username = "nanna",
                    Email = "anna@gmail.com",
                    PasswordHash = "$2b$11$sfOyEWXVYffY0c.4sGXyZudGuKQl//zIGmVU.2sYz2sD.zuwXoCSm",
                    Role_id = 2, Settings_id = 3, IsActive = true,
                    CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1)
                }
            );

            // ── Seed: Hungarian news articles ────────────────────────────────
            modelBuilder.Entity<News>().HasData(
                new News
                {
                    Id = 1, Title = "Megnyitottunk!",
                    ImagePath = "",
                    Content = "Örömmel jelentjük be, hogy a Suplex Gym hivatalosan is megnyitotta kapuit! Korszerű gépparkunk, tágas öltözőink és tapasztalt edzőink várják az edzeni vágyókat hétfőtől szombatig 6:00-tól 22:00-ig. Látogass el hozzánk és próbáld ki az első edzést ingyen!",
                    IsActive = true, CreatedAt = new DateTime(2026, 1, 10), ModifiedAt = new DateTime(2026, 1, 10)
                },
                new News
                {
                    Id = 2, Title = "Új csoportos edzések",
                    ImagePath = "",
                    Content = "Februártól bővítjük csoportos óráink kínálatát! Hetente háromszor tartunk spinning, jóga és HIIT edzést is. A bérletes tagoknak az összes csoportos óra ingyenes. Időpontok és helyek korlátozottak, előre foglalás ajánlott az edzőknél.",
                    IsActive = true, CreatedAt = new DateTime(2026, 2, 1), ModifiedAt = new DateTime(2026, 2, 1)
                },
                new News
                {
                    Id = 3, Title = "Tavaszi akció – 20% kedvezmény",
                    ImagePath = "",
                    Content = "Március 15-től április 30-ig minden új bérlet vásárlásakor 20% kedvezményt adunk! Ez vonatkozik a havi, szezonális és éves bérletekre egyaránt. Ne hagyd ki – ez az ajánlatunk korlátozott ideig él. Vásárold meg most az alkalmazáson keresztül!",
                    IsActive = true, CreatedAt = new DateTime(2026, 3, 15), ModifiedAt = new DateTime(2026, 3, 15)
                },
                new News
                {
                    Id = 4, Title = "Diák- és nyugdíjasakció",
                    ImagePath = "",
                    Content = "Tudjuk, mennyire fontos a mozgás minden életszakaszban. Diákok és nyugdíjasok érvényes igazolvánnyal 30%-os kedvezménnyel vásárolhatnak bérletet a recepción. A mozgás mindenkinek jár – segítünk abban, hogy elérhető legyen számodra is.",
                    IsActive = true, CreatedAt = new DateTime(2026, 4, 1), ModifiedAt = new DateTime(2026, 4, 1)
                },
                new News
                {
                    Id = 5, Title = "Karbantartási szünet",
                    ImagePath = "",
                    Content = "Tájékoztatjuk tagjainkat, hogy április 28-án (hétfőn) reggel 6:00 és 10:00 között technikai karbantartás miatt zárva tartunk. A szünet alatt új futópadokat és szabad súlyos eszközöket helyezünk üzembe. Elnézést kérünk az esetleges kellemetlenségekért!",
                    IsActive = true, CreatedAt = new DateTime(2026, 4, 20), ModifiedAt = new DateTime(2026, 4, 20)
                }
            );

            // ── Seed: gym equipment (20 pieces) ─────────────────────────────
            // Covers cardio, machines, free-weight racks — realistic for a
            // mid-size Hungarian gym. Statuses mix operational/maintenance/
            // out_of_order to give the admin panel something interesting to show.
            modelBuilder.Entity<Equipment>().HasData(
                // Cardio
                new Equipment { Id = 1,  Name = "Futópad #1",           SerialNumber = 129942, Status = "out_of_order",  IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 2,  Name = "Futópad #2",           SerialNumber = 129943, Status = "operational",   IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 3,  Name = "Futópad #3",           SerialNumber = 129944, Status = "operational",   IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 4,  Name = "Futópad #4",           SerialNumber = 129945, Status = "maintenance",   IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 5,  Name = "Szobabicikli #1",      SerialNumber = 230001, Status = "operational",   IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 6,  Name = "Szobabicikli #2",      SerialNumber = 230002, Status = "operational",   IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 7,  Name = "Spinningkerékpár #1",  SerialNumber = 230010, Status = "operational",   IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 8,  Name = "Spinningkerékpár #2",  SerialNumber = 230011, Status = "operational",   IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 9,  Name = "Elliptikus tréner #1", SerialNumber = 340001, Status = "operational",   IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 10, Name = "Elliptikus tréner #2", SerialNumber = 340002, Status = "maintenance",   IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 11, Name = "Evezőgép",             SerialNumber = 340010, Status = "operational",   IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                // Machines
                new Equipment { Id = 12, Name = "Mellprésgép",          SerialNumber = 450001, Status = "operational",   IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 13, Name = "Lábprésgép",           SerialNumber = 450002, Status = "operational",   IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 14, Name = "Lat pulldown gép",     SerialNumber = 450003, Status = "operational",   IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 15, Name = "Kábelgép (cross)",     SerialNumber = 450004, Status = "out_of_order",  IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 16, Name = "Smith gép",            SerialNumber = 450010, Status = "operational",   IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 17, Name = "Scottpad",             SerialNumber = 450011, Status = "operational",   IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                // Free weights / racks
                new Equipment { Id = 18, Name = "Szabadsúly állvány #1", SerialNumber = 560001, Status = "operational",  IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 19, Name = "Szabadsúly állvány #2", SerialNumber = 560002, Status = "operational",  IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) },
                new Equipment { Id = 20, Name = "Guggolóállvány",        SerialNumber = 560010, Status = "maintenance",  IsActive = true, CreatedAt = new DateTime(2026, 1, 1), ModifiedAt = new DateTime(2026, 1, 1) }
            );
        }
    }
}
