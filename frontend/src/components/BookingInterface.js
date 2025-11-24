import React, { useState } from 'react';
import ServiceSelector from './ServiceSelector';
import DateTimeSelector from './DateTimeSelector';
import ReservationForm from './ReservationForm';

const BookingInterface = () => {
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleReset = () => {
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setIsSuccess(false);
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '800px' }}>
            <h1 className="text-center mb-5">💈 Barbería del Futuro 💈</h1>

            {isSuccess ? (
                <div className="card text-center p-5 shadow animate__animated animate__bounceIn">
                    <div className="card-body">
                        <h1 className="text-success display-1 mb-4">🎉</h1>
                        <h2 className="card-title text-success">¡Reserva Confirmada!</h2>
                        <p className="card-text lead mt-3">
                            Te esperamos el <strong>{selectedDate}</strong> a las <strong>{selectedTime}</strong>.
                        </p>
                        <button className="btn btn-primary btn-lg mt-4" onClick={handleReset}>
                            Agendar otra hora
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card shadow p-4">
                    {!selectedService && (
                        <ServiceSelector onSelectService={setSelectedService} />
                    )}

                    {selectedService && !selectedTime && (
                        <div>
                            <button className="btn btn-sm btn-link mb-3" onClick={handleReset}>← Volver</button>
                            <h4 className="text-center text-primary mb-3">Servicio: {selectedService.name}</h4>
                            <DateTimeSelector
                                onSelectDateTime={(date, time) => {
                                    setSelectedDate(date);
                                    setSelectedTime(time);
                                }}
                            />
                        </div>
                    )}

                    {selectedService && selectedTime && (
                        <ReservationForm
                            service={selectedService}
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