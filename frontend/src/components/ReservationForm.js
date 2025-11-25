import React, { useState } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';

const ReservationForm = ({ service, date, time, onSuccess, onBack }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    // Validador simple de teléfono (acepta 8 a 15 dígitos)
    const isValidPhone = (p) => /^[0-9+]{8,15}$/.test(p);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones de Frontend
        if (!name.trim()) {
            toast.error('Por favor ingresa tu nombre');
            return;
        }
        if (!isValidPhone(phone)) {
            toast.error('Ingresa un número válido (Ej: 912345678)');
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading('Reservando tu hora...');

        try {
            await api.post('/api/bookings', {
                service_id: service.id,
                date,
                start_time: time,
                user_name: name,
                user_phone: phone
            });
            
            // Éxito: quitamos el loading y mostramos éxito
            toast.dismiss(loadingToast);
            toast.success('¡Reserva Exitosa! Te esperamos. 🎉', { duration: 4000 });
            onSuccess();

        } catch (err) {
            console.error(err);
            toast.dismiss(loadingToast);
            const msg = err.response?.data?.error || 'Error al reservar.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow animate__animated animate__fadeInUp">
            <div className="card-header bg-success text-white text-center">
                <h4 className="mb-0">Confirmar Reserva</h4>
            </div>
            <div className="card-body p-4">
                <div className="alert alert-light border text-center mb-4">
                    <h5 className="text-success">{service.name}</h5>
                    <p className="mb-0">📅 {date} a las ⏰ <strong>{time}</strong></p>
                    <p className="text-muted small mt-1">Valor: ${service.price}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Tu Nombre</label>
                        <input 
                            type="text" 
                            className="form-control form-control-lg" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Diego Catalán"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="form-label fw-bold">Teléfono de Contacto</label>
                        <input 
                            type="tel" 
                            className="form-control form-control-lg" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Ej: 9 1234 5678"
                        />
                        <div className="form-text">Te contactaremos a este número si hay cambios.</div>
                    </div>

                    <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-success btn-lg" disabled={loading}>
                            {loading ? 'Procesando...' : '✅ Confirmar Cita'}
                        </button>
                        <button type="button" className="btn btn-outline-secondary" onClick={onBack} disabled={loading}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservationForm;