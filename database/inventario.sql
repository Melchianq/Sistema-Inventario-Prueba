-- Script de SQL adaptado para SQL Server

-- Verifica si la base de datos existe y la crea si no
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'inventario')
BEGIN
CREATE DATABASE inventario;
END
GO

USE inventario;
GO

-- Tabla de Productos
IF OBJECT_ID(N'dbo.Productos', N'U') IS NOT NULL
DROP TABLE dbo.Productos;
GO

CREATE TABLE Productos (
Id INT IDENTITY(1,1) PRIMARY KEY,
Nombre NVARCHAR(100) NOT NULL UNIQUE,
Descripcion NVARCHAR(MAX),
Categoria NVARCHAR(50),
Imagen NVARCHAR(255),
Precio DECIMAL(10,2) NOT NULL CHECK (Precio > 0),
Stock INT NOT NULL DEFAULT 0 CHECK (Stock >= 0)
);
GO

-- Tabla de Transacciones
IF OBJECT_ID(N'dbo.Transacciones', N'U') IS NOT NULL
DROP TABLE dbo.Transacciones;
GO

CREATE TABLE Transacciones (
Id INT IDENTITY(1,1) PRIMARY KEY,
Fecha DATETIME DEFAULT GETDATE(),
Tipo VARCHAR(10) NOT NULL CHECK (Tipo IN ('Compra', 'Venta')),
ProductoId INT NOT NULL,
Cantidad INT NOT NULL CHECK (Cantidad > 0),
PrecioUnitario DECIMAL(10,2) NOT NULL CHECK (PrecioUnitario > 0),
PrecioTotal DECIMAL(10,2) NOT NULL CHECK (PrecioTotal > 0),
Detalle NVARCHAR(MAX) NOT NULL,
FOREIGN KEY (ProductoId) REFERENCES Productos(Id) ON DELETE NO ACTION
);
GO

-- Índices (los índices se crean automáticamente en las claves primarias)
CREATE INDEX idx_categoria ON Productos (Categoria);
CREATE INDEX idx_precio ON Productos (Precio);
CREATE INDEX idx_stock ON Productos (Stock);
CREATE INDEX idx_fecha ON Transacciones (Fecha);
CREATE INDEX idx_tipo ON Transacciones (Tipo);
CREATE INDEX idx_producto ON Transacciones (ProductoId);
GO

-- Datos de ejemplo para productos
-- La cláusula IGNORE de MySQL no existe en SQL Server. Se insertan directamente.
SET IDENTITY_INSERT Productos ON;
GO

INSERT INTO Productos (Id, Nombre, Descripcion, Categoria, Imagen, Precio, Stock) VALUES
(1, 'Laptop', 'Laptop de alta gama', 'Electronicos', 'https://via.placeholder.com/300x200?text=Laptop', 1299.99, 25),
(2, 'Mouse', 'Mouse inalambrico ergonomico', 'Accesorios', 'https://via.placeholder.com/300x200?text=Mouse', 99.99, 50),
(3, 'Teclado', 'Teclado mecanico RGB', 'Accesorios', 'https://via.placeholder.com/300x200?text=Teclado', 199.99, 30);
GO

SET IDENTITY_INSERT Productos OFF;
GO

-- Datos de ejemplo para transacciones
SET IDENTITY_INSERT Transacciones ON;
GO

INSERT INTO Transacciones (Id, Tipo, ProductoId, Cantidad, PrecioUnitario, PrecioTotal, Detalle) VALUES
(1, 'Compra', 1, 10, 1250.00, 12500.00, 'Compra inicial de laptops para inventario'),
(2, 'Venta', 1, 2, 1299.99, 2599.98, 'Venta a cliente corporativo XYZ Corp'),
(3, 'Compra', 2, 25, 95.00, 2375.00, 'Reposición de mouse para demanda alta'),
(4, 'Venta', 2, 5, 99.99, 499.95, 'Venta en promoción de accesorios'),
(5, 'Compra', 3, 15, 180.00, 2700.00, 'Compra de teclados mecanicos para gaming');
GO

SET IDENTITY_INSERT Transacciones OFF;
GO