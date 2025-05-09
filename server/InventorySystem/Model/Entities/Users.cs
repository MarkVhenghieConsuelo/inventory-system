using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventorySystem.Model.Entities
{
    public class Users
    {
        [Key]
        public int userId { get; set; }
        public required string userFullName { get; set; }
        public required string userEmail { get; set; }
        public required string userPassword { get; set; }
        public required DateTime createdAt { get; set; }
    }
}
