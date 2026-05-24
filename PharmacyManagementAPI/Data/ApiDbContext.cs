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

        public DbSet<Ingredients> Ingredients { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Ingredients>().ToTable("Ingredients");
            
            modelBuilder.Entity<DrugInteraction>()
                .HasOne(di => di.Ingredient1)
                .WithMany()
                .HasForeignKey(di => di.Ingredient1Id)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}