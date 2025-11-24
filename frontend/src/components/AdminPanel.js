import React, { useState, useEffect, useContext } from 'react';
import api from '../config/api'; 
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    // Estados para manejar los datos y la carga
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Hooks del contexto y navegación
    const { user, logout } = useContext(AuthContext); 
    const navigate = useNavigate();

    // --- FUNCIÓN PARA CARGAR DATOS ---
    const fetchBookings = () => {
        setLoading(true);
        // La petición GET ya incluye el token en los headers gracias a AuthContext
        api.get('/api/bookings') 
            .then(res => {
                setBookings(res.data);
                setLoading(false);
            })
            .catch(err => {
                // Manejo de Errores de Seguridad:
                // Si el token es inválido (401) o no tiene permisos (403), cerrar sesión forzosamente.
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    logout();
                    navigate('/login');
                }
                console.error("Error cargando reservas:", err);
                setLoading(false);
            });
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchBookings();
    }, []);

    // --- FUNCIÓN PARA CAMBIAR ESTADO (PATCH) ---
    const handleStatusUpdate = async (id, newStatus) => {
        // Confirmación de seguridad para evitar clics accidentales
        if (!window.confirm(`¿Estás seguro de cambiar el estado de la reserva #${id} a ${newStatus.toUpperCase()}?`)) {
            return;
        }

        try {
            // Llamada al endpoint PATCH protegido
            await api.patch(`/api/bookings/${id}`, { status: newStatus });
            
            // Recargar la tabla para reflejar el cambio en la UI
            fetchBookings(); 
        } catch (err) {
            console.error(`Error al cambiar estado a ${newStatus}:`, err);
            // Feedback visual en caso de error
            const status = err.response ? err.response.status : 'Desconocido';
            alert(`Fallo al actualizar. Código de error: ${status}`);
        }
    };

    // --- FUNCIÓN PARA ESTILOS DE BADGES (UX) ---
    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-success'; // Verde
            case 'cancelled': return 'bg-danger';  // Rojo
            case 'completed': return 'bg-primary'; // Azul
            default: return 'bg-secondary';        // Gris
        }
    };

    // Renderizado de Carga
    if (loading) return (
        <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando panel de control...</p>
        </div>
    );

    // Renderizado Principal
    return (
        <div className="container mt-5 animate__animated animate__fadeIn">
            {/* Encabezado con acciones globales */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded shadow-sm">
                <h2 className="h4 mb-0 text-dark">
                    🛡️ Panel de Administración <small className="text-muted">({user?.username})</small>
                </h2>
                <div>
                    <button 
                        className="btn btn-warning me-2" 
                        onClick={() => navigate('/admin/password')}
                        title="Cambiar contraseña de administrador"
                    >
                        🔑 Clave
                    </button>
                    <button 
                        className="btn btn-outline-primary me-2" 
                        onClick={fetchBookings}
                        title="Recargar datos"
                    >
                        🔄 Actualizar
                    </button>
                    <button 
                        className="btn btn-danger" 
                        onClick={logout}
                        title="Cerrar sesión segura"
                    >
                        🚪 Salir
                    </button>
                </div>
            </div>
            
            {/* Tabla de Datos */}
            <div className="card shadow border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover table-striped mb-0 align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th># ID</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Cliente</th>
                                    <th>Teléfono</th>
                                    <th>Servicio</th>
                                    <th className="text-center">Estado</th>
                                    <th className="text-center">Acciones</th> 
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b.id}>
                                        <td>{b.id}</td>
                                        <td>{b.date}</td>
                                        <td>{b.start_time.slice(0, 5)}</td>
                                        <td className="fw-bold">{b.user_name}</td>
                                        <td>
                                            <a href={`tel:${b.user_phone}`} className="text-decoration-none text-dark">
                                                {b.user_phone}
                                            </a>
                                        </td>
                                        <td>
                                            {b.Service ? b.Service.name : <span className="text-muted fst-italic">Eliminado</span>}
                                        </td>
                                        
                                        {/* Columna de Estado */}
                                        <td className="text-center">
                                            <span className={`badge ${getStatusBadge(b.status)} px-3 py-2`}>
                                                {b.status.toUpperCase()}
                                            </span>
                                        </td>

                                        {/* Columna de Acciones */}
                                        <td className="text-center">
                                            {b.status === 'confirmed' ? (
                                                <div className="btn-group" role="group">
                                                    <button 
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleStatusUpdate(b.id, 'completed')}
                                                        title="Marcar como completada"
                                                    >
                                                        ✔ Finalizar
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleStatusUpdate(b.id, 'cancelled')}
                                                        title="Cancelar reserva"
                                                    >
                                                        ✖ Cancelar
                                                    </button>
                                                </div>
                                            ) : (
                                                <small className="text-muted">
                                                    --
                                                </small>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Estado Vacío */}
                        {bookings.length === 0 && (
                            <div className="text-center p-5">
                                <h4 className="text-muted">No hay reservas registradas aún 🦗</h4>
                                <p>Las nuevas reservas aparecerán aquí automáticamente.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;