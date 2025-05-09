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
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public ProductController(AppDbContext dbContext, IMapper mapper)
        {
            this._context = dbContext;
            _mapper = mapper;
        }

        [HttpGet]
        public IActionResult getProduct()
        {

            var result = _context.Products
                .Include(p => p.Category)
                .Select(p => new
                {
                    p.product_id,
                    p.product_name,
                    p.product_price,
                    p.created_at,
                    p.updated_at,
                    p.product_category_id,
                    product_category = p.Category.category_name
                })
                .OrderByDescending(p => p.updated_at)
                .ToList();

            return Ok(result);
        }

        [HttpGet("{id}")]
        public IActionResult getProductById(int id)
        {
            var result = _context.Products.Find(id);
            if (result is null) return NotFound("Product not found!");
            return Ok(result);
        }

        [HttpPost]
        public IActionResult CreateProduct(CreateProductDTO createProductDTO)
        {
            try
            {
                var productEntity = new Product
                {
                    product_name = createProductDTO.product_name,
                    product_price = createProductDTO.product_price,
                    product_category_id = createProductDTO.product_category_id,
                    created_at = createProductDTO.created_at,
                    updated_at = createProductDTO.updated_at
                };

                _context.Products.Add(productEntity);
                _context.SaveChanges();

                return Ok(productEntity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating Product: {ex.Message}");
            }
        }

        [HttpPatch("{id}")]
        public IActionResult updateProduct(int id, [FromBody] UpdateProductDTO updateProductDTO)
        {
            try
            {
                var product = _context.Products.Find(id);
                if (product == null) return NotFound("Product not found");

                _mapper.Map(updateProductDTO, product);
                _context.SaveChanges();

                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating Product: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteProduct(int id)
        {
            try
            {
                var product = _context.Products.Find(id);

                if (product == null) return NotFound("Product not found");

                _context.Products.Remove(product);
                _context.SaveChanges();
                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deletings Product: {ex.Message}");
            }
        }
    }
}
