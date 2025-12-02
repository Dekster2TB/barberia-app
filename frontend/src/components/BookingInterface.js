import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfigContext } from '../context/ConfigContext';

// Importar sub-componentes
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

    const navigate = useNavigate();
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
        const message = `Hola *${config.appName || 'Barbería'}* 💈, acabo de agendar...`; // (Resumido para brevedad)
        const url = `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="container mt-3 mt-md-5" style={{ maxWidth: '800px' }}>
            
            {/* --- ENCABEZADO RESPONSIVO --- */}
            {/* En móvil: flex-column (uno abajo del otro). En PC: flex-md-row (al lado) */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                
                {/* TÍTULO: fs-3 (mediano en móvil), fs-md-1 (grande en PC) */}
                <h1 className="text-center m-0 fw-bold text-uppercase fs-3 fs-md-1" style={{ letterSpacing: '2px' }}>
                    {config.welcomeTitle || 'Reserva tu Cita'} 
                    <span className="text-primary ms-2">💈</span>
                </h1>
                
                {/* BOTÓN: w-100 (ancho total en móvil), w-auto (ancho auto en PC) */}
                <button 
                    className="btn btn-outline-dark rounded-pill px-4 bg-white shadow-sm w-100 w-md-auto font-monospace" 
                    onClick={() => navigate('/my-bookings')}
                    style={{ fontSize: '0.9rem' }}
                >
                    📅 MIS CITAS
                </button>
            </div>

            {/* --- CUERPO PRINCIPAL --- */}
            {isSuccess ? (
                // ... (El código de éxito se mantiene igual, solo ajusta el padding si quieres)
                <div className="card text-center p-4 p-md-5 shadow border-0 animate__animated animate__bounceIn bg-white bg-opacity-90">
                     {/* ... Contenido del éxito igual que antes ... */}
                     <div className="card-body">
                        <h2 className="card-title text-success fw-bold mb-3">¡Reserva Confirmada!</h2>
                        <button className="btn btn-outline-dark mt-3" onClick={handleReset}>Volver</button>
                     </div>
                </div>
            ) : (
                /* --- TARJETA DEL FORMULARIO --- */
                /* p-3 en móvil (menos borde), p-md-5 en escritorio (más aire) */
                <div className="card shadow-lg border-0 p-3 p-md-5 rounded-4 bg-white">
                    
                    {/* PASO 1 */}
                    {!selectedService && (
                        <div className="animate__animated animate__fadeIn">
                            {/* Títulos de pasos más pequeños y elegantes */}
                            <h5 className="text-center text-secondary mb-4 text-uppercase fw-bold ls-1" style={{ letterSpacing: '2px', fontSize: '0.9rem' }}>
                                1. Selecciona un Servicio
                            </h5>
                            <ServiceSelector onSelectService={setSelectedService} />
                        </div>
                    )}

                    {/* PASO 2 */}
                    {selectedService && !selectedBarber && (
                        <div className="animate__animated animate__fadeInRight">
                            <h5 className="text-center text-secondary mb-4 text-uppercase fw-bold" style={{ letterSpacing: '2px', fontSize: '0.9rem' }}>
                                2. Selecciona un Barbero
                            </h5>
                            <BarberSelector 
                                onSelectBarber={setSelectedBarber} 
                                onBack={() => setSelectedService(null)}
                            />
                        </div>
                    )}

                    {/* PASO 3 */}
                    {selectedService && selectedBarber && !selectedTime && (
                        <div className="animate__animated animate__fadeInRight">
                             <h5 className="text-center text-secondary mb-4 text-uppercase fw-bold" style={{ letterSpacing: '2px', fontSize: '0.9rem' }}>
                                3. Fecha y Hora
                            </h5>
                            
                            {/* Resumen Compacto */}
                            <div className="d-flex justify-content-center align-items-center gap-2 mb-4 p-2 bg-light rounded-3 border">
                                <small className="fw-bold">{selectedService.name}</small>
                                <span className="text-muted">/</span>
                                <small className="fw-bold text-primary">{selectedBarber.name}</small>
                                <button className="btn btn-sm text-danger py-0" onClick={() => setSelectedBarber(null)}>✕</button>
                            </div>

                            <DateTimeSelector
                                barberId={selectedBarber.id} 
                                serviceId={selectedService.id}
                                serviceDuration={selectedService.duration_minutes}
                                onSelectDateTime={(date, time) => {
                                    setSelectedDate(date);
                                    setSelectedTime(time);
                                }}
                            />
                        </div>
                    )}

                    {/* PASO 4 */}
                    {selectedService && selectedBarber && selectedTime && (
                        <div className="animate__animated animate__fadeInUp">
                            <h5 className="text-center text-secondary mb-4 text-uppercase fw-bold" style={{ letterSpacing: '2px', fontSize: '0.9rem' }}>
                                4. Confirma tus Datos
                            </h5>
                            <ReservationForm
                                service={selectedService}
                                barber={selectedBarber}
                                date={selectedDate}
                                time={selectedTime}
                                onSuccess={() => setIsSuccess(true)}
                                onBack={() => setSelectedTime(null)}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookingInterface;