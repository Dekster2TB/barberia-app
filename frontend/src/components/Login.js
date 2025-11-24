import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // <-- Importamos el Contexto
import api from '../config/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { setToken, setUser } = useContext(AuthContext); // <-- Usamos las funciones del Contexto
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/api/auth/login', { username, password });
            
            // Si el login es exitoso:
            setToken(res.data.token);
            setUser(res.data.user);
            
            // Redirigir al administrador a la página protegida
            navigate('/admin');

        } catch (err) {
            console.error('Login Error:', err);
            setError('Credenciales inválidas o servidor inactivo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '400px' }}>
            <div className="card shadow-lg p-4">
                <h2 className="text-center mb-4">🔑 Acceso de Administrador</h2>
                
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Usuario</label>
                        <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Contraseña</label>
                        <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? 'Verificando...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;