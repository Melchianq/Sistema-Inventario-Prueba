import { Container, Nav, Navbar, Badge } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getEstadisticas } from "../api/productos";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const [stockBajo, setStockBajo] = useState(0);

    useEffect(() => {
        fetchStockBajo();
    }, []);

    const fetchStockBajo = async () => {
        try {
            const res = await getEstadisticas();
            setStockBajo(res.data.productosStockBajo || 0);
        } catch (error) {
            console.error("Error al obtener estadísticas:", error);
        }
    };

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="fw-bold">
                        📦 Sistema de Inventario
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />

                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link
                                as={Link}
                                to="/"
                                className={isActive('/') && location.pathname === '/' ? 'active' : ''}
                            >
                                🏠 Dashboard
                            </Nav.Link>

                            <Nav.Link
                                as={Link}
                                to="/productos"
                                className={isActive('/productos') ? 'active' : ''}
                            >
                                📦 Productos
                                {stockBajo > 0 && (
                                    <Badge bg="warning" className="ms-2">
                                        {stockBajo}
                                    </Badge>
                                )}
                            </Nav.Link>

                            <Nav.Link
                                as={Link}
                                to="/transacciones"
                                className={isActive('/transacciones') ? 'active' : ''}
                            >
                                📄 Transacciones
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Breadcrumb */}
            <div className="bg-light border-bottom py-2">
                <Container>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <Link to="/" className="text-decoration-none">🏠 Inicio</Link>
                            </li>
                            {location.pathname === '/productos' && (
                                <li className="breadcrumb-item active">📦 Productos</li>
                            )}
                            {location.pathname === '/productos/nuevo' && (
                                <>
                                    <li className="breadcrumb-item">
                                        <Link to="/productos" className="text-decoration-none">📦 Productos</Link>
                                    </li>
                                    <li className="breadcrumb-item active">➕ Nuevo</li>
                                </>
                            )}
                            {location.pathname.startsWith('/productos/editar/') && (
                                <>
                                    <li className="breadcrumb-item">
                                        <Link to="/productos" className="text-decoration-none">📦 Productos</Link>
                                    </li>
                                    <li className="breadcrumb-item active">✏️ Editar</li>
                                </>
                            )}
                            {location.pathname === '/transacciones' && (
                                <li className="breadcrumb-item active">📄 Transacciones</li>
                            )}
                            {location.pathname === '/transacciones/nueva' && (
                                <>
                                    <li className="breadcrumb-item">
                                        <Link to="/transacciones" className="text-decoration-none">📄 Transacciones</Link>
                                    </li>
                                    <li className="breadcrumb-item active">➕ Nueva</li>
                                </>
                            )}
                            {location.pathname.startsWith('/transacciones/editar/') && (
                                <>
                                    <li className="breadcrumb-item">
                                        <Link to="/transacciones" className="text-decoration-none">📄 Transacciones</Link>
                                    </li>
                                    <li className="breadcrumb-item active">✏️ Editar</li>
                                </>
                            )}
                        </ol>
                    </nav>
                </Container>
            </div>

            {/* Contenido principal */}
            <main className="py-4 min-vh-100 bg-light">
                <Container fluid>
                    {children}
                </Container>
            </main>

            {/* Footer */}
            <footer className="bg-dark text-light py-4 mt-auto">
                <Container>
                    <div className="row">
                        <div className="col-md-6">
                            <h6>📦 Sistema de Inventario</h6>
                            <p className="mb-0 small text-muted">
                                Gestión eficiente de productos y transacciones
                            </p>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <p className="mb-0 small text-muted">
                                Desarrollado con .NET Core y React
                            </p>
                            <p className="mb-0 small text-muted">
                                © 2025 Sistema de Inventario
                            </p>
                        </div>
                    </div>
                </Container>
            </footer>
        </>
    );
}