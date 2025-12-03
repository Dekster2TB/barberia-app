import React, { useState, useEffect, useContext } from 'react';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { ConfigContext } from '../../context/ConfigContext';
import axios from 'axios';

const ConfigManager = () => {
    const { config, fetchConfig } = useContext(ConfigContext);
    
    const [formData, setFormData] = useState({
        appName: '',
        welcomeTitle: '',
        footerText: '',
        whatsappNumber: '',
        logoUrl: '',
        logoHeight: 75, // Estado para el tamaño
        backgroundImageUrl: ''
    });

    const [logoFile, setLogoFile] = useState(null);
    const [backgroundFile, setBackgroundFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (config) {
            setFormData({
                appName: config.appName || '',
                welcomeTitle: config.welcomeTitle || '',
                footerText: config.footerText || '',
                whatsappNumber: config.whatsappNumber || '',
                logoUrl: config.logoUrl || '',
                logoHeight: config.logoHeight || 75, // Cargar tamaño guardado
                backgroundImageUrl: config.backgroundImageUrl || ''
            });
        }
    }, [config]);

    const uploadImageToCloudinary = async (file) => {
        if (!file) return null;
        const data = new FormData();
        data.append("file", file);
        // REEMPLAZA CON TUS DATOS:
        data.append("upload_preset", "TU_UPLOAD_PRESET_AQUI"); 
        data.append("cloud_name", "TU_CLOUD_NAME_AQUI");

        try {
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${data.get('cloud_name')}/image/upload`,
                data
            );
            return res.data.secure_url;
        } catch (error) {
            console.error("Error subiendo imagen:", error);
            throw error;
        }
    };

    const handleRemoveImage = (type) => {
        if (type === 'logo') {
            setLogoFile(null);
            setFormData({ ...formData, logoUrl: null });
        } else if (type === 'background') {
            setBackgroundFile(null);
            setFormData({ ...formData, backgroundImageUrl: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading('Guardando configuración...');

        try {
            let newLogoUrl = formData.logoUrl;
            let newBackgroundUrl = formData.backgroundImageUrl;

            if (logoFile) newLogoUrl = await uploadImageToCloudinary(logoFile);
            if (backgroundFile) newBackgroundUrl = await uploadImageToCloudinary(backgroundFile);

            await api.put('/api/config', {
                ...formData,
                logoUrl: newLogoUrl,
                backgroundImageUrl: newBackgroundUrl
            });
            
            await fetchConfig(); 
            setLogoFile(null);
            setBackgroundFile(null);
            
            toast.dismiss(loadingToast);
            toast.success('¡Configuración actualizada!');
        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error('Error al guardar.');
        } finally {
            setLoading(false);
        }
    };

    // Helper visual
    const getPreview = (file, url) => {
        if (file) return URL.createObjectURL(file);
        if (url) return url;
        return null;
    };

    return (
        <div className="animate__animated animate__fadeIn mb-5">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-info text-white fw-bold">
                    ⚙️ Configuración General del Sitio
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        
                        <div className="row mb-4">
                            {/* --- COLUMNA LOGO (CON SLIDER DE TAMAÑO) --- */}
                            <div className="col-md-6 mb-3 mb-md-0">
                                <div className="border p-3 rounded bg-light text-center h-100">
                                    <label className="form-label fw-bold d-block mb-2">Logo (Navbar)</label>
                                    
                                    {/* Previsualización Dinámica */}
                                    <div className="mb-3 d-flex justify-content-center align-items-center" style={{ height: '160px', background: '#e9ecef', borderRadius: '8px', overflow: 'hidden' }}>
                                        {getPreview(logoFile, formData.logoUrl) ? (
                                            <img 
                                                src={getPreview(logoFile, formData.logoUrl)} 
                                                alt="Preview" 
                                                // JSX ACTUALIZADO: Usa el tamaño del estado
                                                style={{ height: `${formData.logoHeight}px`, objectFit: 'contain', transition: 'height 0.2s' }} 
                                            />
                                        ) : <span className="text-muted small">Sin Logo</span>}
                                    </div>

                                    {/* JSX ACTUALIZADO: Slider de control */}
                                    <div className="mb-3 px-2">
                                        <label className="form-label small text-muted fw-bold d-flex justify-content-between">
                                            <span>Tamaño: {formData.logoHeight}px</span>
                                            <span>(Min: 30 - Max: 150)</span>
                                        </label>
                                        <input 
                                            type="range" 
                                            className="form-range" 
                                            min="30" max="150" step="5"
                                            value={formData.logoHeight || 75} 
                                            onChange={(e) => setFormData({...formData, logoHeight: parseInt(e.target.value)})}
                                        />
                                    </div>

                                    <input type="file" className="form-control form-control-sm mb-2" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
                                    {(logoFile || formData.logoUrl) && (
                                        <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={() => handleRemoveImage('logo')}>Quitar Logo</button>
                                    )}
                                </div>
                            </div>

                            {/* --- COLUMNA FONDO --- */}
                            <div className="col-md-6">
                                <div className="border p-3 rounded bg-light text-center h-100">
                                    <label className="form-label fw-bold d-block mb-3">Imagen de Fondo</label>
                                    <div className="mb-3 d-flex justify-content-center align-items-center" 
                                         style={{ 
                                             height: '80px', 
                                             background: '#e9ecef', 
                                             borderRadius: '8px',
                                             backgroundImage: getPreview(backgroundFile, formData.backgroundImageUrl) ? `url(${getPreview(backgroundFile, formData.backgroundImageUrl)})` : 'none',
                                             backgroundSize: 'cover',
                                             backgroundPosition: 'center'
                                         }}>
                                        {!getPreview(backgroundFile, formData.backgroundImageUrl) && <span className="text-muted small">Sin Fondo</span>}
                                    </div>
                                    <input type="file" className="form-control form-control-sm mb-2" accept="image/*" onChange={(e) => setBackgroundFile(e.target.files[0])} />
                                    {(backgroundFile || formData.backgroundImageUrl) && (
                                        <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={() => handleRemoveImage('background')}>Quitar Fondo</button>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <hr className="my-4"/>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Nombre de la Marca</label>
                            <input className="form-control" value={formData.appName} onChange={e => setFormData({...formData, appName: e.target.value})} />
                        </div>

                        <div className="mb-3 p-3 bg-light border rounded">
                            <label className="form-label fw-bold text-primary">Título de Bienvenida</label>
                            <input className="form-control fw-bold" value={formData.welcomeTitle} onChange={e => setFormData({...formData, welcomeTitle: e.target.value})} />
                        </div>

                        <div className="row">
                             <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">WhatsApp</label>
                                <input className="form-control" value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Texto Pie de Página</label>
                                <input className="form-control" value={formData.footerText} onChange={e => setFormData({...formData, footerText: e.target.value})} />
                            </div>
                        </div>

                        <button className="btn btn-info text-white w-100 py-2 fw-bold shadow-sm mt-3" disabled={loading}>
                            {loading ? 'Guardando...' : 'GUARDAR TODA LA CONFIGURACIÓN'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConfigManager;