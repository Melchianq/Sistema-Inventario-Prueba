using Microsoft.EntityFrameworkCore;
using Inventario.TransaccionesAPI.Models;

namespace Inventario.TransaccionesAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Transaccion> Transacciones => Set<Transaccion>();
}