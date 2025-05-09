using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventorySystem.Model.Entities
{
    public class Category
    {
        [Key]
        public int category_id { get; set; }
        public required string category_name { get; set; }

        public ICollection<Product> Products { get; set; }
    }
}
