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
        public DbSet<ConsultationAppointment> ConsultationAppointments { get; set; }
        public DbSet<AiMedicineSearch> AiMedicineSearches { get; set; }
        public DbSet<AiSavedExplanation> AiSavedExplanations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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

            modelBuilder.Entity<Patient>(entity =>
            {
                entity.Property(e => e.FullName)
                    .IsRequired()
                    .HasMaxLength(150);

                entity.Property(e => e.PhoneNumber)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(e => e.Email)
                    .HasMaxLength(256);

                entity.Property(e => e.TotalSpent)
                    .HasPrecision(18, 2);
            });

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

            modelBuilder.Entity<PurchaseOrder>(entity =>
            {
                entity.Property(e => e.CostPrice).HasPrecision(18, 2);
            });

            modelBuilder.Entity<OnlineOrder>(entity =>
            {
                entity.Property(e => e.TotalPrice).HasPrecision(18, 2);

                entity.HasOne(e => e.Medicine)
                    .WithMany(e => e.OnlineOrders)
                    .HasForeignKey(e => e.MedicineId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

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
            });

            modelBuilder.Entity<ConsultationAppointment>(entity =>
            {
                entity.HasOne(e => e.ClientUser).WithMany().HasForeignKey(e => e.ClientUserId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.PharmacistUser).WithMany().HasForeignKey(e => e.PharmacistUserId).OnDelete(DeleteBehavior.Restrict);
                entity.HasIndex(e => e.ScheduledAt);
                entity.HasIndex(e => new { e.PharmacistUserId, e.ScheduledAt });
            });
        }
    }
}
