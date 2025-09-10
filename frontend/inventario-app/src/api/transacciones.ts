import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5066/api",
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para manejo de errores
API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Transacciones API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export interface Transaccion {
    id?: number;
    fecha: string;
    tipo: 'Compra' | 'Venta';
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    precioTotal: number;
    detalle: string;
}

export interface TransaccionFiltros {
    fecha?: string;
    fechaInicio?: string;
    fechaFin?: string;
    tipo?: 'Compra' | 'Venta' | '';
    productoId?: number;
    page?: number;
    pageSize?: number;
}

export interface ResumenTransacciones {
    tipo: string;
    cantidad: number;
    montoTotal: number;
}

// Obtener transacciones con filtros y paginación
export const getTransacciones = (filtros?: TransaccionFiltros) => {
    const params = new URLSearchParams();
    
    if (filtros?.fecha) params.append('fecha', filtros.fecha);
    if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros?.tipo) params.append('tipo', filtros.tipo);
    if (filtros?.productoId) params.append('productoId', filtros.productoId.toString());
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.pageSize) params.append('pageSize', filtros.pageSize.toString());
    
    return API.get(`/transacciones${params.toString() ? `?${params.toString()}` : ''}`);
};

// Obtener transacción por ID
export const getTransaccion = (id: number) => API.get(`/transacciones/${id}`);

// Crear transacción
export const createTransaccion = (data: Omit<Transaccion, 'id' | 'precioTotal'>) => {
    const transaccion = {
        ...data,
        precioTotal: data.cantidad * data.precioUnitario
    };
    return API.post("/transacciones", transaccion);
};

// Actualizar transacción
export const updateTransaccion = (id: number, data: Transaccion) => 
    API.put(`/transacciones/${id}`, data);

// Eliminar transacción
export const deleteTransaccion = (id: number) => API.delete(`/transacciones/${id}`);

// Obtener resumen de transacciones
export const getResumenTransacciones = (filtros?: { fechaInicio?: string; fechaFin?: string }) => {
    const params = new URLSearchParams();
    
    if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
    
    return API.get(`/transacciones/resumen${params.toString() ? `?${params.toString()}` : ''}`);
};

// Obtener transacciones de hoy
export const getTransaccionesHoy = () => {
    const hoy = new Date().toISOString().split('T')[0];
    return getTransacciones({ fecha: hoy });
};

// Obtener transacciones del mes actual
export const getTransaccionesMesActual = () => {
    const ahora = new Date();
    const primerDia = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().split('T')[0];
    const ultimoDia = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).toISOString().split('T')[0];
    
    return getTransacciones({ fechaInicio: primerDia, fechaFin: ultimoDia });
};

// Obtener últimas transacciones
export const getUltimasTransacciones = (limite: number = 10) => 
    getTransacciones({ page: 1, pageSize: limite });

// Obtener transacciones por producto
export const getTransaccionesPorProducto = (productoId: number) => 
    getTransacciones({ productoId });

// Validar transacción antes de crear
export const validarTransaccion = (transaccion: Omit<Transaccion, 'id' | 'precioTotal'>): string[] => {
    const errores: string[] = [];
    
    if (!transaccion.tipo) {
        errores.push("El tipo de transacción es requerido");
    }
    
    if (!transaccion.productoId || transaccion.productoId <= 0) {
        errores.push("Debe seleccionar un producto válido");
    }
    
    if (!transaccion.cantidad || transaccion.cantidad <= 0) {
        errores.push("La cantidad debe ser mayor a cero");
    }
    
    if (!transaccion.precioUnitario || transaccion.precioUnitario <= 0) {
        errores.push("El precio unitario debe ser mayor a cero");
    }
    
    if (!transaccion.detalle || transaccion.detalle.trim().length === 0) {
        errores.push("El detalle es requerido");
    }
    
    return errores;
};

// Calcular estadísticas de transacciones
export const calcularEstadisticas = (transacciones: Transaccion[]) => {
    const compras = transacciones.filter(t => t.tipo === 'Compra');
    const ventas = transacciones.filter(t => t.tipo === 'Venta');
    
    const totalCompras = compras.reduce((sum, t) => sum + t.precioTotal, 0);
    const totalVentas = ventas.reduce((sum, t) => sum + t.precioTotal, 0);
    
    return {
        totalTransacciones: transacciones.length,
        totalCompras: compras.length,
        totalVentas: ventas.length,
        montoCompras: totalCompras,
        montoVentas: totalVentas,
        balance: totalVentas - totalCompras,
        ticketPromedio: transacciones.length > 0 ? (totalCompras + totalVentas) / transacciones.length : 0
    };
};

// Obtener movimientos de stock por período
export const getMovimientosStock = (fechaInicio?: string, fechaFin?: string) => {
    return getTransacciones({ fechaInicio, fechaFin });
};

// Crear transacción de compra rápida
export const crearCompraRapida = (productoId: number, cantidad: number, precioUnitario: number, detalle: string) => {
    return createTransaccion({
        tipo: 'Compra',
        productoId,
        cantidad,
        precioUnitario,
        detalle,
        fecha: new Date().toISOString()
    });
};

// Crear transacción de venta rápida
export const crearVentaRapida = (productoId: number, cantidad: number, precioUnitario: number, detalle: string) => {
    return createTransaccion({
        tipo: 'Venta',
        productoId,
        cantidad,
        precioUnitario,
        detalle,
        fecha: new Date().toISOString()
    });
};