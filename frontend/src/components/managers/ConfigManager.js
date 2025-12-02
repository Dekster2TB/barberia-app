import React, { useState, useEffect, useContext } from 'react';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { ConfigContext } from '../../context/ConfigContext';
import axios from 'axios';

const ConfigManager = () => {
    const { config, fetchConfig } = useContext(ConfigContext);
    
    // Estado del formulario incluyendo el nuevo campo welcomeTitle
    const [formData, setFormData] = useState({
        appName: '',
        welcomeTitle: '', // <--- NUEVO CAMPO
        footerText: '',
        whatsappNumber: '',
        logoUrl: '',
        backgroundImageUrl: ''
    });

    // Estados para los archivos seleccionados (Imágenes)
    const [logoFile, setLogoFile] = useState(null);
    const [backgroundFile, setBackgroundFile] = useState(null);
    
    const [loading, setLoading] = useState(false);

    // Cargar datos iniciales desde el contexto
    useEffect(() => {
        if (config) {
            setFormData({
                appName: config.appName || '',
                welcomeTitle: config.welcomeTitle || '', // <--- CARGAR DATO
                footerText: config.footerText || '',
                whatsappNumber: config.whatsappNumber || '',
                logoUrl: config.logoUrl || '',
                backgroundImageUrl: config.backgroundImageUrl || ''
            });
        }
    }, [config]);

    // --- FUNCIÓN PARA SUBIR A CLOUDINARY ---
    const uploadImageToCloudinary = async (file) => {
        if (!file) return null;
        const data = new FormData();
        data.append("file", file);
        
        // ⚠️ REEMPLAZA CON TUS DATOS REALES DE CLOUDINARY:
        data.append("upload_preset", "Barberia_preset"); 
        data.append("cloud_name", "dm9nfa8ot");

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

    // --- FUNCIÓN PARA QUITAR IMÁGENES ---
    const handleRemoveImage = (type) => {
        if (type === 'logo') {
            setLogoFile(null);
            setFormData({ ...formData, logoUrl: null }); // Marcar null para borrar en DB
        } else if (type === 'background') {
            setBackgroundFile(null);
            setFormData({ ...formData, backgroundImageUrl: null }); // Marcar null para borrar en DB
        }
    };

    // --- GUARDAR CAMBIOS ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading('Guardando configuración...');

        try {
            // 1. Subir imágenes si hay archivos nuevos seleccionados
            let newLogoUrl = formData.logoUrl;
            let newBackgroundUrl = formData.backgroundImageUrl;

            if (logoFile) {
                newLogoUrl = await uploadImageToCloudinary(logoFile);
            }
            if (backgroundFile) {
                newBackgroundUrl = await uploadImageToCloudinary(backgroundFile);
            }

            // 2. Enviar todo al backend (incluyendo welcomeTitle)
            await api.put('/api/config', {
                ...formData,
                logoUrl: newLogoUrl,
                backgroundImageUrl: newBackgroundUrl
            });
            
            // 3. Recargar contexto global
            await fetchConfig(); 
            
            // Limpiar inputs de archivo
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

    // Helper visual para previsualizar imagen
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
                        
                        {/* --- SECCIÓN IMÁGENES --- */}
                        <div className="row mb-4">
                            {/* Logo */}
                            <div className="col-md-6 mb-3 mb-md-0">
                                <div className="border p-3 rounded bg-light text-center h-100">
                                    <label className="form-label fw-bold d-block mb-3">Logo (Navbar)</label>
                                    <div className="mb-3 d-flex justify-content-center align-items-center" style={{ height: '80px', background: '#e9ecef', borderRadius: '8px' }}>
                                        {getPreview(logoFile, formData.logoUrl) ? (
                                            <img src={getPreview(logoFile, formData.logoUrl)} alt="Logo Preview" style={{ maxHeight: '60px', maxWidth: '100%' }} />
                                        ) : <span className="text-muted small">Sin Logo</span>}
                                    </div>
                                    <input type="file" className="form-control form-control-sm mb-2" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
                                    {(logoFile || formData.logoUrl) && (
                                        <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={() => handleRemoveImage('logo')}>Quitar Logo</button>
                                    )}
                                </div>
                            </div>

                            {/* Fondo */}
                            <div className="col-md-6">
                                <div className="border p-3 rounded bg-light text-center h-100">
                                    <label className="form-label fw-bold d-block mb-3">Imagen de Fondo (Página Principal)</label>
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
                                    <div className="form-text small mt-1">Se aplicará difuminado y capa oscura automáticamente.</div>
                                </div>
                            </div>
                        </div>
                        
                        <hr className="my-4"/>

                        {/* --- SECCIÓN TEXTOS --- */}

                        {/* 1. Nombre de la Marca (Navbar y Footer) */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">Nombre de la Barbería (Marca)</label>
                            <input 
                                className="form-control" 
                                value={formData.appName} 
                                onChange={e => setFormData({...formData, appName: e.target.value})} 
                                placeholder="Ej: Parce's Barbershop"
                            />
                            <div className="form-text">Aparece en la barra de navegación (si no hay logo) y en el pie de página.</div>
                        </div>

                        {/* 2. Título Central (Separado) */}
                        <div className="mb-3 p-3 bg-light border rounded">
                            <label className="form-label fw-bold text-primary">Título de Bienvenida (Centro de la página)</label>
                            <input 
                                className="form-control fw-bold" 
                                value={formData.welcomeTitle} 
                                onChange={e => setFormData({...formData, welcomeTitle: e.target.value})} 
                                placeholder="Ej: COMIENZA A AGENDAR"
                            />
                            <div className="form-text">Este es el título grande que aparece en el centro, independiente de la marca.</div>
                        </div>

                        <div className="row">
                             <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">WhatsApp (Sin +)</label>
                                <input className="form-control" value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} placeholder="56912345678" />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Texto Pie de Página</label>
                                <input className="form-control" value={formData.footerText} onChange={e => setFormData({...formData, footerText: e.target.value})} placeholder="Frase final del sitio" />
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