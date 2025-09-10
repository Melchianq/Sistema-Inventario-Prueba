namespace Inventario.ProductosAPI.Models;

public class Producto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string Imagen { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public int Stock { get; set; }
}