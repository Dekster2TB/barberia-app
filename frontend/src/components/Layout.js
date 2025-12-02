import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ConfigContext } from '../context/ConfigContext';
import { FaCut, FaUserCog, FaSignOutAlt, FaCalendarCheck, FaLock } from 'react-icons/fa';

const Layout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const { config } = useContext(ConfigContext); 
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active fw-bold' : '';

    // --- URL DE LA IMAGEN DE FONDO ---
    // Puedes cambiar esta URL por una que subas a Cloudinary si prefieres.
    const backgroundImageURL = "https://images.unsplash.com/photo-1503951914290-9b0147215270?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3";

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* --- NAVBAR --- */}
            {/* Le quitamos la sombra (shadow-lg) para que se fusione mejor con el fondo */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top border-bottom border-dark">
                <div className="container">
                    
                    <Link className="navbar-brand d-flex align-items-center fw-bold" to="/" style={{ letterSpacing: '1px' }}>
                        {config.logoUrl ? (
                            // 1. CAMBIO: Agrandamos el logo
                            // Subimos maxHeight de 45px a 70px (ajústalo si es mucho o poco)
                            <img 
                                src={config.logoUrl} 
                                alt={config.appName} 
                                style={{ maxHeight: '70px', objectFit: 'contain' }} 
                            />
                        ) : (
                            <>
                                <FaCut className="me-2 text-warning" /> {config.appName || 'Cargando...'}
                            </>
                        )}
                    </Link>
                    
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarColor01">
                        <ul className="navbar-nav ms-auto align-items-center">
                            <li className="nav-item">
                                <Link className={`nav-link ${isActive('/')}`} to="/">Reservar</Link>
                            </li>
                            
                            {/* --- MENÚ DE USUARIO LOGUEADO --- */}
                            {user && (
                                <li className="nav-item dropdown ms-lg-3">
                                    <a className="nav-link dropdown-toggle btn btn-secondary text-white px-3 rounded-pill" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                                        <FaUserCog className="me-2" /> {user.username}
                                    </a>
                                    <div className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                                        {(user.role === 'admin' || user.role === 'developer') && (
                                            <>
                                                <Link className="dropdown-item d-flex align-items-center" to="/admin">
                                                    <FaCalendarCheck className="me-2 text-info" /> Gestión de Citas
                                                </Link>
                                                {user.role === 'developer' && (
                                                    <Link className="dropdown-item d-flex align-items-center" to="/dev-dashboard">
                                                        <FaUserCog className="me-2 text-success" /> Panel Maestro
                                                    </Link>
                                                )}
                                            </>
                                        )}
                                        <div className="dropdown-divider"></div>
                                        <button className="dropdown-item text-danger d-flex align-items-center" onClick={handleLogout}>
                                            <FaSignOutAlt className="me-2" /> Cerrar Sesión
                                        </button>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

            {/* --- CONTENIDO PRINCIPAL CON FONDO --- */}
            {/* 2. CAMBIO: Agregamos la imagen de fondo con una capa oscura superpuesta */}
            <main className="flex-grow-1 d-flex align-items-center py-5" style={{ 
                // El truco del degradado: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)) crea una capa negra al 60% de opacidad sobre la imagen.
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${backgroundImageURL}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed' // Efecto parallax al hacer scroll
            }}>
                <div className="container animate__animated animate__fadeIn">
                    {/* Envolvemos el contenido en una "tarjeta" blanca para que resalte del fondo oscuro */}
                    <div className="bg-white p-4 p-md-5 rounded-4 shadow-lg" style={{backgroundColor: 'rgba(255, 255, 255, 0.95)'}}>
                        {children}
                    </div>
                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="bg-dark text-white text-center py-4 mt-auto position-relative border-top border-secondary">
                <div className="container">
                    <div className="mb-2">
                        <FaCut className="text-muted fs-4" />
                    </div>
                    
                    <p className="mb-0 small opacity-75">
                        &copy; {new Date().getFullYear()} <strong>{config.appName}</strong>. {config.footerText}
                    </p>

                    {/* --- PUERTA TRASERA (LOGIN DISCRETO) --- */}
                    {!user && (
                        <div className="position-absolute bottom-0 end-0 p-3">
                            <Link to="/login" className="text-secondary opacity-25 hover-opacity-100" title="Acceso Staff">
                                <FaLock size={12} />
                            </Link>
                        </div>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default Layout;