using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.SqlServer;
using InventorySystem.Model.Entities;

namespace InventorySystem.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {

        }
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Category { get; set; }
        public DbSet<Users> Users { get; set; }
        public DbSet<Inventory> Inventory { get; set; }
        public DbSet<Sales> Sales { get; set; }

        /*
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Product>()
                .HasOne(p => p.ProductCategory)  
                .WithMany(c => c.Products)       
                .HasForeignKey(p => p.productCategory)  
                .OnDelete(DeleteBehavior.Restrict);
        }
        */
    }
}
