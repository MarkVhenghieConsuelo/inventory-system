namespace InventorySystem.Model.DTO
{
    public class UpdateProductDTO
    {
        public string product_name { get; set; }
        public required decimal product_price { get; set; }
        public int product_category_id { get; set; }
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
    }
}
