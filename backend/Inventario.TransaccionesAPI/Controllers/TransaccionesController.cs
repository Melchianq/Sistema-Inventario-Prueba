using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Inventario.TransaccionesAPI.Data;
using Inventario.TransaccionesAPI.Models;
using System.Net.Http.Json;
using System.Text.Json;

namespace Inventario.TransaccionesAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransaccionesController : ControllerBase
{
    private readonly AppDbContext _ctx;
    private readonly HttpClient _http;
    private readonly ILogger<TransaccionesController> _logger;

    public TransaccionesController(AppDbContext ctx, IHttpClientFactory factory, ILogger<TransaccionesController> logger)
    {
        _ctx = ctx;
        _http = factory.CreateClient("ProductosAPI");
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] DateTime? fecha, [FromQuery] string? tipo, 
        [FromQuery] int? productoId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var query = _ctx.Transacciones.AsQueryable();

            if (fecha.HasValue)
                query = query.Where(t => t.Fecha.Date == fecha.Value.Date);

            if (!string.IsNullOrEmpty(tipo))
                query = query.Where(t => t.Tipo == tipo);

            if (productoId.HasValue)
                query = query.Where(t => t.ProductoId == productoId.Value);

            var total = await query.CountAsync();
            var transacciones = await query
                .OrderByDescending(t => t.Fecha)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                Data = transacciones,
                Page = page,
                PageSize = pageSize,
                Total = total,
                TotalPages = (int)Math.Ceiling((double)total / pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener transacciones");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        try
        {
            var transaccion = await _ctx.Transacciones.FindAsync(id);
            if (transaccion == null)
                return NotFound("Transacción no encontrada");

            return Ok(transaccion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener transacción {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpPost]
    public async Task<IActionResult> Post(Transaccion t)
    {
        try
        {
            // Validar campos requeridos
            if (string.IsNullOrWhiteSpace(t.Tipo) || string.IsNullOrWhiteSpace(t.Detalle))
                return BadRequest("Tipo y Detalle son campos requeridos");

            if (t.Cantidad <= 0 || t.PrecioUnitario <= 0)
                return BadRequest("Cantidad y precio unitario deben ser mayores a cero");

            // Verificar que el producto existe
            var response = await _http.GetAsync($"api/productos/{t.ProductoId}");
            if (!response.IsSuccessStatusCode)
                return BadRequest("Producto no encontrado");

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var producto = JsonSerializer.Deserialize<JsonElement>(jsonResponse);
            
            int stockActual = producto.GetProperty("stock").GetInt32();

            // Validar stock para ventas
            if (t.Tipo == "Venta" && stockActual < t.Cantidad)
                return BadRequest($"Stock insuficiente. Stock disponible: {stockActual}");

            // Calcular precio total
            t.PrecioTotal = t.Cantidad * t.PrecioUnitario;

            _ctx.Transacciones.Add(t);
            await _ctx.SaveChangesAsync();

            // Actualizar stock del producto
            int nuevoStock = t.Tipo == "Compra" ? stockActual + t.Cantidad : stockActual - t.Cantidad;
            
            var updateResponse = await _http.PatchAsync($"api/productos/{t.ProductoId}/stock", 
                JsonContent.Create(nuevoStock));

            if (!updateResponse.IsSuccessStatusCode)
            {
                _logger.LogWarning("Error al actualizar stock del producto {ProductoId}", t.ProductoId);
            }

            return CreatedAtAction(nameof(Get), new { id = t.Id }, t);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear transacción");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, Transaccion input)
    {
        try
        {
            if (id != input.Id)
                return BadRequest("El ID no coincide");

            var transaccionExistente = await _ctx.Transacciones.FindAsync(id);
            if (transaccionExistente == null)
                return NotFound("Transacción no encontrada");

            // Validar campos requeridos
            if (string.IsNullOrWhiteSpace(input.Tipo) || string.IsNullOrWhiteSpace(input.Detalle))
                return BadRequest("Tipo y Detalle son campos requeridos");

            // Revertir el stock de la transacción anterior
            var response = await _http.GetAsync($"api/productos/{transaccionExistente.ProductoId}");
            if (response.IsSuccessStatusCode)
            {
                var jsonResponse = await response.Content.ReadAsStringAsync();
                var producto = JsonSerializer.Deserialize<JsonElement>(jsonResponse);
                int stockActual = producto.GetProperty("stock").GetInt32();

                // Revertir transacción anterior
                int stockRevertido = transaccionExistente.Tipo == "Compra" 
                    ? stockActual - transaccionExistente.Cantidad 
                    : stockActual + transaccionExistente.Cantidad;

                // Aplicar nueva transacción
                int nuevoStock = input.Tipo == "Compra" 
                    ? stockRevertido + input.Cantidad 
                    : stockRevertido - input.Cantidad;

                if (nuevoStock < 0)
                    return BadRequest("La modificación resultaría en stock negativo");

                // Actualizar transacción
                transaccionExistente.Tipo = input.Tipo;
                transaccionExistente.ProductoId = input.ProductoId;
                transaccionExistente.Cantidad = input.Cantidad;
                transaccionExistente.PrecioUnitario = input.PrecioUnitario;
                transaccionExistente.PrecioTotal = input.Cantidad * input.PrecioUnitario;
                transaccionExistente.Detalle = input.Detalle;

                await _ctx.SaveChangesAsync();

                // Actualizar stock
                await _http.PatchAsync($"api/productos/{input.ProductoId}/stock", 
                    JsonContent.Create(nuevoStock));
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar transacción {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var transaccion = await _ctx.Transacciones.FindAsync(id);
            if (transaccion == null)
                return NotFound("Transacción no encontrada");

            // Revertir el stock
            var response = await _http.GetAsync($"api/productos/{transaccion.ProductoId}");
            if (response.IsSuccessStatusCode)
            {
                var jsonResponse = await response.Content.ReadAsStringAsync();
                var producto = JsonSerializer.Deserialize<JsonElement>(jsonResponse);
                int stockActual = producto.GetProperty("stock").GetInt32();

                int stockRevertido = transaccion.Tipo == "Compra" 
                    ? stockActual - transaccion.Cantidad 
                    : stockActual + transaccion.Cantidad;

                await _http.PatchAsync($"api/productos/{transaccion.ProductoId}/stock", 
                    JsonContent.Create(stockRevertido));
            }

            _ctx.Transacciones.Remove(transaccion);
            await _ctx.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar transacción {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    // Endpoint para obtener resumen de transacciones
    [HttpGet("resumen")]
    public async Task<IActionResult> GetResumen([FromQuery] DateTime? fechaInicio, [FromQuery] DateTime? fechaFin)
    {
        try
        {
            var query = _ctx.Transacciones.AsQueryable();

            if (fechaInicio.HasValue)
                query = query.Where(t => t.Fecha.Date >= fechaInicio.Value.Date);

            if (fechaFin.HasValue)
                query = query.Where(t => t.Fecha.Date <= fechaFin.Value.Date);

            var resumen = await query.GroupBy(t => t.Tipo)
                .Select(g => new
                {
                    Tipo = g.Key,
                    Cantidad = g.Count(),
                    MontoTotal = g.Sum(t => t.PrecioTotal)
                })
                .ToListAsync();

            return Ok(resumen);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener resumen de transacciones");
            return StatusCode(500, "Error interno del servidor");
        }
    }
}