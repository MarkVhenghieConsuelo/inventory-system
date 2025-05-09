namespace InventorySystem.Model.DTO
{
    public class UpdateInventoryDTO
    {
        public required int inventory_product_id { get; set; }
        public required decimal inventory_quantity { get; set; }
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
    }
}
