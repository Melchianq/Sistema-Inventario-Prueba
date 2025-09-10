**EVALUACIÓN TÉCNICA DE CONOCIMIENTOS FULLSTACK .NET Y REACT**
# **Sistema de Gestión de Inventario**
### **Descripción**

Sistema completo de gestión de inventario desarrollado con arquitectura de microservicios. El proyecto incluye un frontend en React y dos microservicios en el backend que se conectan a una base de datos SQL Server.
  
### **Arquitectura del Proyecto**

GESTION-INVENTARIO/

├── backend/  
│   ├── microservicio-productos/    # Gestión de productos  
│   └── microservicio-usuarios/     # Gestión de usuarios y autenticación  
├── frontend/                       # Aplicación React  
└── database/                       # Scripts de base de datos  

### **Tecnologías Utilizadas**  
- Backend: .NET Core 6/7, Entity Framework Core
- Frontend: React 18, TypeScript, Vite
- Base de Datos: SQL Server
- Herramientas: Visual Studio/VS Code, Git, npm  

### **Requisitos del Sistema**
**Software Requerido**
- .NET Core SDK (versión 6.0 o superior)
  - Descargar desde: https://dotnet.microsoft.com/download
  - Verificar instalación: dotnet --version

- SQL Server (versión 2017 o superior)
  - SQL Server Express es suficiente para desarrollo
  - SQL Server Management Studio (SSMS) recomendado
- Visual Studio 2022 o Visual Studio Code (recomendado para .NET)
- Git (para clonar el repositorio)

### **Instalación del Proyecto**
**1. Clonar el repositorio**
```
bash

git clone https://github.com/Melchianq/Sistema-Inventario-Prueba.git

cd Sistema-Inventario-Prueba
```
**2. Configurar cadena de conexión**
Los microservicios usan Windows Authentication por defecto. Si necesitas usar SQL Server Authentication, modifica el appsettings.json en cada microservicio:
Para Windows Authentication (por defecto):

```
  json{
  "ConnectionStrings": {
    "Default": "Server=localhost;Database=inventario;Integrated Security=True;TrustServerCertificate=True;"
  }
} 
```
Para SQL Server Authentication (si es necesario):

```
json{
  "ConnectionStrings": {
    "Default": "Server=localhost;Database=inventario;User Id=tu_usuario;Password=tu_contraseña;TrustServerCertificate=True;"
  }
}
```
### **Ejecución del Backend**

