import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
        window.location.reload(); // To guarantee full reset since user state is mostly on page load now
    };

    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        const loggedUser = localStorage.getItem("user");
        if (loggedUser) setUser(JSON.parse(loggedUser));
    }, []);

    const linkStyle = {
        textDecoration: 'none',
        color: '#495057',
        fontSize: '16px',
        display: 'block',
        padding: '10px',
        borderRadius: '5px',
        transition: 'background-color 0.2s',
    };

    return (
        <div style={{
            width: '250px',
            height: '100vh',
            backgroundColor: '#f8f9fa',
            borderRight: '1px solid #dee2e6',
            padding: '20px',
            boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h3 style={{
                marginBottom: '30px',
                color: '#343a40',
                fontSize: '20px',
                borderBottom: '2px solid #007bff',
                paddingBottom: '10px'
            }}>
                Хэрэглэгчийн удирдлага
            </h3>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <li>
                    <Link to="/dashboard" style={linkStyle}>
                        Хяналтын самбар
                    </Link>
                </li>

                {user?.role === 'admin' ? (
                    <>
                        <li>
                            <Link to="/admin" style={linkStyle}>
                                Эмч бүртгэх
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/users" style={linkStyle}>
                                Хэрэглэгчид
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/pets" style={linkStyle}>
                                Амьтад
                            </Link>
                        </li>
                    </>
                ) : user?.role === 'doctor' ? (
                    <>
                        <li>
                            <Link to="/appointments" style={linkStyle}>
                                🕐 Цаг оруулах
                            </Link>
                        </li>
                        <li>
                            <Link to="/medical-history" style={linkStyle}>
                                📋 Эмнэлгийн түүх
                            </Link>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link to="/my-pets" style={linkStyle}>
                                Миний амьтад
                            </Link>
                        </li>
                        <li>
                            <Link to="/appointments" style={linkStyle}>
                                Цаг захиалга
                            </Link>
                        </li>
                        <li>
                            <Link to="/medical-history" style={linkStyle}>
                                Эмнэлгийн түүх
                            </Link>
                        </li>
                    </>
                )}

                <li>
                    <Link to="/settings" style={linkStyle}>
                        Тохиргоо
                    </Link>
                </li>
            </ul>

            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #dee2e6' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}>
                    Гарах
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
