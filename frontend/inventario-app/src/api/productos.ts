import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5054/api",
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para manejo de errores
API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export interface Producto {
    id?: number;
    nombre: string;
    descripcion: string;
    categoria: string;
    imagen: string;
    precio: number;
    stock: number;
}

export interface ProductoFiltros {
    nombre?: string;
    categoria?: string;
    precioMin?: number;
    precioMax?: number;
    stockBajo?: boolean;
    page?: number;
    pageSize?: number;
}

// Obtener productos con filtros y paginación
export const getProductos = (filtros?: ProductoFiltros) => {
    const params = new URLSearchParams();
    
    if (filtros?.nombre) params.append('nombre', filtros.nombre);
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    if (filtros?.precioMin !== undefined) params.append('precioMin', filtros.precioMin.toString());
    if (filtros?.precioMax !== undefined) params.append('precioMax', filtros.precioMax.toString());
    if (filtros?.stockBajo) params.append('stockBajo', 'true');
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.pageSize) params.append('pageSize', filtros.pageSize.toString());
    
    return API.get(`/productos${params.toString() ? `?${params.toString()}` : ''}`);
};

// Obtener producto por ID
export const getProducto = (id: number) => API.get(`/productos/${id}`);

// Crear producto
export const createProducto = (data: Producto) => API.post("/productos", data);

// Actualizar producto
export const updateProducto = (id: number, data: Producto) => API.put(`/productos/${id}`, data);

// Eliminar producto
export const deleteProducto = (id: number) => API.delete(`/productos/${id}`);

// Ajustar stock de producto
export const ajustarStock = (id: number, nuevoStock: number) => 
    API.patch(`/productos/${id}/stock`, nuevoStock);

// Obtener categorías disponibles
export const getCategorias = () => API.get("/productos/categorias");

// Obtener estadísticas de productos
export const getEstadisticas = () => API.get("/productos/estadisticas");

// Búsqueda rápida de productos
export const buscarProductos = (termino: string) => 
    API.get(`/productos?nombre=${encodeURIComponent(termino)}&pageSize=10`);

// Obtener productos con stock bajo
export const getProductosStockBajo = (limite: number = 10) => 
    API.get(`/productos?stockBajo=true&pageSize=${limite}`);

// Validar disponibilidad de stock
export const validarStock = async (productoId: number, cantidad: number): Promise<boolean> => {
    try {
        const response = await getProducto(productoId);
        const producto = response.data;
        return producto.stock >= cantidad;
    } catch {
        return false;
    }
};

// Calcular valor total del inventario
export const calcularValorInventario = async (): Promise<number> => {
    try {
        const response = await getProductos();
        const productos = response.data.data || response.data;
        return productos.reduce((total: number, producto: Producto) => 
            total + (producto.precio * producto.stock), 0
        );
    } catch {
        return 0;
    }
};