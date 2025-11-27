import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceSelector from './ServiceSelector';
import BarberSelector from './BarberSelector';
import DateTimeSelector from './DateTimeSelector';
import ReservationForm from './ReservationForm';

const BookingInterface = () => {
    // --- ESTADOS DEL FLUJO ---
    const [selectedService, setSelectedService] = useState(null);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const navigate = useNavigate();

    // --- FUNCIÓN DE REINICIO ---
    const handleReset = () => {
        setSelectedService(null);
        setSelectedBarber(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setIsSuccess(false);
    };

    // --- GENERADOR DE ENLACE WHATSAPP ---
    const sendWhatsAppConfirmation = () => {
        if (!selectedBarber || !selectedDate || !selectedTime || !selectedService) return;

        // ⚠️ REEMPLAZA CON TU NÚMERO REAL
        const businessPhone = "56912345678"; 

        const message = 
`Hola *Barbería del Futuro* 💈, acabo de agendar mi hora:%0A
✂️ *Servicio:* ${selectedService.name}%0A
👤 *Barbero:* ${selectedBarber.name}%0A
📅 *Fecha:* ${selectedDate}%0A
⏰ *Hora:* ${selectedTime}%0A%0A
Quiero confirmar que está todo listo. ¡Gracias!`;

        const url = `https://wa.me/${businessPhone}?text=${message}`;
        window.open(url, '_blank');
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '800px' }}>
            {/* ENCABEZADO: Único lugar con el botón "Mis Citas" */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h1 className="text-center m-0 fw-bold">💈 Barbería del Futuro 💈</h1>
                
                <button 
                    className="btn btn-outline-dark" 
                    onClick={() => navigate('/my-bookings')}
                >
                    📅 Mis Citas
                </button>
            </div>

            {/* --- PANTALLA DE ÉXITO --- */}
            {isSuccess ? (
                <div className="card text-center p-5 shadow border-0 animate__animated animate__bounceIn">
                    <div className="card-body">
                        <div className="mb-4"><span style={{ fontSize: '4rem' }}>🎉</span></div>
                        <h2 className="card-title text-success fw-bold mb-3">¡Reserva Confirmada!</h2>
                        
                        <p className="card-text lead text-muted">
                            Tu cita quedó agendada para el <strong>{selectedDate}</strong> a las <strong>{selectedTime}</strong>.
                            <br/>
                            Te atenderá: <strong>{selectedBarber?.name}</strong>
                        </p>
                        
                        {/* BOTÓN DE WHATSAPP */}
                        <div className="alert alert-info border-0 mt-4 mb-4 bg-light">
                            <small className="text-muted d-block mb-2">
                                Hemos enviado un correo con los detalles. <br/>
                                Para una confirmación inmediata, envíanos un WhatsApp:
                            </small>
                            <button 
                                onClick={sendWhatsAppConfirmation}
                                className="btn btn-success btn-lg w-100 py-3 fw-bold shadow-sm mt-2"
                                style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                            >
                                <i className="bi bi-whatsapp me-2"></i> Confirmar por WhatsApp
                            </button>
                        </div>

                        <div className="d-grid gap-2">
                            <button className="btn btn-outline-dark" onClick={handleReset}>
                                Volver al Inicio
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* --- FLUJO DE SELECCIÓN --- */
                <div className="card shadow-lg border-0 p-4">
                    
                    {/* PASO 1: SERVICIO */}
                    {!selectedService && (
                        <ServiceSelector onSelectService={setSelectedService} />
                    )}

                    {/* PASO 2: BARBERO */}
                    {selectedService && !selectedBarber && (
                        <BarberSelector 
                            onSelectBarber={setSelectedBarber} 
                            onBack={() => setSelectedService(null)}
                        />
                    )}

                    {/* PASO 3: FECHA Y HORA */}
                    {selectedService && selectedBarber && !selectedTime && (
                        <>
                            <div className="text-center mb-3 p-2 bg-light rounded d-flex justify-content-center align-items-center gap-2">
                                <span className="badge bg-dark">{selectedService.name}</span>
                                <span className="text-muted small">+</span>
                                <span className="badge bg-warning text-dark">{selectedBarber.name}</span>
                                <button 
                                    className="btn btn-link btn-sm p-0 ms-2 text-danger text-decoration-none" 
                                    onClick={() => setSelectedBarber(null)}
                                >
                                    (Cambiar)
                                </button>
                            </div>
                            
                            <DateTimeSelector
                                barberId={selectedBarber.id} 
                                serviceId={selectedService.id}
                                // 👇 Pasamos la duración para que el calendario filtre visualmente los slots
                                serviceDuration={selectedService.duration_minutes}
                                onSelectDateTime={(date, time) => {
                                    setSelectedDate(date);
                                    setSelectedTime(time);
                                }}
                            />
                        </>
                    )}

                    {/* PASO 4: FORMULARIO */}
                    {selectedService && selectedBarber && selectedTime && (
                        <ReservationForm
                            service={selectedService}
                            barber={selectedBarber}
                            date={selectedDate}
                            time={selectedTime}
                            onSuccess={() => setIsSuccess(true)}
                            onBack={() => setSelectedTime(null)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default BookingInterface;