import React, { useState, useEffect, useContext } from 'react';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Importar los gestores
import ServicesManager from './managers/ServicesManager';
import BarbersManager from './managers/BarbersManager';

const DevDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stats');

    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // --- HELPER: Formatear a Pesos Chilenos ---
    const formatCLP = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(value);
    };

    useEffect(() => {
        api.get('/api/finance/stats')
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                if (err.response?.status === 403) {
                    alert('Acceso restringido a Desarrolladores.');
                    navigate('/admin');
                }
                setLoading(false);
            });
    }, [navigate]);

    // --- VISTA DE ESTADÍSTICAS ---
    const StatsView = () => {
        if (!data) return <div className="text-center text-danger">No hay datos disponibles.</div>;
        const { stats, details } = data;

        return (
            <div className="animate__animated animate__fadeIn">
                {/* TARJETAS DE RESUMEN */}
                <div className="row mb-4">
                    {/* 1. Mi Comisión */}
                    <div className="col-md-4 mb-3">
                        <div className="card text-white bg-success shadow h-100 border-0">
                            <div className="card-header fw-bold bg-success border-0">Mi Comisión Total</div>
                            <div className="card-body text-center">
                                {/* APLICAMOS FORMATO AQUÍ */}
                                <h1 className="display-4 fw-bold">{formatCLP(stats.developer_commission)}</h1>
                                <p className="card-text opacity-75 border-top border-white pt-2 mt-2">
                                    {stats.completed_bookings} citas x {formatCLP(stats.commission_rate)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Ventas Barbería */}
                    <div className="col-md-4 mb-3">
                        <div className="card bg-light shadow h-100 border-secondary">
                            <div className="card-header fw-bold text-secondary border-0">Ventas Barbería</div>
                            <div className="card-body text-center">
                                {/* APLICAMOS FORMATO AQUÍ */}
                                <h2 className="display-5 text-dark fw-bold">{formatCLP(stats.barbershop_revenue)}</h2>
                                <p className="card-text text-muted">Facturación bruta total</p>
                            </div>
                        </div>
                    </div>

                    {/* 3. Citas Completadas */}
                    <div className="col-md-4 mb-3">
                        <div className="card text-white bg-info shadow h-100 border-0">
                            <div className="card-header fw-bold bg-info text-dark border-0">Citas Completadas</div>
                            <div className="card-body text-center text-dark">
                                <h2 className="display-5 fw-bold">{stats.completed_bookings}</h2>
                                <p className="card-text">Clientes atendidos este mes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLA DE DETALLES */}
                <div className="card shadow border-0">
                    <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Detalle de Transacciones</h5>
                        <span className="badge bg-secondary">{data.period.month}/{data.period.year}</span>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
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
                                        {/* APLICAMOS FORMATO EN LA TABLA */}
                                        <td>{formatCLP(item.price)}</td>
                                        <td className="text-end text-success fw-bold">+{formatCLP(item.commission)}</td>
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

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div> Cargando panel maestro...</div>;

    return (
        <div className="container mt-5 pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-primary mb-0">👨‍💻 Panel Maestro</h2>
                    <small className="text-muted">Control Total: {user?.username}</small>
                </div>
                <div>
                    <button className="btn btn-warning me-2" onClick={() => navigate('/admin/password')}>
                        🔑 Clave
                    </button>
                    <button className="btn btn-danger" onClick={logout}>
                        🚪 Salir
                    </button>
                </div>
            </div>

            <ul className="nav nav-pills nav-fill mb-4 p-1 bg-light rounded shadow-sm">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'stats' ? 'active fw-bold bg-primary text-white' : 'text-muted'}`} 
                        onClick={() => setActiveTab('stats')}
                    >
                        📊 Finanzas & Métricas
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'services' ? 'active fw-bold bg-primary text-white' : 'text-muted'}`} 
                        onClick={() => setActiveTab('services')}
                    >
                        ✂️ Gestión de Servicios
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'barbers' ? 'active fw-bold bg-primary text-white' : 'text-muted'}`} 
                        onClick={() => setActiveTab('barbers')}
                    >
                        💈 Gestión de Barberos
                    </button>
                </li>
            </ul>

            <div className="mb-5">
                {activeTab === 'stats' && <StatsView />}
                {activeTab === 'services' && <ServicesManager />}
                {activeTab === 'barbers' && <BarbersManager />}
            </div>
        </div>
    );
};

export default DevDashboard;