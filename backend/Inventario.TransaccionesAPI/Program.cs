using Inventario.TransaccionesAPI.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("Default");
// Aquí se cambia el proveedor de base de datos a SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddHttpClient("ProductosAPI", client =>
{
    client.BaseAddress = new Uri("http://localhost:5054"); // Puerto del ProductosAPI
});

// Aquí se agrega la configuración del servicio CORS.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // <-- Puerto de Vite
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Aquí se usa la política CORS.
app.UseCors("AllowFrontend");

app.MapControllers();

app.Run();