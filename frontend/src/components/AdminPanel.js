import React, { useState, useEffect } from 'react';
import api from '../config/api'; // Usamos tu configuración inteligente

const AdminPanel = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Petición al endpoint que acabamos de probar en Insomnia
        api.get('/api/bookings')
            .then(res => {
                setBookings(res.data); // Guardamos el array de reservas
                setLoading(false);
            })
            .catch(err => {
                console.error("Error cargando reservas:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div> Cargando datos...</div>;

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>🛡️ Panel de Administración</h2>
                <button className="btn btn-outline-dark" onClick={() => window.location.reload()}>🔄 Actualizar</button>
            </div>
            
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
                                    <th>Teléfono</th>
                                    <th>Servicio</th>
                                    <th>Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b.id}>
                                        <td>{b.id}</td>
                                        <td>{b.date}</td>
                                        <td>
                                            <span className="badge bg-info text-dark" style={{fontSize: '1em'}}>
                                                {b.start_time.slice(0, 5)}
                                            </span>
                                        </td>
                                        <td className="fw-bold">{b.user_name}</td>
                                        <td>{b.user_phone}</td>
                                        <td>
                                            {/* Aquí accedemos al objeto anidado Service */}
                                            {b.Service ? b.Service.name : <span className="text-danger">Borrado</span>}
                                        </td>
                                        <td>${b.Service ? b.Service.price : '0.00'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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