import React, { useState, useEffect } from 'react';
import api from '../../config/api'; // Nota los dos puntos: sube 2 niveles
import toast from 'react-hot-toast';

const ServicesManager = () => {
    const [services, setServices] = useState([]);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const data = new FormData();
        data.append('name', formData.name);
        data.append('duration_minutes', formData.duration_minutes);
        data.append('price', formData.price);
        data.append('description', formData.description);
        if (formData.image) {
            data.append('image', formData.image);
        }

        const loadingToast = toast.loading('Guardando servicio...');

        try {
            await api.post('/api/management/services', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.dismiss(loadingToast);
            toast.success('¡Servicio creado!');
            setFormData({ name: '', duration_minutes: '', price: '', description: '', image: null });
            fetchServices();

        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm('¿Eliminar servicio?')) return;
        try {
            await api.delete(`/api/management/services/${id}`);
            toast.success('Servicio eliminado');
            fetchServices();
        } catch(error) {
            toast.error('No se pudo eliminar');
        }
    };

    return (
        <div className="animate__animated animate__fadeIn">
            <div className="card shadow-sm mb-5 border-0">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">✨ Nuevo Servicio</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <input className="form-control" placeholder="Nombre" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div className="col-md-3 mb-3">
                                <input type="number" className="form-control" placeholder="Precio" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                            </div>
                            <div className="col-md-3 mb-3">
                                <input type="number" className="form-control" placeholder="Min" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: e.target.value})} required />
                            </div>
                        </div>
                        <div className="mb-3">
                            <textarea className="form-control" placeholder="Descripción" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                        </div>
                        <div className="mb-3">
                            <input type="file" className="form-control" accept="image/*" onChange={e => setFormData({...formData, image: e.target.files[0]})} />
                        </div>
                        <button type="submit" className="btn btn-success" disabled={loading}>Guardar</button>
                    </form>
                </div>
            </div>

            <div className="row">
                {services.map(s => (
                    <div key={s.id} className="col-md-4 mb-3">
                        <div className="card h-100 shadow-sm">
                            {s.image_url && <img src={s.image_url} className="card-img-top" alt={s.name} style={{height: '150px', objectFit: 'cover'}} />}
                            <div className="card-body">
                                <h5>{s.name}</h5>
                                <p className="text-muted">${s.price} - {s.duration_minutes}min</p>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id)}>Eliminar</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServicesManager;