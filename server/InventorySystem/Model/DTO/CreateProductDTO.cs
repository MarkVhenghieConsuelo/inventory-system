using System.ComponentModel.DataAnnotations.Schema;

namespace InventorySystem.Model.DTO
{
    public class CreateProductDTO
    {
        public required string product_name { get; set; }
        public required decimal product_price { get; set; }
        public int product_category_id { get; set; }
        public DateTime? created_at { get; set; } = DateTime.UtcNow;
        public DateTime? updated_at { get; set; } = DateTime.UtcNow;
    }
}
