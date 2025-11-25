import React, { useState, useContext } from 'react';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { setToken, setUser } = useContext(AuthContext); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/api/auth/login', { username, password });
            
            // Guardar sesión
            setToken(res.data.token);
            setUser(res.data.user);
            
            // 👇 AQUÍ ESTÁ LA MAGIA: REDIRECCIÓN SEGÚN ROL
            if (res.data.user.role === 'developer') {
                console.log("Detectado desarrollador, redirigiendo a dashboard...");
                navigate('/dev-dashboard'); // Va a la bóveda financiera
            } else {
                navigate('/admin'); // Va a la gestión de citas
            }

        } catch (err) {
            console.error('Login Error:', err);
            setError('Credenciales inválidas o servidor inactivo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '400px' }}>
            <div className="card shadow-lg p-4 border-0">
                <div className="text-center mb-4">
                    <span style={{ fontSize: '3rem' }}>🔐</span>
                    <h2 className="mt-2">Acceso Seguro</h2>
                </div>
                
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Usuario</label>
                        <input 
                            type="text" 
                            className="form-control form-control-lg" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            autoFocus
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-bold">Contraseña</label>
                        <input 
                            type="password" 
                            className="form-control form-control-lg" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? 'Verificando...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                </form>
                <div className="text-center mt-3">
                    <a href="/" className="text-decoration-none text-muted">← Volver a la Barbería</a>
                </div>
            </div>
        </div>
    );
};

export default Login;