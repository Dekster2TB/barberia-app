import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ConfigContext } from '../context/ConfigContext';
import { FaCut, FaUserCog, FaSignOutAlt, FaCalendarCheck, FaLock } from 'react-icons/fa';

const Layout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    
    // Obtenemos la configuración (Nombre, Logo, Textos)
    const { config } = useContext(ConfigContext); 

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active fw-bold' : '';

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* --- NAVBAR --- */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-lg sticky-top">
                <div className="container">
                    
                    {/* LOGICA DEL BRAND: ¿Logo o Texto? */}
                    <Link className="navbar-brand d-flex align-items-center fw-bold" to="/" style={{ letterSpacing: '1px' }}>
                        {config.logoUrl ? (
                            // Si existe URL del logo, mostramos la IMAGEN
                            <img 
                                src={config.logoUrl} 
                                alt={config.appName} 
                                style={{ maxHeight: '45px', objectFit: 'contain' }} 
                            />
                        ) : (
                            // Si NO existe logo, mostramos el TEXTO por defecto
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
                            
                            {/* NOTA: El enlace "Mis Citas" se ocultó aquí para no duplicarlo con el botón grande del inicio.
                                Si alguna vez lo quieres recuperar, descomenta esto:
                            <li className="nav-item">
                                <Link className={`nav-link ${isActive('/my-bookings')}`} to="/my-bookings">Mis Citas</Link>
                            </li> 
                            */}

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

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="flex-grow-1" style={{ backgroundColor: '#f7f7f7' }}>
                <div className="container py-5 animate__animated animate__fadeIn">
                    {children}
                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="bg-dark text-white text-center py-4 mt-auto position-relative">
                <div className="container">
                    <div className="mb-2">
                        {/* Aquí seguimos usando el ícono pequeño como decoración */}
                        <FaCut className="text-muted fs-4" />
                    </div>
                    
                    {/* Texto del pie de página (Siempre usa el nombre en texto, no el logo) */}
                    <p className="mb-0 small opacity-75">
                        &copy; {new Date().getFullYear()} <strong>{config.appName}</strong>. {config.footerText}
                    </p>

                    {/* --- PUERTA TRASERA (LOGIN DISCRETO) --- */}
                    {/* Solo visible si NO hay nadie logueado */}
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