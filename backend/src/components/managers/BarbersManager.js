import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import toast from 'react-hot-toast';

const BarbersManager = () => {
    const [barbers, setBarbers] = useState([]);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const data = new FormData();
        data.append('name', formData.name);
        data.append('specialty', formData.specialty);
        data.append('bio', formData.bio);
        if (formData.image) {
            data.append('image', formData.image);
        }

        const loadingToast = toast.loading('Contratando barbero...');

        try {
            await api.post('/api/management/barbers', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.dismiss(loadingToast);
            toast.success('¡Barbero agregado al equipo!');
            setFormData({ name: '', specialty: '', bio: '', image: null });
            fetchBarbers();

        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Error al guardar.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm('¿Eliminar a este barbero? Sus citas futuras podrían verse afectadas.')) return;
        
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
            {/* FORMULARIO */}
            <div className="card shadow-sm mb-5 border-0">
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0">💈 Nuevo Barbero</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Nombre Completo</label>
                                <input 
                                    className="form-control" 
                                    placeholder="Ej: Juan Pérez" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Especialidad</label>
                                <input 
                                    className="form-control" 
                                    placeholder="Ej: Degradados y Diseños" 
                                    value={formData.specialty} 
                                    onChange={e => setFormData({...formData, specialty: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Biografía Corta</label>
                            <textarea 
                                className="form-control" 
                                rows="2"
                                placeholder="Experto con 5 años de experiencia..." 
                                value={formData.bio} 
                                onChange={e => setFormData({...formData, bio: e.target.value})} 
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Foto de Perfil (Opcional)</label>
                            <input 
                                type="file" 
                                className="form-control" 
                                accept="image/*"
                                onChange={e => setFormData({...formData, image: e.target.files[0]})} 
                            />
                        </div>

                        <button type="submit" className="btn btn-dark" disabled={loading}>
                            {loading ? 'Guardando...' : 'Agregar Barbero'}
                        </button>
                    </form>
                </div>
            </div>

            {/* LISTA DE EQUIPO */}
            <h4 className="mb-3 text-secondary">Nuestro Equipo</h4>
            <div className="row">
                {barbers.map(b => (
                    <div key={b.id} className="col-md-3 col-sm-6 mb-4">
                        <div className="card h-100 shadow-sm border-0 text-center">
                            <div className="card-body d-flex flex-column align-items-center">
                                {b.image_url ? (
                                    <img 
                                        src={b.image_url} 
                                        alt={b.name} 
                                        className="rounded-circle mb-3 shadow-sm" 
                                        style={{width: '100px', height: '100px', objectFit: 'cover'}} 
                                    />
                                ) : (
                                    <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{width: '100px', height: '100px', fontSize: '36px'}}>
                                        {b.name.charAt(0)}
                                    </div>
                                )}
                                
                                <h5 className="card-title fw-bold mb-1">{b.name}</h5>
                                <p className="text-primary small mb-2">{b.specialty}</p>
                                <p className="text-muted small flex-grow-1">{b.bio}</p>
                                
                                <button className="btn btn-outline-danger btn-sm mt-3 w-100" onClick={() => handleDelete(b.id)}>
                                    Despedir
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BarbersManager;