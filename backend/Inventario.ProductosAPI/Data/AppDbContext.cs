using Microsoft.EntityFrameworkCore;
using Inventario.ProductosAPI.Models;

namespace Inventario.ProductosAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Producto> Productos => Set<Producto>();
}