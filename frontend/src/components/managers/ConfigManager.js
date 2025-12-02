import React, { useState, useEffect, useContext } from 'react';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { ConfigContext } from '../../context/ConfigContext';
import axios from 'axios'; // Asegúrate de tener axios instalado

const ConfigManager = () => {
    const { config, fetchConfig } = useContext(ConfigContext);
    
    const [formData, setFormData] = useState({
        appName: '',
        footerText: '',
        whatsappNumber: '',
        logoUrl: '' // Estado para el logo
    });
    const [imageFile, setImageFile] = useState(null); // Archivo seleccionado
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (config) {
            setFormData({
                appName: config.appName || '',
                footerText: config.footerText || '',
                whatsappNumber: config.whatsappNumber || '',
                logoUrl: config.logoUrl || ''
            });
        }
    }, [config]);

    // --- FUNCIÓN PARA SUBIR A CLOUDINARY ---
    const uploadImageToCloudinary = async (file) => {
        const data = new FormData();
        data.append("file", file);
        // REEMPLAZA ESTOS DATOS CON LOS TUYOS DE CLOUDINARY:
        data.append("upload_preset", "Barberia_preset"); 
        data.append("cloud_name", "dm9nfa8ot");

        try {
            const res = await axios.post(
                "https://api.cloudinary.com/v1_1/dm9nfa8ot/image/upload",
                data
            );
            return res.data.secure_url;
        } catch (error) {
            console.error("Error subiendo imagen:", error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading('Guardando configuración...');

        try {
            let finalLogoUrl = formData.logoUrl;

            // 1. Si el usuario seleccionó un archivo nuevo, lo subimos primero
            if (imageFile) {
                finalLogoUrl = await uploadImageToCloudinary(imageFile);
            }

            // 2. Enviamos todo al backend (incluyendo la URL nueva o la vieja)
            await api.put('/api/config', {
                ...formData,
                logoUrl: finalLogoUrl
            });
            
            await fetchConfig(); // Recargar cambios globales
            
            toast.dismiss(loadingToast);
            toast.success('¡Configuración actualizada!');
            setImageFile(null); // Limpiar input de archivo
        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error('Error al guardar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate__animated animate__fadeIn">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-info text-white">
                    <h5 className="mb-0">⚙️ Configuración General</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        
                        {/* SECCIÓN DEL LOGO */}
                        <div className="mb-4 text-center border p-3 rounded bg-light">
                            <label className="form-label fw-bold d-block">Logo de la Barbería (Navbar)</label>
                            
                            {/* Previsualización */}
                            <div className="mb-3">
                                {imageFile ? (
                                    <img src={URL.createObjectURL(imageFile)} alt="Previsualización" style={{ height: '60px' }} />
                                ) : formData.logoUrl ? (
                                    <img src={formData.logoUrl} alt="Actual" style={{ height: '60px' }} />
                                ) : (
                                    <span className="text-muted">Sin logo (se usa texto)</span>
                                )}
                            </div>

                            <input 
                                type="file" 
                                className="form-control" 
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files[0])}
                            />
                            <div className="form-text">Sube una imagen (PNG transparente recomendado).</div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Nombre de la Marca (Título Principal)</label>
                            <input 
                                className="form-control" 
                                value={formData.appName} 
                                onChange={e => setFormData({...formData, appName: e.target.value})} 
                                placeholder="Ej: PARCES"
                            />
                            <div className="form-text">Este texto aparecerá en el centro de la página de reservas.</div>
                        </div>
                        
                        {/* ... (Mantén los inputs de footerText y whatsappNumber igual que antes) ... */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">Texto Pie de Página</label>
                            <input 
                                className="form-control" 
                                value={formData.footerText} 
                                onChange={e => setFormData({...formData, footerText: e.target.value})} 
                            />
                        </div>

                         <div className="mb-3">
                            <label className="form-label fw-bold">WhatsApp</label>
                            <input 
                                className="form-control" 
                                value={formData.whatsappNumber} 
                                onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} 
                            />
                        </div>

                        <button className="btn btn-info text-white w-100" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Todo'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConfigManager;