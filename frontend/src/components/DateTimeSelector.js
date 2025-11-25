import React, { useState, useEffect } from 'react';
import api from '../config/api';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; // Importar estilos del calendario
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importar idioma español para las fechas
import toast from 'react-hot-toast'; // Notificaciones visuales

// Registrar el idioma español en react-datepicker
registerLocale('es', es);

/**
 * Componente DateTimeSelector
 * Permite al usuario seleccionar una fecha del calendario y luego una hora disponible.
 * * Props:
 * - onSelectDateTime: Función callback (fecha, hora) cuando el usuario elige un horario.
 * - barberId: ID del barbero seleccionado para filtrar su disponibilidad específica.
 */
const DateTimeSelector = ({ onSelectDateTime, barberId }) => {
    const [startDate, setStartDate] = useState(null); // Fecha seleccionada en el calendario
    const [slots, setSlots] = useState([]); // Lista de horas disponibles desde la API
    const [loading, setLoading] = useState(false); // Estado de carga

    // Efecto: Se dispara cada vez que cambia la fecha (startDate)
    useEffect(() => {
        if (startDate) {
            setLoading(true);
            setSlots([]); // Limpiar los horarios anteriores para evitar confusión visual
            
            // Formateamos la fecha para enviarla al backend: "YYYY-MM-DD"
            const dateString = format(startDate, 'yyyy-MM-dd');

            // Llamada a la API para obtener disponibilidad
            // IMPORTANTE: Enviamos tanto la fecha como el ID del barbero
            api.get(`/api/bookings/available?date=${dateString}&barber_id=${barberId}`)
                .then(res => {
                    setSlots(res.data);
                    setLoading(false);
                    
                    // Feedback visual si el día está lleno
                    if(res.data.length === 0) {
                        toast('No hay horas disponibles para este día.', { 
                            icon: '📅',
                            style: {
                                borderRadius: '10px',
                                background: '#333',
                                color: '#fff',
                            },
                        });
                    }
                })
                .catch(err => {
                    console.error("Error cargando disponibilidad:", err);
                    toast.error('Error al cargar los horarios. Intenta de nuevo.');
                    setLoading(false);
                });
        }
    }, [startDate, barberId]); // Se ejecuta si cambia la fecha o el barbero

    return (
        <div className="text-center animate__animated animate__fadeIn">
            <h3 className="mb-4">3. ¿Cuándo te atendemos?</h3>

            {/* SECCIÓN 1: CALENDARIO */}
            <div className="d-flex justify-content-center mb-4">
                <div className="p-3 bg-white rounded shadow-sm border" style={{display: 'inline-block'}}>
                    <p className="text-muted small mb-2 text-start">Selecciona un día:</p>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        minDate={new Date()} // No permitir seleccionar fechas pasadas
                        inline // Mostrar el calendario desplegado permanentemente
                        locale="es" // Idioma español
                        dateFormat="yyyy-MM-dd"
                        calendarClassName="border-0" // Clase CSS extra para quitar bordes internos
                    />
                </div>
            </div>

            {/* SECCIÓN 2: LISTA DE HORARIOS */}
            {/* Solo mostramos esta sección si el usuario ya eligió una fecha */}
            {startDate && (
                <div className="mt-4 animate__animated animate__fadeInUp">
                    <h5 className="text-primary mb-3">
                        Horarios disponibles para el {format(startDate, "dd 'de' MMMM", { locale: es })}:
                    </h5>
                    
                    {loading ? (
                        // Spinner de carga mientras esperamos al backend
                        <div className="py-4">
                            <div className="spinner-border text-secondary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="text-muted small mt-2">Consultando agenda...</p>
                        </div>
                    ) : (
                        // Grilla de botones con las horas
                        <div className="d-flex flex-wrap justify-content-center gap-2">
                            {slots.length > 0 ? (
                                slots.map(time => (
                                    <button
                                        key={time}
                                        className="btn btn-outline-primary px-4 py-2 fw-bold shadow-sm"
                                        style={{minWidth: '90px'}}
                                        onClick={() => onSelectDateTime(format(startDate, 'yyyy-MM-dd'), time)}
                                    >
                                        {time}
                                    </button>
                                ))
                            ) : (
                                // Mensaje amigable si no hay cupos
                                <div className="alert alert-warning w-75 mx-auto shadow-sm">
                                    <strong>Agenda completa.</strong> <br/>
                                    Por favor selecciona otro día u otro barbero. 😔
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