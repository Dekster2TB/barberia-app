import React, { useState, useEffect, useContext } from 'react';
import api from '../config/api'; 
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    // Extraemos el usuario, token y la función de logout del Contexto Global
    const { user, logout } = useContext(AuthContext); 
    const navigate = useNavigate();

    // --- FUNCIÓN PARA CARGAR DATOS ---
    const fetchBookings = () => {
        setLoading(true);
        // api.get ya incluye el token automáticamente gracias al AuthContext
        api.get('/api/bookings') 
            .then(res => {
                setBookings(res.data);
                setLoading(false);
            })
            .catch(err => {
                // Si el token es inválido (401) o prohibido (403), cerramos sesión
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

    // --- FUNCIÓN PARA ACTUALIZAR ESTADO (PATCH) ---
    const handleStatusUpdate = async (id, newStatus) => {
        // Confirmación de seguridad antes de actuar
        if (!window.confirm(`¿Estás seguro de cambiar el estado de la reserva #${id} a ${newStatus.toUpperCase()}?`)) {
            return;
        }

        try {
            // Llamada al endpoint PATCH que creamos en el Backend
            await api.patch(`/api/bookings/${id}`, { status: newStatus });
            
            // Recargar la tabla para ver los cambios reflejados
            fetchBookings(); 
        } catch (err) {
            console.error(`Error al cambiar estado a ${newStatus}:`, err);
            alert(`Fallo al actualizar. Código de error: ${err.response?.status || 'Descocido'}`);
        }
    };

    // --- AYUDA VISUAL PARA LOS ESTADOS ---
    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-success'; // Verde
            case 'cancelled': return 'bg-danger';  // Rojo
            case 'completed': return 'bg-primary'; // Azul
            default: return 'bg-secondary';        // Gris
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div> Cargando datos...</div>;

    return (
        <div className="container mt-5">
            {/* Encabezado del Panel */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>🛡️ Panel de Administración ({user?.username})</h2>
                <div>
                    <button className="btn btn-outline-dark me-2" onClick={fetchBookings}>
                        🔄 Actualizar
                    </button>
                    <button className="btn btn-danger" onClick={logout}>
                        🚪 Cerrar Sesión
                    </button>
                </div>
            </div>
            
            {/* Tabla de Reservas */}
            <div className="card shadow border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover table-striped mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th># ID</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Cliente</th>
                                    <th>Servicio</th>
                                    <th>Estado</th>
                                    <th>Acciones</th> 
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b.id}>
                                        <td>{b.id}</td>
                                        <td>{b.date}</td>
                                        <td>{b.start_time.slice(0, 5)}</td>
                                        <td className="fw-bold">{b.user_name}</td>
                                        <td>{b.Service ? b.Service.name : 'N/A'}</td>
                                        
                                        {/* Columna de Estado con Badge de Color */}
                                        <td>
                                            <span className={`badge ${getStatusBadge(b.status)}`}>
                                                {b.status.toUpperCase()}
                                            </span>
                                        </td>

                                        {/* Columna de Botones (Acciones) */}
                                        <td>
                                            {b.status === 'confirmed' && (
                                                <>
                                                    <button 
                                                        className="btn btn-sm btn-success me-2"
                                                        onClick={() => handleStatusUpdate(b.id, 'completed')}
                                                        title="Marcar como finalizada"
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
                                                </>
                                            )}
                                            {b.status !== 'confirmed' && (
                                                <small className="text-muted fst-italic">
                                                    Sin acciones
                                                </small>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Mensaje si no hay datos */}
                        {bookings.length === 0 && (
                            <div className="text-center p-5">
                                <h4>No hay reservas aún 🦗</h4>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;