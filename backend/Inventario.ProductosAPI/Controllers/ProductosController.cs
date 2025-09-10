using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Inventario.ProductosAPI.Data;
using Inventario.ProductosAPI.Models;

namespace Inventario.ProductosAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly AppDbContext _ctx;
    private readonly ILogger<ProductosController> _logger;

    public ProductosController(AppDbContext ctx, ILogger<ProductosController> logger)
    {
        _ctx = ctx;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? nombre, [FromQuery] string? categoria,
        [FromQuery] decimal? precioMin, [FromQuery] decimal? precioMax, [FromQuery] bool? stockBajo,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var query = _ctx.Productos.AsNoTracking().AsQueryable();

            if (!string.IsNullOrEmpty(nombre))
                query = query.Where(p => p.Nombre.Contains(nombre));

            if (!string.IsNullOrEmpty(categoria))
                query = query.Where(p => p.Categoria.Contains(categoria));

            if (precioMin.HasValue)
                query = query.Where(p => p.Precio >= precioMin.Value);

            if (precioMax.HasValue)
                query = query.Where(p => p.Precio <= precioMax.Value);

            if (stockBajo.HasValue && stockBajo.Value)
                query = query.Where(p => p.Stock <= 10); // Considerar stock bajo <= 10

            var total = await query.CountAsync();
            var productos = await query
                .OrderBy(p => p.Nombre)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                Data = productos,
                Page = page,
                PageSize = pageSize,
                Total = total,
                TotalPages = (int)Math.Ceiling((double)total / pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener productos");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        try
        {
            var producto = await _ctx.Productos.FindAsync(id);
            if (producto == null)
                return NotFound("Producto no encontrado");

            return Ok(producto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener producto {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpPost]
    public async Task<IActionResult> Post(Producto producto)
    {
        try
        {
            // Validaciones
            if (string.IsNullOrWhiteSpace(producto.Nombre))
                return BadRequest("El nombre del producto es requerido");

            if (producto.Precio <= 0)
                return BadRequest("El precio debe ser mayor a cero");

            if (producto.Stock < 0)
                return BadRequest("El stock no puede ser negativo");

            // Verificar si ya existe un producto con el mismo nombre
            var existeProducto = await _ctx.Productos
                .AnyAsync(p => p.Nombre.ToLower() == producto.Nombre.ToLower());

            if (existeProducto)
                return BadRequest("Ya existe un producto con ese nombre");

            _ctx.Productos.Add(producto);
            await _ctx.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = producto.Id }, producto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear producto");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, Producto input)
    {
        try
        {
            if (id != input.Id)
                return BadRequest("El ID no coincide");

            var productoExistente = await _ctx.Productos.FindAsync(id);
            if (productoExistente == null)
                return NotFound("Producto no encontrado");

            // Validaciones
            if (string.IsNullOrWhiteSpace(input.Nombre))
                return BadRequest("El nombre del producto es requerido");

            if (input.Precio <= 0)
                return BadRequest("El precio debe ser mayor a cero");

            if (input.Stock < 0)
                return BadRequest("El stock no puede ser negativo");

            // Verificar nombre único (excluyendo el producto actual)
            var existeOtroProducto = await _ctx.Productos
                .AnyAsync(p => p.Nombre.ToLower() == input.Nombre.ToLower() && p.Id != id);

            if (existeOtroProducto)
                return BadRequest("Ya existe otro producto con ese nombre");

            // Actualizar los campos manualmente en lugar de usar EntityState.Modified
            productoExistente.Nombre = input.Nombre;
            productoExistente.Descripcion = input.Descripcion;
            productoExistente.Categoria = input.Categoria;
            productoExistente.Imagen = input.Imagen;
            productoExistente.Precio = input.Precio;
            productoExistente.Stock = input.Stock;

            await _ctx.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar producto {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var producto = await _ctx.Productos.FindAsync(id);
            if (producto == null)
                return NotFound("Producto no encontrado");

            // Verificar si el producto tiene transacciones asociadas
            // Nota: Esto requeriría comunicación con el servicio de transacciones
            // Por simplicidad, permitimos la eliminación pero en producción se debería verificar

            _ctx.Productos.Remove(producto);
            await _ctx.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar producto {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpPatch("{id}/stock")]
    public async Task<IActionResult> AjustarStock(int id, [FromBody] int nuevoStock)
    {
        try
        {
            if (nuevoStock < 0)
                return BadRequest("El stock no puede ser negativo");

            var producto = await _ctx.Productos.FindAsync(id);
            if (producto == null)
                return NotFound("Producto no encontrado");

            producto.Stock = nuevoStock;
            await _ctx.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al ajustar stock del producto {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpGet("categorias")]
    public async Task<IActionResult> GetCategorias()
    {
        try
        {
            var categorias = await _ctx.Productos
                .Where(p => !string.IsNullOrEmpty(p.Categoria))
                .Select(p => p.Categoria)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(categorias);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener categorías");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpGet("estadisticas")]
    public async Task<IActionResult> GetEstadisticas()
    {
        try
        {
            var totalProductos = await _ctx.Productos.CountAsync();
            var stockTotal = await _ctx.Productos.SumAsync(p => p.Stock);
            var valorInventario = await _ctx.Productos.SumAsync(p => p.Precio * p.Stock);
            var productosStockBajo = await _ctx.Productos.CountAsync(p => p.Stock <= 10);

            return Ok(new
            {
                TotalProductos = totalProductos,
                StockTotal = stockTotal,
                ValorInventario = valorInventario,
                ProductosStockBajo = productosStockBajo
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener estadísticas");
            return StatusCode(500, "Error interno del servidor");
        }
    }
}