using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventorySystem.Model.DTO
{
    public class CreateUserDTO
    {
        public required string userFullName { get; set; }
        public required string userEmail { get; set; }
        public required string userPassword { get; set; }
    }
}
