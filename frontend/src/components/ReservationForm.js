import React, { useState } from 'react';
import axios from 'axios';

const ReservationForm = ({ service, date, time, onSuccess, onBack }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Evitar que se recargue la página
        setLoading(true);
        setError(null);

        try {
            // El payload EXACTO que espera tu backend
            const payload = {
                service_id: service.id,
                date: date,
                start_time: time,
                user_name: name,
                user_phone: phone
            };

            // ¡PUM! Enviamos la reserva
            await axios.post('/api/bookings', payload);
            
            // Si todo sale bien, avisamos al padre (App.js)
            onSuccess();

        } catch (err) {
            console.error(err);
            // Si el backend dice que está ocupado (409) u otro error
            const msg = err.response?.data?.error || 'Error al guardar la reserva.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-sm animate__animated animate__fadeInUp">
            <div className="card-body p-4">
                <h4 className="card-title text-center mb-4">Confirmar Reserva</h4>
                
                <div className="alert alert-light border text-center">
                    <strong>{service.name}</strong><br/>
                    📅 {date} a las ⏰ {time}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Tu Nombre</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            required 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Diego"
                        />
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label">Tu Teléfono</label>
                        <input 
                            type="tel" 
                            className="form-control" 
                            required 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Ej: +56 9 1234 5678"
                        />
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-success btn-lg" disabled={loading}>
                            {loading ? 'Guardando...' : '✅ Confirmar Reserva'}
                        </button>
                        <button type="button" className="btn btn-link text-muted" onClick={onBack}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservationForm;