import React, { useState, useEffect } from 'react';
import api from '../config/api'; 
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; // Estilos del calendario
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Español para el calendario
import toast from 'react-hot-toast';

// Registramos el idioma español
registerLocale('es', es);

const DateTimeSelector = ({ onSelectDateTime }) => {
    const [startDate, setStartDate] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (startDate) {
            setLoading(true);
            setSlots([]); // Limpiar horas anteriores
            
            // Formato para la API: YYYY-MM-DD
            const dateString = format(startDate, 'yyyy-MM-dd');

            api.get(`/api/bookings/available?date=${dateString}`)
                .then(res => {
                    setSlots(res.data);
                    setLoading(false);
                    if(res.data.length === 0) {
                        toast('No hay horas disponibles para este día.', { icon: '📅' });
                    }
                })
                .catch(err => {
                    console.error("Error:", err);
                    toast.error('Error al cargar disponibilidad.');
                    setLoading(false);
                });
        }
    }, [startDate]);

    return (
        <div className="text-center animate__animated animate__fadeIn">
            <h3 className="mb-4">2. ¿Cuándo te atendemos?</h3>

            <div className="d-flex justify-content-center mb-4">
                {/* Contenedor del Calendario */}
                <div className="p-3 bg-white rounded shadow-sm border">
                    <p className="text-muted small mb-2">Selecciona un día en el calendario:</p>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        minDate={new Date()} // No permitir pasado
                        inline // Mostrar abierto siempre
                        locale="es" // Idioma español
                        dateFormat="yyyy-MM-dd"
                    />
                </div>
            </div>

            {/* Lista de Horas */}
            {startDate && (
                <div>
                    <h5 className="text-primary mb-3">
                        Horarios para el {format(startDate, "dd 'de' MMMM", { locale: es })}:
                    </h5>
                    
                    {loading ? (
                        <div className="spinner-border text-secondary" role="status"></div>
                    ) : (
                        <div className="d-flex flex-wrap justify-content-center gap-2">
                            {slots.length > 0 ? (
                                slots.map(time => (
                                    <button
                                        key={time}
                                        className="btn btn-outline-primary px-4 py-2 fw-bold"
                                        onClick={() => onSelectDateTime(format(startDate, 'yyyy-MM-dd'), time)}
                                    >
                                        {time}
                                    </button>
                                ))
                            ) : (
                                <div className="alert alert-warning">
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