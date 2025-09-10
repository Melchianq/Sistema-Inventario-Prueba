namespace Inventario.TransaccionesAPI.Models;

public class Transaccion
{
    public int Id { get; set; }
    public DateTime Fecha { get; set; } = DateTime.Now;
    public string Tipo { get; set; } = string.Empty; // "Compra" o "Venta"
    public int ProductoId { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal PrecioTotal { get; set; }
    public string Detalle { get; set; } = string.Empty;
}