using Microsoft.AspNetCore.Mvc;
using InventorySystem.Data;
using InventorySystem.Model;
using InventorySystem.Model.Entities;
using InventorySystem.Model.DTO;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace InventorySystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

       public SalesController(AppDbContext context, IMapper mapper)
       {
            this._context = context;
            _mapper = mapper;
       }

        [HttpGet]
        public IActionResult getSales()
        {

            var result = _context.Sales
                .Include(p => p.Product)
                .ThenInclude(p => p.Category)
                .Select(p => new
                {
                    p.sale_id,
                    p.sale_price,
                    p.sale_quantity,
                    p.sale_product_id,
                    sale_product = p.Product.product_name,
                    sale_product_category = p.Product.Category.category_name,
                    p.created_at,
                    p.updated_at
                })
                .OrderByDescending(p => p.created_at)
                .ToList();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public IActionResult getSaleById(int id)
        {
            var result = _context.Sales.Find(id);
            if (result is null) return NotFound("Sale not found!");
            return Ok(result);
        }

        [HttpPost]
        public IActionResult CreateSale(CreateSalesDTO createSalesDTO)
        {
            try
            {
                var saleEntity = new Sales
                {
                    sale_price = createSalesDTO.sale_price,
                    sale_quantity = createSalesDTO.sale_quantity,
                    sale_product_id = createSalesDTO.sale_product_id,
                    created_at = createSalesDTO.created_at,
                    updated_at = createSalesDTO.updated_at
                };

                _context.Sales.Add(saleEntity);
                _context.SaveChanges();

                return Ok(saleEntity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating Sale: {ex.Message}");
            }
        }

        [HttpPatch("{id}")]
        public IActionResult updateSale(int id, [FromBody] UpdateSalesDTO updateSalesDTO)
        {
            try
            {
                var product = _context.Sales.Find(id);
                if (product == null) return NotFound("Sale not found");

                _mapper.Map(updateSalesDTO, product);
                _context.SaveChanges();

                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating Sale: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteSale(int id)
        {
            try
            {
                var sales = _context.Sales.Find(id);

                if (sales == null) return NotFound("Sale not found");

                _context.Sales.Remove(sales);
                _context.SaveChanges();
                return Ok(sales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting Sale: {ex.Message}");
            }
        }

    }
}
