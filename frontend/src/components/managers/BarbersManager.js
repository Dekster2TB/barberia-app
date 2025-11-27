import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import toast from 'react-hot-toast';

const BarbersManager = () => {
    const [barbers, setBarbers] = useState([]);
    // Estado para controlar si estamos editando a alguien
    const [editingId, setEditingId] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        specialty: '',
        bio: '',
        image: null
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBarbers();
    }, []);

    const fetchBarbers = async () => {
        try {
            const res = await api.get('/api/barbers');
            setBarbers(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando barberos');
        }
    };

    // --- CARGAR DATOS PARA EDITAR ---
    const handleEditClick = (barber) => {
        setEditingId(barber.id);
        setFormData({
            name: barber.name,
            specialty: barber.specialty,
            bio: barber.bio || '',
            image: null // La imagen no se precarga, solo se sube una nueva si se desea
        });
        // Scroll suave hacia arriba para ver el formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- CANCELAR EDICIÓN ---
    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', specialty: '', bio: '', image: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validación
        if (!formData.name) {
            toast.error('El nombre es obligatorio.');
            return;
        }

        setLoading(true);
        
        const data = new FormData();
        data.append('name', formData.name);
        data.append('specialty', formData.specialty);
        data.append('bio', formData.bio);
        
        // Solo enviamos imagen si el usuario seleccionó una nueva
        if (formData.image) {
            data.append('image', formData.image);
        }

        const loadingToast = toast.loading(editingId ? 'Actualizando...' : 'Contratando...');

        try {
            if (editingId) {
                // PUT: Editar Barbero existente
                // Asegúrate de que la ruta PUT /api/management/barbers/:id exista en tu backend
                await api.put(`/api/management/barbers/${editingId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('¡Barbero actualizado!');
            } else {
                // POST: Crear Nuevo
                await api.post('/api/management/barbers', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('¡Barbero agregado!');
            }
            
            toast.dismiss(loadingToast);
            handleCancelEdit(); // Limpiar y salir de edición
            fetchBarbers();     // Recargar la lista

        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            const msg = error.response?.data?.error || 'Error al guardar.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm('¿Estás seguro de eliminar a este barbero?')) return;
        try {
            await api.delete(`/api/management/barbers/${id}`);
            toast.success('Barbero eliminado');
            fetchBarbers();
        } catch(error) {
            toast.error('No se pudo eliminar');
        }
    };

    return (
        <div className="animate__animated animate__fadeIn">
            {/* FORMULARIO DE CREACIÓN / EDICIÓN */}
            <div className={`card shadow-sm mb-5 border-0 ${editingId ? 'border-warning border-2' : ''}`}>
                <div className={`card-header text-white ${editingId ? 'bg-warning' : 'bg-dark'}`}>
                    <h5 className="mb-0">
                        {editingId ? `✏️ Editando a: ${formData.name}` : '💈 Contratar Nuevo Barbero'}
                    </h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Nombre Completo *</label>
                                <input 
                                    className="form-control" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Especialidad</label>
                                <input 
                                    className="form-control" 
                                    value={formData.specialty} 
                                    onChange={e => setFormData({...formData, specialty: e.target.value})} 
                                    placeholder="Ej: Degradados y Diseños"
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Biografía Corta</label>
                            <textarea 
                                className="form-control" 
                                rows="2" 
                                value={formData.bio} 
                                onChange={e => setFormData({...formData, bio: e.target.value})} 
                                placeholder="Experto con 5 años de experiencia..."
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                {editingId ? 'Cambiar Foto' : 'Foto de Perfil'} <span className="text-muted fw-light">(Opcional)</span>
                            </label>
                            <input 
                                type="file" 
                                className="form-control" 
                                accept="image/*" 
                                onChange={e => setFormData({...formData, image: e.target.files[0]})} 
                            />
                        </div>

                        <div className="d-flex gap-2">
                            <button type="submit" className={`btn ${editingId ? 'btn-warning' : 'btn-dark'}`} disabled={loading}>
                                {loading ? 'Procesando...' : (editingId ? 'Actualizar Barbero' : 'Agregar al Equipo')}
                            </button>
                            
                            {editingId && (
                                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* LISTA DEL EQUIPO */}
            <h4 className="mb-3 text-secondary">Equipo Actual</h4>
            <div className="row">
                {barbers.map(b => (
                    <div key={b.id} className="col-md-3 col-sm-6 mb-4">
                        <div className={`card h-100 shadow-sm border-0 text-center p-3 ${editingId === b.id ? 'border-warning shadow' : ''}`}>
                            <div className="d-flex justify-content-center mb-3">
                                {b.image_url ? (
                                    <img 
                                        src={b.image_url} 
                                        alt={b.name} 
                                        className="rounded-circle shadow-sm" 
                                        style={{width: '100px', height: '100px', objectFit: 'cover'}} 
                                    />
                                ) : (
                                    <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center shadow-sm" style={{width: '100px', height: '100px', fontSize: '36px'}}>
                                        {b.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            
                            <h5 className="fw-bold mb-1">{b.name}</h5>
                            <p className="text-primary small mb-2 fw-bold">{b.specialty}</p>
                            <p className="text-muted small flex-grow-1">{b.bio || 'Sin biografía'}</p>
                            
                            {/* BOTONES DE ACCIÓN */}
                            <div className="mt-3 d-flex gap-2 justify-content-center">
                                <button 
                                    className="btn btn-sm btn-outline-warning w-50" 
                                    onClick={() => handleEditClick(b)}
                                    disabled={loading}
                                >
                                    <i className="bi bi-pencil"></i> Editar
                                </button>
                                <button 
                                    className="btn btn-sm btn-outline-danger w-50" 
                                    onClick={() => handleDelete(b.id)}
                                    disabled={loading}
                                >
                                    <i className="bi bi-trash"></i> Despedir
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {barbers.length === 0 && (
                    <div className="col-12 text-center py-5 text-muted">
                        No hay barberos en el equipo aún.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BarbersManager;