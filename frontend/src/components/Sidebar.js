import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
        window.location.reload();
    };

    const [user, setUser] = React.useState(null);
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    React.useEffect(() => {
        const loggedUser = localStorage.getItem("user");
        if (loggedUser) setUser(JSON.parse(loggedUser));
    }, []);

    const isActive = (path) => location.pathname === path;

    const linkStyle = (path) => ({
        textDecoration: 'none',
        color: isActive(path) ? '#f39c12' : 'rgba(255,255,255,0.78)',
        fontSize: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '11px 14px',
        borderRadius: '10px',
        transition: 'background-color 0.18s, color 0.18s',
        backgroundColor: isActive(path) ? 'rgba(249,168,38,0.12)' : 'transparent',
        fontWeight: isActive(path) ? '700' : '500',
    });

    return (
        <div className="responsive-sidebar" style={{
            width: '240px',
            height: '100vh',
            backgroundColor: '#1e2030',
            padding: '24px 14px',
            boxShadow: '4px 0 18px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
        }}>
            {/* Logo / Brand */}
            <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '26px' }}>🐾</span>
                    <div>
                        <div style={{ color: 'white', fontWeight: '800', fontSize: '16px' }}>PetCare</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Удирдлагын систем</div>
                    </div>
                </div>
                {user && (
                    <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#a2a2df', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                            {user.firstname?.[0]?.toUpperCase() || '?'}
                        </div>
                    <div>
                            <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{user.firstname} {user.lastname}</div>
                            <div style={{ color: '#f39c12', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>
                                {user.role === 'admin' ? 'Админ' : user.role === 'doctor' ? 'Эмч' : 'Хэрэглэгч'}
                            </div>
                            {user.phone && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '2px' }}>📞 {user.phone}</div>}
                        </div>
                    </div>
                )}
            </div>

            <button
                className="mobile-menu-btn"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                style={{ marginBottom: '10px' }}
            >
                {isMobileOpen ? "✕ Цэс Хаах" : "☰ Цэс Нээх"}
            </button>

            <div className={isMobileOpen ? "sidebar-content-open" : "sidebar-content-closed"} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <nav>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '14px' }}>
                        Үндсэн цэс
                    </div>
                    <ul onClick={() => setIsMobileOpen(false)} style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <li>
                            <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} style={linkStyle(user?.role === 'admin' ? '/admin' : '/dashboard')}>
                                <span>🏠</span> Хяналтын самбар
                            </Link>
                        </li>

                        {user?.role === 'admin' ? (
                            <>
                                <li><Link to="/admin/users" style={linkStyle('/admin/users')}><span>👤</span> Хэрэглэгчид</Link></li>
                                <li><Link to="/admin/pets" style={linkStyle('/admin/pets')}><span>🐾</span> Амьтад</Link></li>
                            </>
                        ) : user?.role === 'doctor' ? (
                            <>
                                <li><Link to="/appointments" style={linkStyle('/appointments')}><span>🕐</span> Цаг оруулах</Link></li>
                                <li><Link to="/doctor/daily-reports" style={linkStyle('/doctor/daily-reports')}><span>📊</span> Өдрийн тайлан</Link></li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/my-pets" style={linkStyle('/my-pets')}><span>🐶</span> Миний амьтад</Link></li>
                                <li><Link to="/appointments" style={linkStyle('/appointments')}><span>📅</span> Цаг захиалга</Link></li>
                            </>
                        )}

                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '20px', marginBottom: '8px', paddingLeft: '14px' }}>
                            Мэдээлэл
                        </div>
                        <li>
                            <Link to="/pricing" style={linkStyle('/pricing')}>
                                <span>💰</span> Үнийн санал
                            </Link>
                        </li>
                    </ul>

                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '11px',
                            backgroundColor: 'rgba(231, 76, 60, 0.15)',
                            color: '#e74c3c',
                            border: '1px solid rgba(231,76,60,0.3)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s'
                        }}>
                        🚪 Гарах
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
