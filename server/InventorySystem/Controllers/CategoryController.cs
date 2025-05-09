using Microsoft.AspNetCore.Mvc;
using InventorySystem.Data;
using InventorySystem.Model;
using InventorySystem.Model.Entities;
using InventorySystem.Model.DTO;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace InventorySystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public CategoryController(AppDbContext dbContext, IMapper mapper)
        {
            this._context = dbContext;
            _mapper = mapper;
        }

        [HttpGet]
        public IActionResult getCategory()
        {
            var result = _context.Category.ToList();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public IActionResult getCategoryById(int id)
        {
            var result = _context.Category.Find(id);
            if (result is null) return NotFound("Category not found!");
            return Ok(result);
        }

        [HttpPost]
        public IActionResult CreateCategory(CreateCategoryDTO createCategoryDTO)
        {
            try
            {
                var categoryEntity = new Category
                {
                    category_name = createCategoryDTO.category_name
                };

                if (string.IsNullOrWhiteSpace(createCategoryDTO.category_name)) return BadRequest("Category name is required.");

                _context.Category.Add(categoryEntity);
                _context.SaveChanges();

                return Ok(categoryEntity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating Category: {ex.Message}");
            }
        }

        [HttpPatch("{id}")]
        public IActionResult updateCategory(int id, [FromBody] UpdateCategoryDTO updateCategoryDTO)
        {
            try
            {
                var category = _context.Category.Find(id);
                if (category == null) return NotFound("Category not found");

                _mapper.Map(updateCategoryDTO, category);
                _context.SaveChanges();

                return Ok(category);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating Category: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteCategory(int id)
        {
            try
            {
                var category = _context.Category.Find(id);

                if (category == null) return NotFound("Category not found");

                _context.Category.Remove(category);
                _context.SaveChanges();
                return Ok(category);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deletings Category: {ex.Message}");
            }
        }
    }
}
