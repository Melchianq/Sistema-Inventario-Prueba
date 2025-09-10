import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ProductosPage from "./pages/ProductosPage";
import ProductoForm from "./components/ProductForm";
import TransaccionesPage from "./pages/TransaccionesPage";
import TransaccionForm from "./components/TransaccionForm";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, Container } from "react-bootstrap";

// Componente para manejar errores
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>⚠️ Algo salió mal</Alert.Heading>
        <p>Ha ocurrido un error inesperado en la aplicación:</p>
        <pre className="small">{error.message}</pre>
        <hr />
        <div className="d-flex justify-content-end">
          <button className="btn btn-outline-danger" onClick={resetErrorBoundary}>
            🔄 Intentar de nuevo
          </button>
        </div>
      </Alert>
    </Container>
  );
}

// Componente 404
function NotFound() {
  return (
    <Container className="mt-5 text-center">
      <div className="py-5">
        <h1 className="display-1">404</h1>
        <h2 className="mb-4">📭 Página no encontrada</h2>
        <p className="lead mb-4">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <a href="/" className="btn btn-primary">
            🏠 Ir al Dashboard
          </a>
          <a href="/productos" className="btn btn-outline-primary">
            📦 Ver Productos
          </a>
        </div>
      </div>
    </Container>
  );
}

export default function App() {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <BrowserRouter>
        <div className="d-flex flex-column min-vh-100">
          <Layout>
            <Routes>
              {/* Ruta principal - Dashboard */}
              <Route path="/" element={<Dashboard />} />
              
              {/* Rutas de productos */}
              <Route path="/productos" element={<ProductosPage />} />
              <Route path="/productos/nuevo" element={<ProductoForm />} />
              <Route path="/productos/editar/:id" element={<ProductoForm />} />
              
              {/* Rutas de transacciones */}
              <Route path="/transacciones" element={<TransaccionesPage />} />
              <Route path="/transacciones/nueva" element={<TransaccionForm />} />
              <Route path="/transacciones/editar/:id" element={<TransaccionForm />} />
              
              {/* Redirecciones por compatibilidad */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              
              {/* Ruta 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}