import React, { useState } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';

const ReservationForm = ({ service, barber, date, time, onSuccess, onBack }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // Validador de teléfono
    const isValidPhone = (p) => /^[0-9+]{8,15}$/.test(p);

    // --- HELPER: Formatear a Pesos Chilenos ---
    const formatCLP = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            toast.error('Por favor ingresa tu nombre');
            return;
        }
        if (!isValidPhone(phone)) {
            toast.error('Ingresa un número válido (Ej: 912345678)');
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading('Procesando reserva...');

        try {
            await api.post('/api/bookings', {
                service_id: service.id,
                barber_id: barber.id,
                date,
                start_time: time,
                user_name: name,
                user_phone: phone,
                user_email: email 
            });
            
            toast.dismiss(loadingToast);
            toast.success('¡Reserva Exitosa! 🎉', { duration: 4000 });
            
            if (email) {
                toast('Revisa tu correo para la confirmación.', { icon: '📧' });
            }

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
                
                {/* Resumen de la Cita con PRECIO FORMATEADO */}
                <div className="alert alert-light border text-center mb-4">
                    <h5 className="text-success fw-bold">{service.name}</h5>
                    <div className="d-flex justify-content-center gap-3 text-muted small mt-2">
                        <span>📅 {date}</span>
                        <span>⏰ {time}</span>
                    </div>
                    <p className="text-muted small mt-1">
                        Atendido por: <strong>{barber.name}</strong>
                    </p>
                    {/* AQUÍ APLICAMOS EL FORMATO */}
                    <p className="fw-bold text-dark mt-1 fs-5">
                        Valor: {formatCLP(service.price)}
                    </p>
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
                    
                    <div className="mb-3">
                        <label className="form-label fw-bold">Correo Electrónico <span className="text-muted fw-normal">(Opcional)</span></label>
                        <input 
                            type="email" 
                            className="form-control form-control-lg" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nombre@ejemplo.com" 
                        />
                        <div className="form-text">Te enviaremos el comprobante aquí.</div>
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
                    </div>

                    <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-success btn-lg" disabled={loading}>
                            {loading ? 'Confirmando...' : '✅ Confirmar Cita'}
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