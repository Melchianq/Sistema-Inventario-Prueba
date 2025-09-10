import { useEffect, useState } from "react";
import { getTransacciones } from "../api/transacciones";
import { getProductos } from "../api/productos";
import { Table, Form, Button, Pagination, Alert, Row, Col, Card, Badge, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";

interface Transaccion {
    id: number;
    fecha: string;
    tipo: string;
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    precioTotal: number;
    detalle?: string;
}

interface Producto {
    id: number;
    nombre: string;
    stock: number;
    categoria: string;
}

export default function TransaccionesPage() {
    const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [filtro, setFiltro] = useState({ 
        fecha: "", 
        tipo: "", 
        productoId: "",
        fechaInicio: "",
        fechaFin: ""
    });
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedTransaccion, setSelectedTransaccion] = useState<Transaccion | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: any = {
                page: pagination.page,
                pageSize: pagination.pageSize
            };
            
            if (filtro.fecha) params.fecha = filtro.fecha;
            if (filtro.tipo) params.tipo = filtro.tipo;
            if (filtro.productoId) params.productoId = filtro.productoId;

            const [transaccionesRes, productosRes] = await Promise.all([
                getTransacciones(params),
                getProductos()
            ]);

            const transaccionesData = transaccionesRes.data;
            
            if (transaccionesData.data) {
                // Respuesta paginada
                setTransacciones(transaccionesData.data);
                setPagination(prev => ({
                    ...prev,
                    total: transaccionesData.total,
                    totalPages: transaccionesData.totalPages
                }));
            } else {
                // Respuesta simple
                setTransacciones(transaccionesData);
                setPagination(prev => ({
                    ...prev,
                    total: transaccionesData.length,
                    totalPages: Math.ceil(transaccionesData.length / prev.pageSize)
                }));
            }

            const productosData = productosRes.data;
            setProductos(productosData.data || productosData);
        } catch (err) {
            setError("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination.page, pagination.pageSize]);

    useEffect(() => {
        if (filtro.fecha || filtro.tipo || filtro.productoId) {
            setPagination(prev => ({ ...prev, page: 1 }));
            fetchData();
        }
    }, [filtro]);

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPagination(prev => ({ ...prev, pageSize, page: 1 }));
    };

    const limpiarFiltros = () => {
        setFiltro({ fecha: "", tipo: "", productoId: "", fechaInicio: "", fechaFin: "" });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const getProductoNombre = (productoId: number) => {
        const producto = productos.find(p => p.id === productoId);
        return producto ? producto.nombre : `Producto ID: ${productoId}`;
    };

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const mostrarDetalles = (transaccion: Transaccion) => {
        setSelectedTransaccion(transaccion);
        setShowModal(true);
    };

    const calcularResumen = () => {
        const totalCompras = transacciones
            .filter(t => t.tipo === "Compra")
            .reduce((sum, t) => sum + t.precioTotal, 0);
        
        const totalVentas = transacciones
            .filter(t => t.tipo === "Venta")
            .reduce((sum, t) => sum + t.precioTotal, 0);

        return { totalCompras, totalVentas, diferencia: totalVentas - totalCompras };
    };

    const resumen = calcularResumen();

    return (
        <div className="container-fluid">
            <Card className="shadow-sm mb-4">
                <Card.Header className="bg-primary text-white">
                    <h2 className="mb-0">📄 Gestión de Transacciones</h2>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
                    
                    {/* Botones de acción */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <Link className="btn btn-success btn-lg" to="/transacciones/nueva">
                            ➕ Nueva Transacción
                        </Link>
                        
                        {/* Resumen */}
                        <div className="d-flex gap-3">
                            <Badge bg="info" className="p-2">
                                Compras: ${resumen.totalCompras.toFixed(2)}
                            </Badge>
                            <Badge bg="success" className="p-2">
                                Ventas: ${resumen.totalVentas.toFixed(2)}
                            </Badge>
                            <Badge bg={resumen.diferencia >= 0 ? "success" : "danger"} className="p-2">
                                Balance: ${resumen.diferencia.toFixed(2)}
                            </Badge>
                        </div>
                    </div>

                    {/* Filtros avanzados */}
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">🔍 Filtros Avanzados</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Fecha Específica</Form.Label>
                                        <Form.Control 
                                            type="date" 
                                            value={filtro.fecha} 
                                            onChange={(e) => setFiltro({ ...filtro, fecha: e.target.value })} 
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tipo</Form.Label>
                                        <Form.Select 
                                            value={filtro.tipo} 
                                            onChange={(e) => setFiltro({ ...filtro, tipo: e.target.value })}
                                        >
                                            <option value="">Todos los tipos</option>
                                            <option value="Compra">📦 Compra</option>
                                            <option value="Venta">💰 Venta</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Producto</Form.Label>
                                        <Form.Select 
                                            value={filtro.productoId} 
                                            onChange={(e) => setFiltro({ ...filtro, productoId: e.target.value })}
                                        >
                                            <option value="">Todos los productos</option>
                                            {productos.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nombre}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Elementos por página</Form.Label>
                                        <Form.Select 
                                            value={pagination.pageSize}
                                            onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="d-flex gap-2">
                                <Button variant="outline-secondary" onClick={limpiarFiltros}>
                                    🗑️ Limpiar Filtros
                                </Button>
                                <Button variant="primary" onClick={fetchData} disabled={loading}>
                                    {loading ? "⏳ Cargando..." : "🔍 Aplicar Filtros"}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Tabla de transacciones */}
                    <div className="table-responsive">
                        <Table striped bordered hover size="sm">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unit.</th>
                                    <th>Precio Total</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transacciones.map((t) => (
                                    <tr key={t.id}>
                                        <td>#{t.id}</td>
                                        <td>{formatearFecha(t.fecha)}</td>
                                        <td>
                                            <Badge bg={t.tipo === "Compra" ? "info" : "success"}>
                                                {t.tipo === "Compra" ? "📦" : "💰"} {t.tipo}
                                            </Badge>
                                        </td>
                                        <td>{getProductoNombre(t.productoId)}</td>
                                        <td>{t.cantidad}</td>
                                        <td>${t.precioUnitario.toFixed(2)}</td>
                                        <td className="fw-bold">${t.precioTotal.toFixed(2)}</td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline-info"
                                                    onClick={() => mostrarDetalles(t)}
                                                >
                                                    👁️
                                                </Button>
                                                <Link 
                                                    className="btn btn-sm btn-outline-warning" 
                                                    to={`/transacciones/editar/${t.id}`}
                                                >
                                                    ✏️
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>

                    {transacciones.length === 0 && !loading && (
                        <Alert variant="info" className="text-center">
                            📭 No se encontraron transacciones con los filtros aplicados
                        </Alert>
                    )}

                    {/* Paginación */}
                    {pagination.totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <small className="text-muted">
                                Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} transacciones
                            </small>
                            
                            <Pagination>
                                <Pagination.First 
                                    onClick={() => handlePageChange(1)}
                                    disabled={pagination.page === 1}
                                />
                                <Pagination.Prev 
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                />
                                
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    const page = Math.max(1, pagination.page - 2) + i;
                                    if (page <= pagination.totalPages) {
                                        return (
                                            <Pagination.Item
                                                key={page}
                                                active={page === pagination.page}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </Pagination.Item>
                                        );
                                    }
                                    return null;
                                })}
                                
                                <Pagination.Next 
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                />
                                <Pagination.Last 
                                    onClick={() => handlePageChange(pagination.totalPages)}
                                    disabled={pagination.page === pagination.totalPages}
                                />
                            </Pagination>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Modal de detalles */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>📄 Detalles de Transacción #{selectedTransaccion?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedTransaccion && (
                        <Row>
                            <Col md={6}>
                                <p><strong>Fecha:</strong> {formatearFecha(selectedTransaccion.fecha)}</p>
                                <p><strong>Tipo:</strong> <Badge bg={selectedTransaccion.tipo === "Compra" ? "info" : "success"}>{selectedTransaccion.tipo}</Badge></p>
                                <p><strong>Producto:</strong> {getProductoNombre(selectedTransaccion.productoId)}</p>
                            </Col>
                            <Col md={6}>
                                <p><strong>Cantidad:</strong> {selectedTransaccion.cantidad} unidades</p>
                                <p><strong>Precio Unitario:</strong> ${selectedTransaccion.precioUnitario.toFixed(2)}</p>
                                <p><strong>Precio Total:</strong> <span className="fw-bold">${selectedTransaccion.precioTotal.toFixed(2)}</span></p>
                            </Col>
                            <Col xs={12}>
                                <p><strong>Detalle:</strong></p>
                                <Alert variant="light">
                                    {selectedTransaccion.detalle || "Sin detalles adicionales"}
                                </Alert>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cerrar
                    </Button>
                    {selectedTransaccion && (
                        <Link 
                            className="btn btn-primary" 
                            to={`/transacciones/editar/${selectedTransaccion.id}`}
                            onClick={() => setShowModal(false)}
                        >
                            ✏️ Editar
                        </Link>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
}