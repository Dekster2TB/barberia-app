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

    // Función para resaltar el link activo
    const isActive = (path) => location.pathname === path ? 'active fw-bold' : '';

    const hasBackground = !!config.backgroundImageUrl;

    return (
        <div className="d-flex flex-column min-vh-100 position-relative overflow-hidden" style={{ backgroundColor: '#f0f2f5' }}>
            
            {/* FONDO */}
            {hasBackground && (
                <div 
                    style={{
                        position: 'fixed', top: -20, left: -20, right: -20, bottom: -20, zIndex: 0,
                        backgroundImage: `url('${config.backgroundImageUrl}')`,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        filter: 'blur(8px) brightness(0.4)', transform: 'scale(1.05)'
                    }}
                ></div>
            )}

            {/* NAVBAR */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top border-bottom border-dark" style={{ zIndex: 10 }}>
                <div className="container">
                    
                    <Link className="navbar-brand d-flex align-items-center fw-bold" to="/" style={{ letterSpacing: '1px' }}>
                        {config.logoUrl ? (
                            <img src={config.logoUrl} alt={config.appName} style={{ maxHeight: '75px', objectFit: 'contain' }} />
                        ) : (
                            <> <FaCut className="me-2 text-warning" /> {config.appName || 'Cargando...'} </>
                        )}
                    </Link>
                    
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarColor01">
                        <ul className="navbar-nav ms-auto align-items-center">
                            
                            {/* 1. LINK RESERVAR */}
                            <li className="nav-item">
                                <Link className={`nav-link ${isActive('/')}`} to="/">RESERVAR</Link>
                            </li>

                            {/* 2. NUEVO LINK: MIS CITAS (Estilo idéntico al de arriba) */}
                            <li className="nav-item">
                                <Link className={`nav-link ${isActive('/my-bookings')}`} to="/my-bookings">MIS CITAS</Link>
                            </li>
                            
                            {/* MENÚ DE USUARIO */}
                            {user && (
                                <li className="nav-item dropdown ms-lg-3">
                                    <button 
                                        className="nav-link dropdown-toggle btn btn-secondary text-white px-3 rounded-pill border-0" 
                                        type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                                    >
                                        <FaUserCog className="me-2" /> {user.username}
                                    </button>

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

            <main className="flex-grow-1 d-flex align-items-center py-5 position-relative" style={{ zIndex: 5 }}>
                <div className="container animate__animated animate__fadeIn">
                    <div className={`p-4 p-md-5 rounded-4 shadow-lg ${hasBackground ? 'bg-white bg-opacity-90' : ''}`}>
                        {children}
                    </div>
                </div>
            </main>

            <footer className="bg-dark text-white text-center py-4 mt-auto position-relative border-top border-secondary" style={{ zIndex: 10 }}>
                <div className="container">
                    <div className="mb-2"><FaCut className="text-muted fs-4" /></div>
                    <p className="mb-0 small opacity-75">&copy; {new Date().getFullYear()} <strong>{config.appName}</strong>. {config.footerText}</p>
                    {!user && (
                        <div className="position-absolute bottom-0 end-0 p-3">
                            <Link to="/login" className="text-secondary opacity-25 hover-opacity-100" title="Acceso Staff"><FaLock size={12} /></Link>
                        </div>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default Layout;