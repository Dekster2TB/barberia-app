import React, { useState, useEffect } from 'react';
import api from '../config/api';

const DateTimeSelector = ({ onSelectDateTime }) => {
    const [date, setDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);

    // Cuando el usuario cambia la fecha, pedimos disponibilidad
    useEffect(() => {
        if (date) {
            setLoading(true);
            // Petición al endpoint inteligente que creamos antes
            api.get(`/api/bookings/available?date=${date}`)
                .then(res => {
                    setSlots(res.data); // Guardamos las horas ["10:00", "10:30"...]
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error cargando horas:", err);
                    setLoading(false);
                });
        }
    }, [date]); // Este efecto se dispara cada vez que cambia "date"

    return (
        <div className="text-center animate__animated animate__fadeIn">
            <h3 className="mb-4">2. ¿Cuándo te atendemos?</h3>

            {/* Selector de Fecha Nativo */}
            <div className="form-group mb-4">
                <label className="mr-2">Selecciona una fecha:</label>
                <input 
                    type="date" 
                    className="form-control d-inline-block w-auto"
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
                />
            </div>

            {/* Grilla de Horarios */}
            {date && (
                <div>
                    {loading ? (
                        <div className="spinner-border text-primary" role="status"></div>
                    ) : (
                        <div className="d-flex flex-wrap justify-content-center gap-2">
                            {slots.length > 0 ? (
                                slots.map(time => (
                                    <button
                                        key={time}
                                        className="btn btn-outline-success m-1"
                                        style={{ minWidth: '80px' }}
                                        onClick={() => onSelectDateTime(date, time)}
                                    >
                                        {time}
                                    </button>
                                ))
                            ) : (
                                <div className="alert alert-warning">
                                    No hay horas disponibles para este día. 😔
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