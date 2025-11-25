import React, { useState, useEffect, useContext } from 'react';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DevDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Llamada al endpoint financiero protegido
        api.get('/api/finance/stats')
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                // Si no es developer (403), lo mandamos al admin normal
                if (err.response?.status === 403) {
                    alert('Acceso restringido a Desarrolladores.');
                    navigate('/admin');
                }
                setLoading(false);
            });
    }, [navigate]);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div> Cargando finanzas... 💰</div>;
    
    if (!data) return <div className="text-center mt-5 text-danger">Error al cargar datos financieros.</div>;

    const { stats, details } = data;

    return (
        <div className="container mt-5 animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold text-primary mb-0">👨‍💻 Panel de Desarrollador</h2>
                    <small className="text-muted">Hola, {user?.username}</small>
                </div>
                <button className="btn btn-danger" onClick={logout}>Cerrar Sesión</button>
            </div>

            {/* TARJETAS DE RESUMEN (KPIs) */}
            <div className="row mb-4">
                {/* 1. Tu Ganancia Neta */}
                <div className="col-md-4 mb-3">
                    <div className="card text-white bg-success shadow h-100 border-0">
                        <div className="card-header fw-bold border-0 bg-success">Mi Comisión Total</div>
                        <div className="card-body text-center">
                            <h1 className="display-4 fw-bold">${stats.developer_commission.toLocaleString()}</h1>
                            <p className="card-text opacity-75 border-top border-white pt-2 mt-2">
                                {stats.completed_bookings} citas x ${stats.commission_rate}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Ingresos Totales de la Barbería */}
                <div className="col-md-4 mb-3">
                    <div className="card bg-light shadow h-100 border-secondary">
                        <div className="card-header fw-bold text-secondary border-0">Ventas Barbería</div>
                        <div className="card-body text-center">
                            <h2 className="display-5 text-dark fw-bold">${stats.barbershop_revenue.toLocaleString()}</h2>
                            <p className="card-text text-muted">Facturación bruta total</p>
                        </div>
                    </div>
                </div>

                {/* 3. Volumen de Citas */}
                <div className="col-md-4 mb-3">
                    <div className="card text-white bg-info shadow h-100 border-0">
                        <div className="card-header fw-bold border-0 bg-info text-dark">Citas Completadas</div>
                        <div className="card-body text-center text-dark">
                            <h2 className="display-5 fw-bold">{stats.completed_bookings}</h2>
                            <p className="card-text">Clientes atendidos este mes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLA DETALLADA DE TRANSACCIONES */}
            <div className="card shadow border-0 mb-5">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Detalle de Transacciones</h5>
                    <span className="badge bg-secondary">{data.period.month}/{data.period.year}</span>
                </div>
                <div className="table-responsive">
                    <table className="table table-striped table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>ID Reserva</th>
                                <th>Fecha</th>
                                <th>Servicio</th>
                                <th>Valor Servicio</th>
                                <th className="text-end">Tu Comisión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {details.map((item) => (
                                <tr key={item.id}>
                                    <td><span className="badge bg-secondary">#{item.id}</span></td>
                                    <td>{item.date}</td>
                                    <td>{item.service}</td>
                                    <td>${item.price}</td>
                                    <td className="text-end text-success fw-bold">+${item.commission}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {details.length === 0 && (
                        <div className="p-5 text-center text-muted">
                            <h4>No hay citas completadas este mes 📉</h4>
                            <p>Las comisiones aparecerán aquí cuando los barberos finalicen citas.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DevDashboard;