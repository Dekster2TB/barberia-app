import React, { useState, useEffect } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';

const ServiceSelector = ({ onSelectService }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/services')
            .then(res => {
                setServices(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                toast.error('Error cargando servicios.');
                setLoading(false);
            });
    }, []);

    // --- FUNCIÓN HELPER: Formatear a Pesos Chilenos ---
    const formatCLP = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(value);
    };

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    );

    return (
        <div className="text-center animate__animated animate__fadeIn">
            <h3 className="mb-4">1. Elige tu Servicio</h3>
            
            {services.length === 0 ? (
                <p className="text-muted">No hay servicios disponibles en este momento.</p>
            ) : (
                <div className="row justify-content-center">
                    {services.map(service => (
                        <div key={service.id} className="col-md-4 col-sm-6 mb-4">
                            <div 
                                className="card h-100 shadow-sm border-0 service-card" 
                                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                onClick={() => onSelectService(service)}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {/* IMAGEN OPCIONAL (Si existe en DB) */}
                                {service.image_url ? (
                                    <img 
                                        src={service.image_url} 
                                        className="card-img-top" 
                                        alt={service.name} 
                                        style={{height: '200px', objectFit: 'cover'}} 
                                    />
                                ) : (
                                    // Placeholder si no hay imagen (opcional, puedes quitarlo si prefieres solo texto)
                                    <div className="d-none"></div> 
                                )}

                                <div className="card-body d-flex flex-column justify-content-center">
                                    <h4 className="card-title fw-bold mb-1">{service.name}</h4>
                                    
                                    <div className="text-muted small mb-3">
                                        <i className="bi bi-clock me-1"></i> 
                                        {service.duration_minutes} min
                                    </div>
                                    
                                    {/* PRECIO FORMATEADO */}
                                    <h3 className="text-primary fw-bold mb-3">
                                        {formatCLP(service.price)}
                                    </h3>
                                    
                                    {service.description && (
                                        <p className="card-text text-muted small mb-3 text-truncate">
                                            {service.description}
                                        </p>
                                    )}

                                    <button className="btn btn-outline-primary w-100 mt-auto">
                                        Seleccionar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ServiceSelector;