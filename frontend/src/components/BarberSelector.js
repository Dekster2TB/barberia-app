import React, { useState, useEffect } from 'react';
import api from '../config/api'; 
import toast from 'react-hot-toast';

const BarberSelector = ({ onSelectBarber, onBack }) => {
    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/barbers')
            .then(res => {
                setBarbers(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                toast.error('Error cargando barberos.');
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="animate__animated animate__fadeIn">
            <h3 className="text-center mb-4">¿Quién te atenderá hoy?</h3>
            
            <div className="row justify-content-center">
                {barbers.map(barber => (
                    <div key={barber.id} className="col-md-4 col-sm-6 mb-3">
                        <div 
                            className="card h-100 shadow-sm border-0 barber-card" 
                            onClick={() => onSelectBarber(barber)}
                            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="card-body text-center">
                                <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{width: '80px', height: '80px', fontSize: '24px'}}>
                                    {barber.name.charAt(0)}
                                </div>
                                <h5 className="card-title fw-bold">{barber.name}</h5>
                                <p className="card-text text-muted small">{barber.specialty}</p>
                                <button className="btn btn-outline-dark btn-sm mt-2">Elegir</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="text-center mt-4">
                <button className="btn btn-link text-muted" onClick={onBack}>
                    ← Volver a Servicios
                </button>
            </div>
        </div>
    );
};

export default BarberSelector;