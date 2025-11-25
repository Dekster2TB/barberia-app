import React, { useState } from 'react';
import ServiceSelector from './ServiceSelector';
import BarberSelector from './BarberSelector'; // <--- IMPORTAR
import DateTimeSelector from './DateTimeSelector';
import ReservationForm from './ReservationForm';

const BookingInterface = () => {
    // Estados del flujo
    const [selectedService, setSelectedService] = useState(null);
    const [selectedBarber, setSelectedBarber] = useState(null); // <--- NUEVO ESTADO
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleReset = () => {
        setSelectedService(null);
        setSelectedBarber(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setIsSuccess(false);
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '800px' }}>
            <h1 className="text-center mb-5 fw-bold">💈 Barbería del Futuro 💈</h1>

            {isSuccess ? (
                <div className="card text-center p-5 shadow border-0 animate__animated animate__bounceIn">
                    <div className="card-body">
                        <h1 className="text-success display-1 mb-4">🎉</h1>
                        <h2 className="card-title text-success">¡Reserva Confirmada!</h2>
                        <p className="card-text lead mt-3">
                            Te atiende <strong>{selectedBarber?.name}</strong> el <strong>{selectedDate}</strong> a las <strong>{selectedTime}</strong>.
                        </p>
                        <button className="btn btn-dark btn-lg mt-4" onClick={handleReset}>
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card shadow-lg border-0 p-4">
                    
                    {/* PASO 1: SERVICIO */}
                    {!selectedService && (
                        <ServiceSelector onSelectService={setSelectedService} />
                    )}

                    {/* PASO 2: BARBERO (Nuevo) */}
                    {selectedService && !selectedBarber && (
                        <BarberSelector 
                            onSelectBarber={setSelectedBarber} 
                            onBack={() => setSelectedService(null)}
                        />
                    )}

                    {/* PASO 3: FECHA Y HORA */}
                    {selectedService && selectedBarber && !selectedTime && (
                        <>
                            <div className="text-center mb-3">
                                <span className="badge bg-info text-dark me-2">{selectedService.name}</span>
                                <span className="badge bg-warning text-dark">Con: {selectedBarber.name}</span>
                                <button className="btn btn-link btn-sm p-0 ms-2" onClick={() => setSelectedBarber(null)}>Cambiar</button>
                            </div>
                            <DateTimeSelector
                                // Pasamos el ID del barbero para filtrar disponibilidad
                                barberId={selectedBarber.id} 
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
                            barber={selectedBarber} // Pasamos el barbero al formulario
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