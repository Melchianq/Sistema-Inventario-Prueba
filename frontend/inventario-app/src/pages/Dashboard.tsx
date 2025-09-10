import { useEffect, useState } from "react";
import { Card, Row, Col, Alert, Table, Badge, Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getEstadisticas, getProductosStockBajo } from "../api/productos";
import { getUltimasTransacciones, calcularEstadisticas } from "../api/transacciones";

interface EstadisticasProductos {
    totalProductos: number;
    stockTotal: number;
    valorInventario: number;
    productosStockBajo: number;
}

interface EstadisticasTransacciones {
    totalTransacciones: number;
    totalCompras: number;
    totalVentas: number;
    montoCompras: number;
    montoVentas: number;
    balance: number;
    ticketPromedio: number;
}

export default function Dashboard() {
    const [statsProductos, setStatsProductos] = useState<EstadisticasProductos | null>(null);
    const [statsTransacciones, setStatsTransacciones] = useState<EstadisticasTransacciones | null>(null);
    const [productosStockBajo, setProductosStockBajo] = useState<any[]>([]);
    const [ultimasTransacciones, setUltimasTransacciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError("");

        try {
            const [
                estadisticasRes,
                stockBajoRes,
                ultimasTransaccionesRes,
            ] = await Promise.all([
                getEstadisticas().catch(() => ({ data: { totalProductos: 0, stockTotal: 0, valorInventario: 0, productosStockBajo: 0 } })),
                getProductosStockBajo(5).catch(() => ({ data: { data: [] } })),
                getUltimasTransacciones(5).catch(() => ({ data: { data: [] } })),
            ]);

            setStatsProductos(estadisticasRes.data);

            const productosStockData = stockBajoRes.data.data || stockBajoRes.data || [];
            setProductosStockBajo(productosStockData);

            const transaccionesData = ultimasTransaccionesRes.data.data || ultimasTransaccionesRes.data || [];
            setUltimasTransacciones(transaccionesData);

            if (transaccionesData.length > 0) {
                const statsCalc = calcularEstadisticas(transaccionesData);
                setStatsTransacciones(statsCalc);
            }

        } catch (err) {
            setError("Error al cargar los datos del dashboard");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <div className="mt-2">Cargando dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="display-6">📊 Dashboard de Inventario</h1>
                <Button variant="outline-primary" onClick={fetchDashboardData}>
                    🔄 Actualizar
                </Button>
            </div>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {/* Tarjetas de estadísticas principales */}
            <Row className="mb-4">
                <Col xl={3} md={6} className="mb-3">
                    <Card className="h-100 border-primary">
                        <Card.Body className="text-center">
                            <div className="text-primary mb-2" style={{ fontSize: '2rem' }}>📦</div>
                            <h3 className="text-primary">{statsProductos?.totalProductos || 0}</h3>
                            <p className="mb-0 text-muted">Total Productos</p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={3} md={6} className="mb-3">
                    <Card className="h-100 border-info">
                        <Card.Body className="text-center">
                            <div className="text-info mb-2" style={{ fontSize: '2rem' }}>📊</div>
                            <h3 className="text-info">{statsProductos?.stockTotal || 0}</h3>
                            <p className="mb-0 text-muted">Unidades en Stock</p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={3} md={6} className="mb-3">
                    <Card className="h-100 border-success">
                        <Card.Body className="text-center">
                            <div className="text-success mb-2" style={{ fontSize: '2rem' }}>💰</div>
                            <h3 className="text-success">{formatCurrency(statsProductos?.valorInventario || 0)}</h3>
                            <p className="mb-0 text-muted">Valor Inventario</p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={3} md={6} className="mb-3">
                    <Card className="h-100 border-warning">
                        <Card.Body className="text-center">
                            <div className="text-warning mb-2" style={{ fontSize: '2rem' }}>⚠️</div>
                            <h3 className="text-warning">{statsProductos?.productosStockBajo || 0}</h3>
                            <p className="mb-0 text-muted">Stock Bajo</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Estadísticas de transacciones */}
            {statsTransacciones && (
                <Row className="mb-4">
                    <Col md={4} className="mb-3">
                        <Card className="h-100 bg-light">
                            <Card.Body className="text-center">
                                <h5 className="text-info">📈 Compras</h5>
                                <h4>{formatCurrency(statsTransacciones.montoCompras)}</h4>
                                <small className="text-muted">{statsTransacciones.totalCompras} transacciones</small>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4} className="mb-3">
                        <Card className="h-100 bg-light">
                            <Card.Body className="text-center">
                                <h5 className="text-success">📉 Ventas</h5>
                                <h4>{formatCurrency(statsTransacciones.montoVentas)}</h4>
                                <small className="text-muted">{statsTransacciones.totalVentas} transacciones</small>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4} className="mb-3">
                        <Card className="h-100 bg-light">
                            <Card.Body className="text-center">
                                <h5 className={`${statsTransacciones.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                                    📊 Balance
                                </h5>
                                <h4 className={statsTransacciones.balance >= 0 ? 'text-success' : 'text-danger'}>
                                    {formatCurrency(statsTransacciones.balance)}
                                </h4>
                                <small className="text-muted">Ventas - Compras</small>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Acciones rápidas */}
            <Row>
                <Col md={12}>
                    <Card>
                        <Card.Header className="bg-secondary text-white">
                            <h5 className="mb-0">⚡ Acciones Rápidas</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={3} className="mb-2">
                                    <Link to="/productos/nuevo" className="btn btn-primary w-100">
                                        ➕ Nuevo Producto
                                    </Link>
                                </Col>
                                <Col md={3} className="mb-2">
                                    <Link to="/transacciones/nueva" className="btn btn-success w-100">
                                        📄 Nueva Transacción
                                    </Link>
                                </Col>
                                <Col md={3} className="mb-2">
                                    <Link to="/productos" className="btn btn-info w-100">
                                        📦 Ver Productos
                                    </Link>
                                </Col>
                                <Col md={3} className="mb-2">
                                    <Link to="/transacciones" className="btn btn-warning w-100">
                                        📊 Ver Transacciones
                                    </Link>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}