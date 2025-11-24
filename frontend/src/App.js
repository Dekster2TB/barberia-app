import React, { useState } from 'react';
import ServiceSelector from './components/ServiceSelector';
import DateTimeSelector from './components/DateTimeSelector';
import ReservationForm from './components/ReservationForm'; // <--- IMPORTAR

function App() {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false); // Estado para saber si ya reservó

  const handleReset = () => {
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setIsSuccess(false);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '800px' }}>
      <h1 className="text-center mb-5">💈 Barbería del Futuro 💈</h1>
      
      {/* PANTALLA DE ÉXITO FINAL */}
      {isSuccess ? (
          <div className="card text-center p-5 shadow animate__animated animate__bounceIn">
              <div className="card-body">
                  <h1 className="text-success display-1 mb-4">🎉</h1>
                  <h2 className="card-title text-success">¡Reserva Confirmada!</h2>
                  <p className="card-text lead mt-3">
                      Te esperamos el <strong>{selectedDate}</strong> a las <strong>{selectedTime}</strong> para tu <strong>{selectedService.name}</strong>.
                  </p>
                  <button className="btn btn-primary btn-lg mt-4" onClick={handleReset}>
                      Agendar otra hora
                  </button>
              </div>
          </div>
      ) : (
          /* FLUJO NORMAL DE RESERVA */
          <div className="card shadow p-4">
            
            {/* PASO 1: SERVICIO */}
            {!selectedService && (
              <ServiceSelector onSelectService={setSelectedService} />
            )}

            {/* PASO 2: FECHA Y HORA */}
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

            {/* PASO 3: FORMULARIO FINAL (Aquí conectamos el nuevo componente) */}
            {selectedService && selectedTime && (
                <ReservationForm 
                    service={selectedService}
                    date={selectedDate}
                    time={selectedTime}
                    onSuccess={() => setIsSuccess(true)} // ¡Éxito!
                    onBack={() => setSelectedTime(null)} // Volver a elegir hora
                />
            )}

          </div>
      )}
    </div>
  );
}

export default App;