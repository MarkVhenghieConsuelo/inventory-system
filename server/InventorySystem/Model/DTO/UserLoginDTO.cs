using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventorySystem.Model.DTO
{
    public class UserLoginDTO
    {
        public string userEmail { get; set; }
        public string userPassword { get; set; }
    }
}
