import React, { useState, useEffect } from 'react';
import api from '../config/api';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

// Registrar idioma español para el calendario
registerLocale('es', es);

const DateTimeSelector = ({ onSelectDateTime, barberId, serviceId, serviceDuration }) => {
    const [startDate, setStartDate] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (startDate) {
            setLoading(true);
            setSlots([]); 
            
            // Formato YYYY-MM-DD para la API
            const dateString = format(startDate, 'yyyy-MM-dd');

            api.get(`/api/bookings/available?date=${dateString}&barber_id=${barberId}&service_id=${serviceId}`)
                .then(res => {
                    let availableSlots = res.data;

                    // --- INTELIGENCIA DE DURACIÓN ---
                    // Si el servicio dura 60 min o más, mostramos solo horas en punto (10:00, 11:00)
                    // para que la grilla se vea más ordenada.
                    if (serviceDuration && serviceDuration >= 60) {
                         availableSlots = availableSlots.filter(time => time.endsWith(':00'));
                    }

                    setSlots(availableSlots);
                    setLoading(false);
                    
                    if(availableSlots.length === 0) {
                        toast('Agenda completa para este día.', { icon: '📅' });
                    }
                })
                .catch(err => {
                    console.error("Error:", err);
                    toast.error('Error al cargar horarios.');
                    setLoading(false);
                });
        }
    }, [startDate, barberId, serviceId, serviceDuration]);

    // --- INTELIGENCIA DE TIEMPO REAL ---
    // Bloquea las horas que ya pasaron hoy
    const isTimePast = (timeString) => {
        if (!startDate) return false;
        const now = new Date();
        
        // Si no es hoy, no bloqueamos nada
        if (!isSameDay(startDate, now)) return false; 

        const [slotHour, slotMinute] = timeString.split(':').map(Number);
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Si la hora del bloque es menor a la actual, es pasado
        if (slotHour < currentHour) return true;
        // Si es la misma hora pero minutos pasados, también
        if (slotHour === currentHour && slotMinute < currentMinute) return true;
        
        return false;
    };

    return (
        <div className="text-center animate__animated animate__fadeIn">
            <h3 className="mb-4">3. Selecciona Fecha y Hora</h3>

            <div className="d-flex justify-content-center mb-4">
                <div className="p-3 bg-white rounded shadow-sm border" style={{display: 'inline-block'}}>
                    <p className="text-muted small mb-2 text-start">Elige un día:</p>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        minDate={new Date()} 
                        inline 
                        locale="es"
                        dateFormat="yyyy-MM-dd"
                        calendarClassName="border-0"
                    />
                </div>
            </div>

            {startDate && (
                <div className="animate__animated animate__fadeInUp">
                    <h5 className="text-primary mb-3">
                        Horarios disponibles {serviceDuration ? `(${serviceDuration} min)` : ''}:
                    </h5>
                    
                    {loading ? (
                        <div className="py-3">
                            <div className="spinner-border text-secondary" role="status"></div>
                            <p className="text-muted small mt-2">Buscando espacios...</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-wrap justify-content-center gap-2">
                            {slots.length > 0 ? (
                                slots.map(time => {
                                    // Calculamos si el botón debe estar bloqueado (gris)
                                    const disabled = isTimePast(time);
                                    
                                    return (
                                        <button
                                            key={time}
                                            className={`btn px-4 py-2 fw-bold shadow-sm ${
                                                disabled 
                                                ? 'btn-secondary opacity-50' 
                                                : 'btn-outline-primary'
                                            }`}
                                            style={{ minWidth: '90px', cursor: disabled ? 'not-allowed' : 'pointer' }}
                                            onClick={() => !disabled && onSelectDateTime(format(startDate, 'yyyy-MM-dd'), time)}
                                            disabled={disabled}
                                        >
                                            {time}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="alert alert-warning w-75 mx-auto">
                                    Lo sentimos, no hay cupos disponibles hoy. 😔
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DateTimeSelector;