import React, { useState, useContext } from 'react';
// Ya no necesitamos useNavigate aquí para el botón de mis citas
import { ConfigContext } from '../context/ConfigContext';

import ServiceSelector from './ServiceSelector';
import BarberSelector from './BarberSelector';
import DateTimeSelector from './DateTimeSelector';
import ReservationForm from './ReservationForm';

const BookingInterface = () => {
    const [selectedService, setSelectedService] = useState(null);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const { config } = useContext(ConfigContext);

    const handleReset = () => {
        setSelectedService(null);
        setSelectedBarber(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setIsSuccess(false);
    };

    const sendWhatsAppConfirmation = () => {
        if (!selectedBarber || !selectedDate || !selectedTime || !selectedService) return;
        const businessPhone = config.whatsappNumber || "56900000000"; 
        const message = `Hola *${config.appName || 'Barbería'}* 💈, acabo de agendar...`; 
        const url = `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="container mt-2" style={{ maxWidth: '800px' }}>
            
            {/* --- ENCABEZADO SIMPLIFICADO --- */}
            {/* Solo mostramos el título centrado. Eliminamos el botón y el flex-row complejo */}
            <div className="text-center mb-5">
                <h1 className="fw-bold text-uppercase fs-2 fs-md-1" style={{ letterSpacing: '2px' }}>
                    {config.welcomeTitle || 'Reserva tu Cita'} 
                    <span className="text-primary ms-2">💈</span>
                </h1>
            </div>

            {/* --- RESTO DEL CONTENIDO IGUAL --- */}
            {isSuccess ? (
                <div className="card text-center p-4 p-md-5 shadow border-0 animate__animated animate__bounceIn bg-white bg-opacity-90">
                    <div className="card-body">
                        <div className="mb-4"><span style={{ fontSize: '4rem' }}>🎉</span></div>
                        <h2 className="card-title text-success fw-bold mb-3">¡Reserva Confirmada!</h2>
                        <p className="card-text lead text-muted">
                            Tu cita quedó agendada para el <strong>{selectedDate}</strong> a las <strong>{selectedTime}</strong>.
                            <br/>Te atenderá: <strong>{selectedBarber?.name}</strong>
                        </p>
                        <div className="alert alert-info border-0 mt-4 mb-4 bg-light rounded-3">
                            <small className="text-muted d-block mb-2">Hemos enviado un correo con los detalles.</small>
                            <button onClick={sendWhatsAppConfirmation} className="btn btn-success btn-lg w-100 py-3 fw-bold shadow-sm mt-2 rounded-pill" style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}>
                                <i className="bi bi-whatsapp me-2"></i> Enviar WhatsApp
                            </button>
                        </div>
                        <div className="d-grid gap-2">
                            <button className="btn btn-outline-dark" onClick={handleReset}>Volver al Inicio</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card shadow-lg border-0 p-3 p-md-5 rounded-4 bg-white">
                    {/* PASO 1 */}
                    {!selectedService && (
                        <div className="animate__animated animate__fadeIn">
                            <h5 className="text-center text-secondary mb-4 text-uppercase fw-bold" style={{ letterSpacing: '1px', fontSize: '0.9rem' }}>1. Selecciona un Servicio</h5>
                            <ServiceSelector onSelectService={setSelectedService} />
                        </div>
                    )}
                    {/* PASO 2 */}
                    {selectedService && !selectedBarber && (
                        <div className="animate__animated animate__fadeInRight">
                            <h5 className="text-center text-secondary mb-4 text-uppercase fw-bold" style={{ letterSpacing: '1px', fontSize: '0.9rem' }}>2. Selecciona un Barbero</h5>
                            <BarberSelector onSelectBarber={setSelectedBarber} onBack={() => setSelectedService(null)} />
                        </div>
                    )}
                    {/* PASO 3 */}
                    {selectedService && selectedBarber && !selectedTime && (
                        <div className="animate__animated animate__fadeInRight">
                             <h5 className="text-center text-secondary mb-4 text-uppercase fw-bold" style={{ letterSpacing: '1px', fontSize: '0.9rem' }}>3. Fecha y Hora</h5>
                            <div className="d-flex justify-content-center align-items-center gap-2 mb-4 p-2 bg-light rounded-3 border">
                                <small className="fw-bold">{selectedService.name}</small> <span className="text-muted">/</span>
                                <small className="fw-bold text-primary">{selectedBarber.name}</small>
                                <button className="btn btn-sm text-danger py-0" onClick={() => setSelectedBarber(null)}>✕</button>
                            </div>
                            <DateTimeSelector barberId={selectedBarber.id} serviceId={selectedService.id} serviceDuration={selectedService.duration_minutes} onSelectDateTime={(date, time) => { setSelectedDate(date); setSelectedTime(time); }} />
                        </div>
                    )}
                    {/* PASO 4 */}
                    {selectedService && selectedBarber && selectedTime && (
                        <div className="animate__animated animate__fadeInUp">
                            <h5 className="text-center text-secondary mb-4 text-uppercase fw-bold" style={{ letterSpacing: '1px', fontSize: '0.9rem' }}>4. Confirma tus Datos</h5>
                            <ReservationForm service={selectedService} barber={selectedBarber} date={selectedDate} time={selectedTime} onSuccess={() => setIsSuccess(true)} onBack={() => setSelectedTime(null)} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookingInterface;