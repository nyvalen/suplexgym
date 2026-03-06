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

            // Seed: alapértelmezett szerepkörök
            modelBuilder.Entity<Roles>().HasData(
                new Roles
                {
                    Id = 1,
                    Role = "admin",
                    IsActive = true,
                    CreatedAt = new DateTime(2026, 1, 1),
                    ModifiedAt = new DateTime(2026, 1, 1)
                },
                new Roles
                {
                    Id = 2,
                    Role = "user",
                    IsActive = true,
                    CreatedAt = new DateTime(2026, 1, 1),
                    ModifiedAt = new DateTime(2026, 1, 1)
                }
            );

            // Seed: jegy típusok
            modelBuilder.Entity<Types>().HasData(
                new Types { Id = 1, Type = "daily" },
                new Types { Id = 2, Type = "monthly" },
                new Types { Id = 3, Type = "yearly" }
            );
        }
    }
}