**Microservicio de Productos (Puerto 5054)**
```
bash

# Navegar al directorio del microservicio
cd backend/Inventario.ProductosAPI

# Restaurar paquetes NuGet
dotnet restore

# Compilar el proyecto
dotnet build

# Ejecutar el microservicio
dotnet run
```
**Verificación:** El servicio estará disponible en (_https://localhost:5054_)
### **Microservicio de Transacciones**
```
bash

# Abrir nueva terminal y navegar al directorio
cd backend/Inventario.TransaccionesAPI

# Restaurar paquetes NuGet
dotnet restore

# Compilar el proyecto
dotnet build

# Ejecutar el microservicio
dotnet run
```
**Verificación**: El servicio estará disponible en el puerto que se muestre en la consola.

### **Endpoints Principales**
**Microservicio de Productos (_https://localhost:5054_):**  
GET /api/productos - Listar todos los productos  
GET /api/productos/{id} - Obtener producto por ID  
POST /api/productos - Crear nuevo producto  
PUT /api/productos/{id} - Actualizar producto  
DELETE /api/productos/{id} - Eliminar producto  

**Microservicio de Transacciones:**  
GET /api/transacciones - Listar todas las transacciones  
POST /api/transacciones - Crear nueva transacción  
GET /api/transacciones/{id} - Obtener transacción por ID  

**Swagger UI (Documentación API)**  
Cuando ejecutes los microservicios en modo desarrollo, podrás acceder a la documentación automática:  
- Productos API: https://localhost:5054/swagger
- Transacciones API: {puerto}/swagger

### **Ejecución del Frontend**
**Instalación y Configuración**  
```
bash

# Navegar al directorio del frontend
cd frontend/inventario-app

# Instalar dependencias
npm install
```
**Ejecutar la Aplicación**  
```
bash

# Ejecutar en modo desarrollo con Vite
npm run dev

# La aplicación se abrirá en http://localhost:5173
```

### **Configuración de APIs**
El frontend está configurado para conectarse a los microservicios en:  

- Productos API: http://localhost:5054
- Transacciones API: Configurado en el código fuente

### **Orden de Ejecución Recomendado**
Para ejecutar todo el sistema correctamente:  

1. **SQL Server:** Verificar que está ejecutándose  
2. **Base de datos:** Ejecutar script database/inventario.sql  
3. **Backend:** Ejecutar ambos microservicios  
```
bash

# Terminal 1 - Productos API
cd backend/Inventario.ProductosAPI
dotnet run

# Terminal 2 - Transacciones API  
cd backend/Inventario.TransaccionesAPI
dotnet run
```

**Frontend:** Ejecutar aplicación React  
```
bash

# Terminal 3 - Frontend
cd frontend/inventario-app
npm run dev
```

### **Puertos Utilizados**  
- Frontend (React): http://localhost:5173
- Productos API: https://localhost:5054
- Transacciones API: Puerto asignado automáticamente
- SQL Server: Puerto 1433 (por defecto)

### **Características del Sistema**
**Funcionalidades Implementadas**  
- Gestión de Productos: CRUD completo (Crear, Leer, Actualizar, Eliminar)  
- Gestión de Transacciones: Registro de compras y ventas  
- Arquitectura de Microservicios: Separación de responsabilidades  
- API RESTful: Endpoints documentados con Swagger  

### **Estructura de Base de Datos**
**Tabla Productos:**  
- Id, Nombre, Descripcion, Categoria, Imagen, Precio, Stock

**Tabla Transacciones:**  
- Id, Fecha, Tipo (Compra/Venta), ProductoId, Cantidad, PrecioUnitario, PrecioTotal, Detalle

### **Tecnologías y Paquetes Principales**
**Backend**  
- Entity Framework Core
- Microsoft.EntityFrameworkCore.SqlServer
- Swashbuckle.AspNetCore (Swagger)

**Frontend**  
- React 18
- TypeScript
- Vite
- Axios (para peticiones HTTP)

# **Funcionalidad del Sistema**
<img width="1898" height="813" alt="image" src="https://github.com/user-attachments/assets/6cbaf2f5-62c2-4423-bc79-677954ecc308" />  

### **Listado dinámico de productos y transacciones con paginación.**  

### **Productos**  
<img width="1837" height="818" alt="image" src="https://github.com/user-attachments/assets/999565de-6714-40fa-8d3f-3c73627a7f17" />  

### **Transacciones**  
<img width="1862" height="822" alt="image" src="https://github.com/user-attachments/assets/7c0c3038-87d7-4746-b6e3-70f57cada343" />

### **Pantalla para la creación de productos.**
<img width="1526" height="786" alt="image" src="https://github.com/user-attachments/assets/51041714-66cf-47a5-8353-2c4aee2a3efa" />  

### **Pantalla para la edición de productos.**
<img width="1516" height="796" alt="image" src="https://github.com/user-attachments/assets/39170b5c-3970-43a8-a997-a608cb21d94a" />

### **Pantalla para la creación de transacciones.**
<img width="1208" height="666" alt="image" src="https://github.com/user-attachments/assets/93885578-6439-44f3-961f-d1de838ff50a" />

### **Pantalla para la edición de transacciones.**
<img width="1213" height="667" alt="image" src="https://github.com/user-attachments/assets/ba682be9-8e38-4cb8-bd90-6c5d23187003" />

### **Pantalla de filtros dinámicos.**
### **Productos**  
<img width="1801" height="542" alt="image" src="https://github.com/user-attachments/assets/5d522aaa-4bca-4bb8-a254-e61d1721eee7" />  

### **Transacciones**
<img width="1832" height="555" alt="image" src="https://github.com/user-attachments/assets/833c55ef-bc54-4e2a-965f-9bbef8587447" />




