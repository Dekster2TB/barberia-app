import React, { useState, useContext } from 'react';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';

const ChangePassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { logout } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);

        try {
            await api.patch('/api/auth/change-password', { newPassword });
            
            setMessage('¡Éxito! Cerrando sesión en 3 segundos...');
            setNewPassword('');
            setConfirmPassword('');
            
            // Forzar logout para que el usuario entre con la nueva clave
            setTimeout(() => {
                logout();
                window.location.href = '#/login';
            }, 3000);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Error al cambiar la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '500px' }}>
            <div className="card shadow">
                <div className="card-header bg-warning text-dark">
                    <h4 className="mb-0">🔐 Cambiar Contraseña</h4>
                </div>
                <div className="card-body p-4">
                    {message && <div className="alert alert-success">{message}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Nueva Contraseña</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                required 
                                minLength="6"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Confirmar Nueva Contraseña</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                                minLength="6"
                            />
                        </div>
                        <div className="d-grid">
                            <button type="submit" className="btn btn-dark" disabled={loading}>
                                {loading ? 'Actualizando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                    
                    <div className="text-center mt-3">
                        <a href="#/admin" className="text-decoration-none">← Volver al Panel</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;