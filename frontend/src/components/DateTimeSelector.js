import React, { useState, useEffect } from 'react';
import api from '../config/api';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, isSameDay } from 'date-fns'; // <--- Importamos isSameDay
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

registerLocale('es', es);

const DateTimeSelector = ({ onSelectDateTime, barberId }) => {
    const [startDate, setStartDate] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (startDate) {
            setLoading(true);
            setSlots([]); 
            
            const dateString = format(startDate, 'yyyy-MM-dd');

            api.get(`/api/bookings/available?date=${dateString}&barber_id=${barberId}`)
                .then(res => {
                    setSlots(res.data);
                    setLoading(false);
                    
                    if(res.data.length === 0) {
                        toast('No hay horas disponibles para este día.', { icon: '📅' });
                    }
                })
                .catch(err => {
                    console.error("Error cargando disponibilidad:", err);
                    toast.error('Error al cargar los horarios.');
                    setLoading(false);
                });
        }
    }, [startDate, barberId]);

    // --- LÓGICA INTELIGENTE DE TIEMPO ---
    const isTimePast = (timeString) => {
        // 1. Si no hemos seleccionado fecha, no es pasado
        if (!startDate) return false;

        const now = new Date();

        // 2. Si la fecha seleccionada es FUTURA (mañana, el mes que viene), ninguna hora ha pasado.
        if (!isSameDay(startDate, now)) {
            return false; 
        }

        // 3. Si es HOY, comparamos las horas.
        // Convertimos "10:30" a números: horas=10, minutos=30
        const [slotHour, slotMinute] = timeString.split(':').map(Number);
        
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // 4. Comparación matemática simple
        if (slotHour < currentHour) return true; // Ya pasó la hora (ej: son las 12, slot es 10)
        if (slotHour === currentHour && slotMinute < currentMinute) return true; // Misma hora, pero minutos pasados

        return false; // Todavía no pasa
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
                        Horarios para el {format(startDate, "dd 'de' MMMM", { locale: es })}:
                    </h5>
                    
                    {loading ? (
                        <div className="py-3">
                            <div className="spinner-border text-secondary" role="status"></div>
                            <p className="text-muted small mt-2">Consultando agenda...</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-wrap justify-content-center gap-2">
                            {slots.length > 0 ? (
                                slots.map(time => {
                                    // Calculamos si el botón debe estar deshabilitado
                                    const disabled = isTimePast(time);

                                    return (
                                        <button
                                            key={time}
                                            className={`btn px-4 py-2 fw-bold shadow-sm ${
                                                disabled 
                                                ? 'btn-secondary opacity-50' // Estilo Gris (Pasado)
                                                : 'btn-outline-primary'      // Estilo Azul (Disponible)
                                            }`}
                                            style={{ minWidth: '90px', cursor: disabled ? 'not-allowed' : 'pointer' }}
                                            // Si está deshabilitado, el onClick no hace nada
                                            onClick={() => !disabled && onSelectDateTime(format(startDate, 'yyyy-MM-dd'), time)}
                                            disabled={disabled} // Atributo HTML para accesibilidad
                                        >
                                            {time}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="alert alert-warning w-75 mx-auto">
                                    Lo sentimos, agenda llena para este día. 😔
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