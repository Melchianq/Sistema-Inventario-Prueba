import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createProducto, updateProducto, getProductos } from "../api/productos";
import { Form, Button, Alert, Row, Col, Card, InputGroup, Image } from "react-bootstrap";

interface ProductForm {
    nombre: string;
    descripcion: string;
    categoria: string;
    imagen: string;
    precio: number;
    stock: number;
}

export default function ProductoForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState<ProductForm>({
        nombre: "",
        descripcion: "",
        categoria: "",
        imagen: "",
        precio: 0,
        stock: 0,
    });
    const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});
    const [generalError, setGeneralError] = useState("");
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState("");

    // Categorías predefinidas para sugerencias
    const categoriasSugeridas = [
        "Electrónicos", "Accesorios", "Audio", "Computadoras",
        "Celulares", "Cables", "Almacenamiento", "Gaming"
    ];

    useEffect(() => {
        if (id) {
            fetchProducto();
        }
    }, [id]);

    useEffect(() => {
        if (form.imagen) {
            setImagePreview(form.imagen);
        }
    }, [form.imagen]);

    const fetchProducto = async () => {
        try {
            const res = await getProductos();
            const productos = res.data.data || res.data;
            const producto = productos.find((x: any) => x.id == id);

            if (producto) {
                setForm({
                    nombre: producto.nombre || "",
                    descripcion: producto.descripcion || "",
                    categoria: producto.categoria || "",
                    imagen: producto.imagen || "",
                    precio: producto.precio || 0,
                    stock: producto.stock || 0,
                });
            }
        } catch (err) {
            setGeneralError("Error al cargar el producto");
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof ProductForm, string>> = {};

        if (!form.nombre.trim()) {
            newErrors.nombre = "El nombre es requerido";
        } else if (form.nombre.length < 2) {
            newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
        } else if (form.nombre.length > 100) {
            newErrors.nombre = "El nombre no puede exceder 100 caracteres";
        }

        if (!form.descripcion.trim()) {
            newErrors.descripcion = "La descripción es requerida";
        } else if (form.descripcion.length < 10) {
            newErrors.descripcion = "La descripción debe tener al menos 10 caracteres";
        }

        if (!form.categoria.trim()) {
            newErrors.categoria = "La categoría es requerida";
        }

        if (form.precio <= 0) {
            newErrors.precio = "El precio debe ser mayor a 0";
        } else if (form.precio > 999999.99) {
            newErrors.precio = "El precio no puede exceder $999,999.99";
        }

        if (form.stock < 0) {
            newErrors.stock = "El stock no puede ser negativo";
        } else if (form.stock > 999999) {
            newErrors.stock = "El stock no puede exceder 999,999 unidades";
        }

        if (form.imagen && !isValidImageUrl(form.imagen)) {
            newErrors.imagen = "La URL de la imagen no es válida";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidImageUrl = (url: string): boolean => {
        try {
            new URL(url);
            return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.includes('placeholder');
        } catch {
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError("");

        if (!validateForm()) {
            setGeneralError("Por favor corrija los errores en el formulario");
            return;
        }

        setLoading(true);
        try {
            if (id) {
                await updateProducto(Number(id), { ...form, id: Number(id) });
            } else {
                await createProducto(form);
            }
            navigate("/productos");
        } catch (err: any) {
            if (err.response?.status === 400) {
                setGeneralError(err.response.data || "Error de validación");
            } else {
                setGeneralError("Error al guardar el producto");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof ProductForm, value: string | number) => {
        setForm(prev => ({ ...prev, [field]: value }));

        // Limpiar error del campo específico
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <div className="container-fluid">
            <Row className="justify-content-center">
                <Col lg={10}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <h4 className="mb-0">
                                📦 {id ? "Editar" : "Nuevo"} Producto
                            </h4>
                        </Card.Header>
                        <Card.Body>
                            {generalError && (
                                <Alert variant="danger" dismissible onClose={() => setGeneralError("")}>
                                    {generalError}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={8}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold">
                                                        Nombre del Producto <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text>📦</InputGroup.Text>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Ej: Laptop Dell XPS 13"
                                                            value={form.nombre}
                                                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                                                            isInvalid={!!errors.nombre}
                                                            size="lg"
                                                        />
                                                    </InputGroup>
                                                    {errors.nombre && (
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.nombre}
                                                        </Form.Control.Feedback>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold">
                                                        Categoría <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text>🏷️</InputGroup.Text>
                                                        <Form.Select
                                                            value={form.categoria}
                                                            onChange={(e) => handleInputChange('categoria', e.target.value)}
                                                            isInvalid={!!errors.categoria}
                                                            size="lg"
                                                        >
                                                            <option value="">Seleccionar categoría</option>
                                                            {categoriasSugeridas.map(cat => (
                                                                <option key={cat} value={cat}>{cat}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </InputGroup>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="O escriba una categoría personalizada"
                                                        value={form.categoria}
                                                        onChange={(e) => handleInputChange('categoria', e.target.value)}
                                                        isInvalid={!!errors.categoria}
                                                        className="mt-2"
                                                    />
                                                    {errors.categoria && (
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.categoria}
                                                        </Form.Control.Feedback>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">
                                                Descripción <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                placeholder="Describe las características y especificaciones del producto..."
                                                value={form.descripcion}
                                                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                                isInvalid={!!errors.descripcion}
                                            />
                                            <Form.Text className="text-muted">
                                                {form.descripcion.length}/500 caracteres
                                            </Form.Text>
                                            {errors.descripcion && (
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.descripcion}
                                                </Form.Control.Feedback>
                                            )}
                                        </Form.Group>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold">
                                                        Precio <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <InputGroup size="lg">
                                                        <InputGroup.Text>💵</InputGroup.Text>
                                                        <Form.Control
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="999999.99"
                                                            placeholder="0.00"
                                                            value={form.precio || ''}
                                                            onChange={(e) => handleInputChange('precio', parseFloat(e.target.value) || 0)}
                                                            isInvalid={!!errors.precio}
                                                        />
                                                    </InputGroup>
                                                    {errors.precio && (
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.precio}
                                                        </Form.Control.Feedback>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold">Stock Inicial</Form.Label>
                                                    <InputGroup size="lg">
                                                        <InputGroup.Text>📊</InputGroup.Text>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            max="999999"
                                                            placeholder="0"
                                                            value={form.stock || ''}
                                                            onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                                                            isInvalid={!!errors.stock}
                                                        />
                                                        <InputGroup.Text>unidades</InputGroup.Text>
                                                    </InputGroup>
                                                    {errors.stock && (
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.stock}
                                                        </Form.Control.Feedback>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">URL de Imagen</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>🖼️</InputGroup.Text>
                                                <Form.Control
                                                    type="url"
                                                    placeholder="https://ejemplo.com/imagen.jpg"
                                                    value={form.imagen}
                                                    onChange={(e) => handleInputChange('imagen', e.target.value)}
                                                    isInvalid={!!errors.imagen}
                                                />
                                            </InputGroup>
                                            <Form.Text className="text-muted">
                                                Opcional. Formatos: JPG, PNG, GIF, WebP, SVG
                                            </Form.Text>
                                            {errors.imagen && (
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.imagen}
                                                </Form.Control.Feedback>
                                            )}
                                        </Form.Group>
                                    </Col>

                                    <Col md={4}>
                                        <Card className="bg-light">
                                            <Card.Header>
                                                <h6 className="mb-0">Vista Previa</h6>
                                            </Card.Header>
                                            <Card.Body className="text-center">
                                                {imagePreview ? (
                                                    <div>
                                                        <Image
                                                            src={imagePreview}
                                                            alt="Vista previa"
                                                            fluid
                                                            rounded
                                                            style={{ maxHeight: '200px', maxWidth: '100%' }}
                                                            onError={() => setImagePreview("")}
                                                        />
                                                        <div className="mt-3">
                                                            <small className="text-muted">Vista previa de la imagen</small>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-4">
                                                        <div
                                                            className="bg-secondary rounded d-flex align-items-center justify-content-center"
                                                            style={{ height: '150px', color: 'white' }}
                                                        >
                                                            📷 Sin imagen
                                                        </div>
                                                        <small className="text-muted mt-2 d-block">
                                                            Agrega una URL para ver la vista previa
                                                        </small>
                                                    </div>
                                                )}

                                                <hr />

                                                <div className="text-start">
                                                    <strong>{form.nombre || "Nombre del producto"}</strong>
                                                    <div className="text-muted small mb-2">
                                                        {form.categoria || "Categoría"}
                                                    </div>
                                                    <div className="text-success h5">
                                                        ${form.precio ? form.precio.toFixed(2) : "0.00"}
                                                    </div>
                                                    <div className="small">
                                                        Stock: {form.stock} unidades
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                <hr />

                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <Button
                                        variant="outline-secondary"
                                        size="lg"
                                        onClick={() => navigate("/productos")}
                                        disabled={loading}
                                    >
                                        ❌ Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="success"
                                        size="lg"
                                        disabled={loading}
                                    >
                                        {loading ? "⏳ Guardando..." : "💾 Guardar Producto"}
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