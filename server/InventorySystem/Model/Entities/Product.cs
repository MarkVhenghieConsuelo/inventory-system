using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace InventorySystem.Model.Entities
{
    public class Product
    {
        [Key]
        public int product_id { get; set; }
        public required string product_name { get; set; }
        public required decimal product_price { get; set; }
        public DateTime? created_at { get; set; }
        public DateTime? updated_at { get; set; }

        [ForeignKey("Category")]
        public int product_category_id { get; set; }
        public Category Category { get; set; }

    }
}
