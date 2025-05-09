using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventorySystem.Model.Entities
{
    public class Inventory
    {
        [Key]
        public int inventory_id { get; set; }

        [ForeignKey("Product")]
        public required int inventory_product_id { get; set; }
        public required decimal inventory_quantity { get; set; }
        public DateTime? updated_at { get; set; }

        public Product Product { get; set; }
    }
}
