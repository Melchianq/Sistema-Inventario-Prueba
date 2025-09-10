import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductos } from "../api/productos";
import { createTransaccion, getTransacciones } from "../api/transacciones";
import { Form, Button, Alert, Row, Col, Card, Badge, InputGroup } from "react-bootstrap";

interface Producto {
    id: number;
    nombre: string;
    stock: number;
    precio: number;
    categoria: string;
}

export default function TransaccionForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [form, setForm] = useState({
        tipo: "Compra",
        productoId: 0,
        cantidad: 1,
        precioUnitario: 0,
        detalle: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProductos();
        if (id) {
            fetchTransaccion(parseInt(id));
        }
    }, [id]);

    const fetchProductos = async () => {
        try {
            const res = await getProductos();
            setProductos(res.data.data || res.data);
        } catch (err) {
            setError("Error al cargar productos");
        }
    };

    const fetchTransaccion = async (transaccionId: number) => {
        try {
            const res = await getTransacciones();
            const transaccion = res.data.data?.find((t: any) => t.id === transaccionId)
                || res.data.find((t: any) => t.id === transaccionId);

            if (transaccion) {
                setForm({
                    tipo: transaccion.tipo,
                    productoId: transaccion.productoId,
                    cantidad: transaccion.cantidad,
                    precioUnitario: transaccion.precioUnitario,
                    detalle: transaccion.detalle || "",
                });

                const producto = productos.find(p => p.id === transaccion.productoId);
                if (producto) setProductoSeleccionado(producto);
            }
        } catch (err) {
            setError("Error al cargar la transacción");
        }
    };

    const handleProductoChange = (productoId: number) => {
        const producto = productos.find(p => p.id === productoId);
        if (producto) {
            setProductoSeleccionado(producto);
            setForm(prev => ({
                ...prev,
                productoId,
                precioUnitario: producto.precio
            }));
        }
    };

    const calcularPrecioTotal = () => {
        return (form.cantidad * form.precioUnitario).toFixed(2);
    };

    const validarFormulario = () => {
        if (form.productoId === 0) {
            setError("Debe seleccionar un producto");
            return false;
        }

        if (form.cantidad <= 0) {
            setError("La cantidad debe ser mayor a cero");
            return false;
        }

        if (form.precioUnitario <= 0) {
            setError("El precio unitario debe ser mayor a cero");
            return false;
        }

        if (!form.detalle.trim()) {
            setError("El detalle es requerido");
            return false;
        }

        if (form.tipo === "Venta" && productoSeleccionado && form.cantidad > productoSeleccionado.stock) {
            setError(`Stock insuficiente. Disponible: ${productoSeleccionado.stock}`);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validarFormulario()) return;

        setLoading(true);
        try {
            await createTransaccion({
                ...form,
                tipo: form.tipo as "Compra" | "Venta",
                fecha: new Date().toISOString()
            });
            navigate("/transacciones");
        } catch (err: any) {
            setError(err.response?.data || "Error al registrar transacción");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid">
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <h4 className="mb-0">
                                📄 {id ? "Editar" : "Nueva"} Transacción
                            </h4>
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Tipo de Transacción</Form.Label>
                                            <Form.Select
                                                value={form.tipo}
                                                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                                                size="lg"
                                            >
                                                <option value="Compra">📦 Compra</option>
                                                <option value="Venta">💰 Venta</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Producto</Form.Label>
                                            <Form.Select
                                                required
                                                value={form.productoId}
                                                onChange={(e) => handleProductoChange(parseInt(e.target.value))}
                                                size="lg"
                                            >
                                                <option value={0}>Seleccione un producto</option>
                                                {productos.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.nombre} - Stock: {p.stock} - ${p.precio}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {productoSeleccionado && (
                                    <Alert variant="info" className="mb-3">
                                        <Row>
                                            <Col sm={6}>
                                                <strong>Producto:</strong> {productoSeleccionado.nombre}<br />
                                                <strong>Categoría:</strong> <Badge bg="secondary">{productoSeleccionado.categoria}</Badge>
                                            </Col>
                                            <Col sm={6}>
                                                <strong>Stock Actual:</strong> {productoSeleccionado.stock} unidades<br />
                                                <strong>Precio:</strong> ${productoSeleccionado.precio}
                                            </Col>
                                        </Row>
                                    </Alert>
                                )}

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Cantidad</Form.Label>
                                            <InputGroup size="lg">
                                                <InputGroup.Text>📦</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    min={1}
                                                    required
                                                    value={form.cantidad}
                                                    onChange={(e) => setForm({ ...form, cantidad: parseInt(e.target.value) || 0 })}
                                                />
                                                <InputGroup.Text>unidades</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Precio Unitario</Form.Label>
                                            <InputGroup size="lg">
                                                <InputGroup.Text>💵</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    value={form.precioUnitario}
                                                    onChange={(e) => setForm({ ...form, precioUnitario: parseFloat(e.target.value) || 0 })}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Detalle</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        required
                                        placeholder="Describe los detalles de esta transacción..."
                                        value={form.detalle}
                                        onChange={(e) => setForm({ ...form, detalle: e.target.value })}
                                    />
                                    <Form.Text className="text-muted">
                                        Incluye información relevante como proveedor, cliente, motivo, etc.
                                    </Form.Text>
                                </Form.Group>

                                <Alert variant="success" className="mb-3">
                                    <Row>
                                        <Col>
                                            <strong>Precio Total: ${calcularPrecioTotal()}</strong>
                                        </Col>
                                        {productoSeleccionado && form.tipo === "Venta" && (
                                            <Col>
                                                <small>Stock después de la venta: {productoSeleccionado.stock - form.cantidad}</small>
                                            </Col>
                                        )}
                                    </Row>
                                </Alert>

                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => navigate("/transacciones")}
                                        size="lg"
                                    >
                                        ❌ Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="success"
                                        disabled={loading}
                                        size="lg"
                                    >
                                        {loading ? "⏳ Guardando..." : "💾 Guardar Transacción"}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}