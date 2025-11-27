import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import toast from 'react-hot-toast';

const ServicesManager = () => {
    const [services, setServices] = useState([]);
    const [editingId, setEditingId] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        duration_minutes: '',
        price: '',
        description: '',
        image: null
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await api.get('/api/services');
            setServices(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando servicios');
        }
    };

    const formatCLP = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(value);
    };

    const handleEditClick = (service) => {
        setEditingId(service.id);
        setFormData({
            name: service.name,
            duration_minutes: service.duration_minutes,
            price: Math.round(service.price), 
            description: service.description || '',
            image: null 
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', duration_minutes: '', price: '', description: '', image: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.price || !formData.duration_minutes) {
            toast.error('Nombre, Precio y Duración son obligatorios.');
            return;
        }

        setLoading(true);
        
        const data = new FormData();
        data.append('name', formData.name);
        data.append('duration_minutes', formData.duration_minutes);
        data.append('price', formData.price);
        data.append('description', formData.description);
        if (formData.image) {
            data.append('image', formData.image);
        }

        const loadingToast = toast.loading(editingId ? 'Actualizando...' : 'Guardando...');

        try {
            if (editingId) {
                await api.put(`/api/management/services/${editingId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('¡Servicio actualizado!');
            } else {
                await api.post('/api/management/services', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('¡Servicio creado!');
            }
            
            toast.dismiss(loadingToast);
            handleCancelEdit(); 
            fetchServices();

        } catch (error) {
            console.error('Error en submit:', error);
            toast.dismiss(loadingToast);
            const errorMsg = error.response?.data?.error || 'Error al guardar. Verifica la consola.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm('¿Estás seguro de eliminar este servicio?')) return;
        try {
            await api.delete(`/api/management/services/${id}`);
            toast.success('Eliminado');
            fetchServices();
        } catch(error) {
            toast.error('No se pudo eliminar');
        }
    };

    return (
        <div className="animate__animated animate__fadeIn">
            <div className={`card shadow-sm mb-5 border-0 ${editingId ? 'border-warning border-2' : ''}`}>
                <div className={`card-header text-white ${editingId ? 'bg-warning' : 'bg-primary'}`}>
                    <h5 className="mb-0">
                        {editingId ? `✏️ Editando: ${formData.name}` : '✨ Nuevo Servicio'}
                    </h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Nombre del Servicio *</label>
                                <input 
                                    className="form-control" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                    placeholder="Ej: Corte Clásico"
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <label className="form-label fw-bold">Precio (CLP) *</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    value={formData.price} 
                                    onChange={e => setFormData({...formData, price: e.target.value})} 
                                    required 
                                    placeholder="10000"
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <label className="form-label fw-bold">Duración (min) *</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    value={formData.duration_minutes} 
                                    onChange={e => setFormData({...formData, duration_minutes: e.target.value})} 
                                    required 
                                    placeholder="30"
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Descripción <span className="text-muted fw-light">(Opcional)</span></label>
                            <textarea 
                                className="form-control" 
                                rows="2" 
                                value={formData.description} 
                                onChange={e => setFormData({...formData, description: e.target.value})} 
                                placeholder="Detalles del servicio..."
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                {editingId ? 'Cambiar Imagen' : 'Imagen Referencial'} <span className="text-muted fw-light">(Opcional)</span>
                            </label>
                            <input 
                                type="file" 
                                className="form-control" 
                                accept="image/*" 
                                onChange={e => setFormData({...formData, image: e.target.files[0]})} 
                            />
                        </div>

                        <div className="d-flex gap-2">
                            <button type="submit" className={`btn ${editingId ? 'btn-warning' : 'btn-success'}`} disabled={loading}>
                                {loading ? 'Procesando...' : (editingId ? 'Actualizar Servicio' : 'Guardar Servicio')}
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

            <h4 className="mb-3 text-secondary">Servicios Activos</h4>
            <div className="row">
                {services.map(s => (
                    <div key={s.id} className="col-md-4 mb-4">
                        <div className={`card h-100 shadow-sm border-0 service-card ${editingId === s.id ? 'border-warning shadow' : ''}`}>
                            {s.image_url ? (
                                <img src={s.image_url} className="card-img-top" alt={s.name} style={{height: '150px', objectFit: 'cover'}} />
                            ) : (
                                <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{height: '150px'}}>
                                    <span className="text-muted">Sin imagen</span>
                                </div>
                            )}
                            
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <h5 className="fw-bold">{s.name}</h5>
                                    <span className="badge bg-success" style={{fontSize: '1rem'}}>
                                        {formatCLP(s.price)}
                                    </span>
                                </div>
                                <p className="text-muted small mb-2">
                                    ⏱ {s.duration_minutes} min <br/>
                                </p>
                                <p className="small text-secondary mb-0">
                                    {s.description || <em>Sin descripción</em>}
                                </p>
                            </div>
                            
                            <div className="card-footer bg-white border-0 d-flex justify-content-end gap-2">
                                <button 
                                    className="btn btn-sm btn-outline-warning" 
                                    onClick={() => handleEditClick(s)}
                                    disabled={loading}
                                >
                                    Editar
                                </button>
                                <button 
                                    className="btn btn-sm btn-outline-danger" 
                                    onClick={() => handleDelete(s.id)}
                                    disabled={loading}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServicesManager;