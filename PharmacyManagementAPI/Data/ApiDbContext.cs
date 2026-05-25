using Microsoft.EntityFrameworkCore;
using PharmacyManagementAPI.Models;

namespace PharmacyManagementAPI.Data
{
    public class ApiDbContext : DbContext
    {
        public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options) { }

        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<PurchaseHistories> PurchaseHistories { get; set; }
        public DbSet<DrugInteraction> DrugInteractions { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
        public DbSet<OnlineOrder> OnlineOrders { get; set; }
        public DbSet<Ingredient> Ingredients { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── Medicine ──
            modelBuilder.Entity<Medicine>(entity =>
            {
                entity.Property(e => e.Price).HasPrecision(18, 2);
                entity.Property(e => e.BasePrice).HasPrecision(18, 2);
                entity.Property(e => e.CostPrice).HasPrecision(18, 2);

                entity.HasOne(e => e.Ingredient)
                    .WithMany(i => i.Medicines)
                    .HasForeignKey(e => e.IngredientId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ── Patient ──
            modelBuilder.Entity<Patient>(entity =>
            {
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(150);
                entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Email).HasMaxLength(256);
                entity.Property(e => e.TotalSpent).HasPrecision(18, 2);
            });

            // ── PurchaseHistories ──
            modelBuilder.Entity<PurchaseHistories>(entity =>
            {
                entity.Property(e => e.TotalPrice).HasPrecision(18, 2);

                entity.HasOne(e => e.Medicine)
                    .WithMany(e => e.PurchaseHistories)
                    .HasForeignKey(e => e.MedicineId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Patient)
                    .WithMany(e => e.PurchaseHistories)
                    .HasForeignKey(e => e.PatientId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ── PurchaseOrder ──
            modelBuilder.Entity<PurchaseOrder>(entity =>
            {
                entity.Property(e => e.CostPrice).HasPrecision(18, 2);
            });

            // ── OnlineOrder ──
            modelBuilder.Entity<OnlineOrder>(entity =>
            {
                entity.Property(e => e.TotalPrice).HasPrecision(18, 2);

                entity.HasOne(e => e.Medicine)
                    .WithMany(e => e.OnlineOrders)
                    .HasForeignKey(e => e.MedicineId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // ── DrugInteraction ──
            modelBuilder.Entity<DrugInteraction>(entity =>
            {
                entity.HasOne(e => e.Ingredient1)
                    .WithMany()
                    .HasForeignKey(e => e.Ingredient1Id)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(e => e.Ingredient2)
                    .WithMany()
                    .HasForeignKey(e => e.Ingredient2Id)
                    .OnDelete(DeleteBehavior.NoAction);

                // SQL Indexes: bidirectional lookup performance
                // e.g. scan-cart queries all pairs in a single WHERE clause
                entity.HasIndex(e => new { e.Ingredient1Id, e.Ingredient2Id });
                entity.HasIndex(e => new { e.Ingredient2Id, e.Ingredient1Id });
            });

            // ── Ingredient ──
            modelBuilder.Entity<Ingredient>(entity =>
            {
                // Index on IngredientId already exists as PK.
                // Add index on TherapeuticClass for Level 3 class-match queries.
                entity.HasIndex(e => e.TherapeuticClass);
            });
        }
    }
}