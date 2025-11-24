import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ServiceSelector = ({ onSelectService }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Pedir los servicios al Backend
        axios.get('/api/services')
            .then(response => {
                setServices(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error conectando:", err);
                setError('No se pudieron cargar los servicios.');
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-center p-5">Cargando servicios...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div>
            <h3 className="text-center mb-4">1. Elige tu Servicio</h3>
            <div className="row justify-content-center">
                {services.map(service => (
                    <div key={service.id} className="col-md-4 mb-3">
                        <div 
                            className="card h-100 shadow-sm service-card" 
                            style={{ cursor: 'pointer', transition: '0.3s' }}
                            onClick={() => onSelectService(service)}
                        >
                            <div className="card-body text-center">
                                <h5 className="card-title">{service.name}</h5>
                                <p className="card-text text-muted">
                                    ⏱ {service.duration_minutes} min
                                </p>
                                <h4 className="text-primary">${service.price}</h4>
                                <button className="btn btn-outline-primary btn-sm mt-2">
                                    Seleccionar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServiceSelector;