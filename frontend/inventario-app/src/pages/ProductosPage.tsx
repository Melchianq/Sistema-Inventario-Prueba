import { useEffect, useState } from "react";
import { getProductos, deleteProducto } from "../api/productos";
import { Table, Button, Alert, Pagination, Card, Row, Col, Form, Badge, Modal, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom";

interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    categoria: string;
    imagen: string;
    precio: number;
    stock: number;
}

export default function ProductosPage() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Producto | null>(null);

    const [filtros, setFiltros] = useState({
        nombre: "",
        categoria: "",
        precioMin: "",
        precioMax: "",
        stockBajo: false
    });

    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 8
    });

    const fetchProductos = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getProductos();
            const productosData = res.data.data || res.data;
            setProductos(productosData);
            setFilteredProductos(productosData);
        } catch (err) {
            setError("Error al cargar productos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [filtros, productos]);

    const aplicarFiltros = () => {
        let filtered = [...productos];

        if (filtros.nombre) {
            filtered = filtered.filter(p =>
                p.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())
            );
        }

        if (filtros.categoria) {
            filtered = filtered.filter(p =>
                p.categoria.toLowerCase().includes(filtros.categoria.toLowerCase())
            );
        }

        if (filtros.precioMin) {
            filtered = filtered.filter(p => p.precio >= parseFloat(filtros.precioMin));
        }

        if (filtros.precioMax) {
            filtered = filtered.filter(p => p.precio <= parseFloat(filtros.precioMax));
        }

        if (filtros.stockBajo) {
            filtered = filtered.filter(p => p.stock <= 10);
        }

        setFilteredProductos(filtered);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const limpiarFiltros = () => {
        setFiltros({
            nombre: "",
            categoria: "",
            precioMin: "",
            precioMax: "",
            stockBajo: false
        });
    };

    const confirmDelete = (producto: Producto) => {
        setProductToDelete(producto);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!productToDelete) return;

        try {
            await deleteProducto(productToDelete.id);
            setMsg(`Producto "${productToDelete.nombre}" eliminado exitosamente`);
            fetchProductos();
            setShowDeleteModal(false);
            setProductToDelete(null);
        } catch (err) {
            setError("Error al eliminar producto");
        }
    };

    const getStockBadge = (stock: number) => {
        if (stock === 0) return <Badge bg="danger">Sin Stock</Badge>;
        if (stock <= 5) return <Badge bg="warning">Stock Crítico</Badge>;
        if (stock <= 10) return <Badge bg="warning">Stock Bajo</Badge>;
        return <Badge bg="success">Stock Normal</Badge>;
    };

    const getCategorias = () => {
        const categorias = [...new Set(productos.map(p => p.categoria))].filter(Boolean);
        return categorias.sort();
    };

    const calcularEstadisticas = () => {
        const total = filteredProductos.length;
        const stockTotal = filteredProductos.reduce((sum, p) => sum + p.stock, 0);
        const valorInventario = filteredProductos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
        const stockBajo = filteredProductos.filter(p => p.stock <= 10).length;

        return { total, stockTotal, valorInventario, stockBajo };
    };

    const stats = calcularEstadisticas();

    // Paginación
    const totalPages = Math.ceil(filteredProductos.length / pagination.pageSize);
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedProductos = filteredProductos.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };

    return (
        <div className="container-fluid">
            <Card className="shadow-sm mb-4">
                <Card.Header className="bg-primary text-white">
                    <Row className="align-items-center">
                        <Col>
                            <h2 className="mb-0">📦 Gestión de Productos</h2>
                        </Col>
                        <Col xs="auto">
                            <Link to="/productos/nuevo" className="btn btn-light btn-lg">
                                ➕ Nuevo Producto
                            </Link>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body>
                    {msg && <Alert variant="success" dismissible onClose={() => setMsg("")}>{msg}</Alert>}
                    {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

                    {/* Estadísticas */}
                    <Row className="mb-4">
                        <Col sm={6} md={3}>
                            <Card className="text-center bg-light">
                                <Card.Body>
                                    <h5 className="text-primary">{stats.total}</h5>
                                    <small>Total Productos</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col sm={6} md={3}>
                            <Card className="text-center bg-light">
                                <Card.Body>
                                    <h5 className="text-info">{stats.stockTotal}</h5>
                                    <small>Unidades en Stock</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col sm={6} md={3}>
                            <Card className="text-center bg-light">
                                <Card.Body>
                                    <h5 className="text-success">${stats.valorInventario.toFixed(2)}</h5>
                                    <small>Valor Inventario</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col sm={6} md={3}>
                            <Card className="text-center bg-light">
                                <Card.Body>
                                    <h5 className="text-warning">{stats.stockBajo}</h5>
                                    <small>Stock Bajo</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Filtros Avanzados */}
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">🔍 Filtros Avanzados</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Buscar por nombre</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text>🔍</InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Nombre del producto..."
                                                value={filtros.nombre}
                                                onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Categoría</Form.Label>
                                        <Form.Select
                                            value={filtros.categoria}
                                            onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                                        >
                                            <option value="">Todas las categorías</option>
                                            {getCategorias().map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Precio mínimo</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text>$</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                step="0.01"
                                                value={filtros.precioMin}
                                                onChange={(e) => setFiltros({ ...filtros, precioMin: e.target.value })}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Precio máximo</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text>$</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                step="0.01"
                                                value={filtros.precioMax}
                                                onChange={(e) => setFiltros({ ...filtros, precioMax: e.target.value })}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Opciones</Form.Label>
                                        <div>
                                            <Form.Check
                                                type="checkbox"
                                                label="Solo stock bajo"
                                                checked={filtros.stockBajo}
                                                onChange={(e) => setFiltros({ ...filtros, stockBajo: e.target.checked })}
                                            />
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="d-flex gap-2">
                                <Button variant="outline-secondary" onClick={limpiarFiltros}>
                                    🗑️ Limpiar Filtros
                                </Button>
                                <Form.Select
                                    style={{ width: 'auto' }}
                                    value={pagination.pageSize}
                                    onChange={(e) => setPagination(prev => ({ ...prev, pageSize: parseInt(e.target.value), page: 1 }))}
                                >
                                    <option value={4}>4 por página</option>
                                    <option value={8}>8 por página</option>
                                    <option value={12}>12 por página</option>
                                    <option value={20}>20 por página</option>
                                </Form.Select>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Tabla de Productos */}
                    {loading ? (
                        <div className="text-center p-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table striped bordered hover>
                                <thead className="table-dark">
                                    <tr>
                                        <th>ID</th>
                                        <th>Imagen</th>
                                        <th>Nombre</th>
                                        <th>Categoría</th>
                                        <th>Precio</th>
                                        <th>Stock</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedProductos.map((p) => (
                                        <tr key={p.id}>
                                            <td>#{p.id}</td>
                                            <td>
                                                <img
                                                    src={p.imagen || 'https://via.placeholder.com/50x50?text=No+Img'}
                                                    alt={p.nombre}
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td>
                                                <div>
                                                    <strong>{p.nombre}</strong>
                                                    <br />
                                                    <small className="text-muted">{p.descripcion}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg="secondary">{p.categoria}</Badge>
                                            </td>
                                            <td className="fw-bold">${p.precio.toFixed(2)}</td>
                                            <td>{p.stock} unidades</td>
                                            <td>{getStockBadge(p.stock)}</td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <Link
                                                        className="btn btn-sm btn-outline-warning"
                                                        to={`/productos/editar/${p.id}`}
                                                        title="Editar"
                                                    >
                                                        ✏️
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-danger"
                                                        onClick={() => confirmDelete(p)}
                                                        title="Eliminar"
                                                    >
                                                        🗑️
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {filteredProductos.length === 0 && !loading && (
                        <Alert variant="info" className="text-center">
                            📭 No se encontraron productos con los filtros aplicados
                        </Alert>
                    )}

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <small className="text-muted">
                                Mostrando {startIndex + 1} - {Math.min(endIndex, filteredProductos.length)} de {filteredProductos.length} productos
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

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const page = Math.max(1, pagination.page - 2) + i;
                                    if (page <= totalPages) {
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
                                    disabled={pagination.page === totalPages}
                                />
                                <Pagination.Last
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={pagination.page === totalPages}
                                />
                            </Pagination>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Modal de confirmación de eliminación */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>⚠️ Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {productToDelete && (
                        <div>
                            <p>¿Está seguro que desea eliminar el producto:</p>
                            <Alert variant="warning">
                                <strong>{productToDelete.nombre}</strong><br />
                                <small>ID: #{productToDelete.id} | Stock: {productToDelete.stock} | Precio: ${productToDelete.precio}</small>
                            </Alert>
                            <p className="text-danger">
                                <small>Esta acción no se puede deshacer.</small>
                            </p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        🗑️ Eliminar Producto
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}