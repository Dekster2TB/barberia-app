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
                    <div key={barber.id} className="col-md-4 col-sm-6 mb-4">
                        <div 
                            className="card h-100 shadow-sm border-0 barber-card" 
                            onClick={() => onSelectBarber(barber)}
                            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="card-body text-center d-flex flex-column align-items-center">
                                
                                {/* FOTO DE PERFIL (O INICIAL) */}
                                <div className="mb-3">
                                    {barber.image_url ? (
                                        <img 
                                            src={barber.image_url} 
                                            alt={barber.name} 
                                            className="rounded-circle shadow-sm object-fit-cover" 
                                            style={{width: '120px', height: '120px', objectFit: 'cover', border: '3px solid #fff'}} 
                                        />
                                    ) : (
                                        <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center shadow-sm" style={{width: '120px', height: '120px', fontSize: '40px'}}>
                                            {barber.name.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                <h5 className="card-title fw-bold mb-1">{barber.name}</h5>
                                <p className="text-primary small mb-2 fw-bold text-uppercase ls-1">
                                    {barber.specialty || 'Estilista'}
                                </p>
                                
                                {/* DESCRIPCIÓN / BIO */}
                                <p className="card-text text-muted small mb-4 px-2">
                                    {barber.bio || 'Listo para darte el mejor estilo.'}
                                </p>

                                <button className="btn btn-outline-dark btn-sm mt-auto px-4 rounded-pill">
                                    Elegir a {barber.name.split(' ')[0]}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="text-center mt-4">
                <button className="btn btn-link text-muted text-decoration-none" onClick={onBack}>
                    ← Volver a Servicios
                </button>
            </div>
        </div>
    );
};

export default BarberSelector;