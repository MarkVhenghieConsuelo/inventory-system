namespace InventorySystem.Model.DTO
{
    public class UpdateSalesDTO
    {
        public required int sale_product_id { get; set; }
        public required decimal sale_price { get; set; }
        public required decimal sale_quantity { get; set; }
        public DateTime? updated_at { get; set; } = DateTime.UtcNow;
    }
}
