import React, { useState } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MyBookings = () => {
    const [phone, setPhone] = useState('');
    const [bookings, setBookings] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (phone.length < 8) {
            toast.error('Ingresa un número válido (mínimo 8 dígitos)');
            return;
        }
        setLoading(true);
        try {
            const res = await api.get(`/api/bookings/my-bookings?phone=${phone}`);
            setBookings(res.data);
            if (res.data.length === 0) toast('No encontramos reservas con ese número.', { icon: '🔍' });
        } catch (err) {
            console.error(err);
            toast.error('Error al buscar reservas.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('¿Seguro que quieres cancelar esta cita? Esta acción es irreversible.')) return;
        
        try {
            await api.patch(`/api/bookings/cancel/${id}`);
            toast.success('Cita cancelada correctamente.');
            // Recargar la lista
            const res = await api.get(`/api/bookings/my-bookings?phone=${phone}`);
            setBookings(res.data);
        } catch (err) {
            toast.error('No se pudo cancelar la cita.');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-success';
            case 'cancelled': return 'bg-danger';
            case 'completed': return 'bg-primary';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '600px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Mis Reservas 📅</h2>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/')}>
                    🏠 Volver
                </button>
            </div>

            {/* Buscador */}
            <div className="card shadow-sm p-4 mb-4 border-0">
                <form onSubmit={handleSearch}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Ingresa tu número de teléfono</label>
                        <input 
                            type="tel" 
                            className="form-control form-control-lg"
                            placeholder="Ej: 912345678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                        <div className="form-text">Te mostraremos todas las citas asociadas a este número.</div>
                    </div>
                    <button className="btn btn-dark w-100 py-2" disabled={loading}>
                        {loading ? 'Buscando...' : '🔍 Buscar mis Citas'}
                    </button>
                </form>
            </div>

            {/* Resultados */}
            {bookings && (
                <div className="animate__animated animate__fadeIn">
                    {bookings.length > 0 ? (
                        bookings.map(b => (
                            <div key={b.id} className="card mb-3 shadow-sm border-0">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h5 className="card-title fw-bold text-primary">{b.Service ? b.Service.name : 'Servicio'}</h5>
                                            <p className="mb-1">📅 {b.date} a las ⏰ {b.start_time.slice(0,5)}</p>
                                            <p className="text-muted small mb-2">Barbero: {b.Barber ? b.Barber.name : 'Asignado'}</p>
                                            <span className={`badge ${getStatusBadge(b.status)}`}>
                                                {b.status.toUpperCase()}
                                            </span>
                                        </div>
                                        {b.status === 'confirmed' && (
                                            <button 
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleCancel(b.id)}
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-4 text-muted bg-light rounded">
                            No tienes reservas registradas con este número.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyBookings;