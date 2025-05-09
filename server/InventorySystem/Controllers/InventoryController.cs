using Microsoft.AspNetCore.Mvc;
using InventorySystem.Data;
using InventorySystem.Model;
using InventorySystem.Model.Entities;
using InventorySystem.Model.DTO;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace InventorySystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public InventoryController(AppDbContext context, IMapper mapper)
        {
            this._context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public IActionResult getInventory()
        {

            var result = _context.Inventory
                .Include(p => p.Product)
                .ThenInclude(p => p.Category)
                .Select(p => new
                {
                    p.inventory_id,
                    p.inventory_quantity,
                    p.updated_at,
                    p.inventory_product_id,
                    inventory_product = p.Product.product_name,
                    inventory_product_category = p.Product.Category.category_name
                })
                .OrderByDescending(p => p.updated_at)
                .ToList();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public IActionResult getInventoryById(int id)
        {
            var result = _context.Inventory.Find(id);
            if (result is null) return NotFound("Inventory not found!");
            return Ok(result);
        }

        [HttpPost]
        public IActionResult CreateInventory(CreateInventoryDTO createInventoryDTO)
        {
            try
            {
                var invEntity = new Inventory
                {
                    inventory_product_id = createInventoryDTO.inventory_product_id,
                    inventory_quantity = createInventoryDTO.inventory_quantity,
                    updated_at = createInventoryDTO.updated_at
                };

                _context.Inventory.Add(invEntity);
                _context.SaveChanges();

                return Ok(invEntity);
            }
            catch (Exception ex)
            {
                var st = new Exception(ex.Message);
                return StatusCode(500, $"Error creating Product: {ex.Message}");
            }
        }

        [HttpPatch("{id}")]
        public IActionResult updateInventory(int id, [FromBody] UpdateInventoryDTO updateInventoryDTO)
        {
            try
            {
                var inve = _context.Inventory.Find(id);
                if (inve == null) return NotFound("Inventory not found");

                _mapper.Map(updateInventoryDTO, inve);
                _context.SaveChanges();

                return Ok(inve);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating Inventory: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteInventory(int id)
        {
            try
            {
                var Inv = _context.Inventory.Find(id);

                if (Inv == null) return NotFound("Inventory not found");

                _context.Inventory.Remove(Inv);
                _context.SaveChanges();
                return Ok(Inv);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deletings Inventory: {ex.Message}");
            }
        }
    }
}
