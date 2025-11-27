import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaCut, FaCalendarAlt, FaUserShield, FaSignOutAlt } from 'react-icons/fa'; // Iconos

const Layout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* NAVBAR PROFESIONAL */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
                <div className="container">
                    <Link className="navbar-brand d-flex align-items-center fw-bold" to="/">
                        <FaCut className="me-2" /> BARBERÍA DEL FUTURO
                    </Link>
                    
                    <div className="d-flex align-items-center">
                        {user ? (
                            <div className="dropdown">
                                <button className="btn btn-secondary dropdown-toggle d-flex align-items-center" type="button" id="userMenu" data-bs-toggle="dropdown">
                                    <FaUserShield className="me-2" /> {user.username}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                                    {user.role === 'developer' && (
                                        <li><Link className="dropdown-item" to="/dev-dashboard">Panel Maestro</Link></li>
                                    )}
                                    {(user.role === 'admin' || user.role === 'developer') && (
                                        <li><Link className="dropdown-item" to="/admin">Gestión de Citas</Link></li>
                                    )}
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                                            <FaSignOutAlt className="me-2" /> Cerrar Sesión
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-outline-light btn-sm">
                                Acceso Admin
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-grow-1 py-5" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="container">
                    {children}
                </div>
            </main>

            {/* FOOTER */}
            <footer className="bg-dark text-white text-center py-3 mt-auto">
                <div className="container">
                    <p className="mb-0 small">
                        &copy; {new Date().getFullYear()} Barbería del Futuro. Todos los derechos reservados.
                    </p>
                    <p className="mb-0 small text-muted">
                        Desarrollado con <span className="text-danger">❤</span> por DevMaster
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;