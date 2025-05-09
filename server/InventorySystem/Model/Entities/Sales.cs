using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace InventorySystem.Model.Entities
{
    public class Sales
    {
        [Key]
        public int sale_id { get; set; }
        public required decimal sale_price { get; set; }
        public required decimal sale_quantity { get; set; }
        public DateTime? created_at { get; set; }
        public DateTime? updated_at { get; set; }

        [ForeignKey("Product")]
        public required int sale_product_id { get; set; }
        public Product Product { get; set; }
    }
}
