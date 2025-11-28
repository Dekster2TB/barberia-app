import React, { useState, useEffect, useContext } from 'react';
import api from '../config/api'; 
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useContext(AuthContext); 
    const navigate = useNavigate();

    // --- CARGAR DATOS ---
    const fetchBookings = () => {
        setLoading(true);
        api.get('/api/bookings') 
            .then(res => {
                setBookings(res.data);
                setLoading(false);
            })
            .catch(err => {
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    logout();
                    navigate('/login');
                }
                console.error("Error cargando reservas:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchBookings();
        const interval = setInterval(fetchBookings, 60000);
        return () => clearInterval(interval);
    }, []);

    // --- ACTUALIZAR ESTADO ---
    const handleStatusUpdate = async (id, newStatus) => {
        // Mensaje personalizado según la acción
        let confirmMsg = "¿Estás seguro?";
        if (newStatus === 'completed') confirmMsg = "✅ ¿Confirmar que el servicio se realizó y COBRAR?";
        if (newStatus === 'cancelled') confirmMsg = "⚠️ ¿Cancelar cita? (No generará comisión)";
        if (newStatus === 'confirmed') confirmMsg = "↺ ¿Restaurar cita a estado activo?";

        if (!window.confirm(confirmMsg)) return;

        try {
            await api.patch(`/api/bookings/${id}`, { status: newStatus });
            fetchBookings(); 
        } catch (err) {
            alert(`Error al actualizar: ${err.response?.status}`);
        }
    };

    // --- VISUALIZACIÓN ---
    const getDisplayStatus = (booking) => {
        if (booking.status === 'cancelled') return { label: 'CANCELADO', class: 'bg-danger' };
        if (booking.status === 'completed') return { label: 'COBRADO', class: 'bg-primary' };

        const now = new Date();
        const start = new Date(`${booking.date}T${booking.start_time}`);
        const end = new Date(`${booking.date}T${booking.end_time}`);

        if (now >= start && now < end) {
            return { label: 'EN PROCESO ✂️', class: 'bg-warning text-dark fw-bold border border-dark' }; 
        }
        if (now > end) {
            return { label: 'POR COBRAR', class: 'bg-secondary' };
        }

        return { label: 'CONFIRMADO', class: 'bg-success' };
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div> Cargando...</div>;

    return (
        <div className="container mt-5 animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded shadow-sm">
                <h2 className="h4 mb-0 text-dark">
                    🛡️ Panel de Administración <small className="text-muted">({user?.username})</small>
                </h2>
                <div>
                    <button className="btn btn-warning me-2" onClick={() => navigate('/admin/password')}>🔑 Clave</button>
                    <button className="btn btn-outline-primary me-2" onClick={fetchBookings}>🔄 Actualizar</button>
                    <button className="btn btn-danger" onClick={logout}>🚪 Salir</button>
                </div>
            </div>
            
            <div className="card shadow border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover table-striped mb-0 align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th>#</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Cliente</th>
                                    <th>Teléfono</th>
                                    <th>Servicio</th>
                                    <th>Barbero</th>
                                    <th className="text-center">Estado</th>
                                    <th className="text-center" style={{minWidth: '150px'}}>Acciones</th> 
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => {
                                    const statusInfo = getDisplayStatus(b);
                                    
                                    return (
                                        <tr key={b.id}>
                                            <td>{b.id}</td>
                                            <td>{b.date}</td>
                                            <td className="fw-bold">{b.start_time.slice(0, 5)}</td>
                                            <td>{b.user_name}</td>
                                            <td><a href={`tel:${b.user_phone}`} className="text-decoration-none text-dark">{b.user_phone}</a></td>
                                            <td>{b.Service ? b.Service.name : <span className="text-muted">--</span>}</td>
                                            <td>{b.Barber ? <span className="badge bg-info text-dark">{b.Barber.name}</span> : <span className="text-muted">--</span>}</td>
                                            
                                            <td className="text-center">
                                                <span className={`badge ${statusInfo.class} px-3 py-2`}>
                                                    {statusInfo.label}
                                                </span>
                                            </td>

                                            <td className="text-center">
                                                {b.status === 'confirmed' ? (
                                                    // MODO ACTIVO: Botones Principales
                                                    <div className="btn-group" role="group">
                                                        <button 
                                                            className="btn btn-sm btn-success fw-bold"
                                                            onClick={() => handleStatusUpdate(b.id, 'completed')}
                                                            title="Servicio realizado -> Genera Comisión"
                                                        >
                                                            $$ Cobrar
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleStatusUpdate(b.id, 'cancelled')}
                                                            title="Cliente no llegó"
                                                        >
                                                            ✖
                                                        </button>
                                                    </div>
                                                ) : (
                                                    // MODO FINALIZADO: Botón de Corrección (Salvavidas)
                                                    <button 
                                                        className="btn btn-sm btn-link text-secondary text-decoration-none"
                                                        onClick={() => handleStatusUpdate(b.id, 'confirmed')}
                                                        title="Me equivoqué, volver a activar"
                                                    >
                                                        ↺ Corregir
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {bookings.length === 0 && <div className="text-center p-5 text-muted">No hay reservas.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;