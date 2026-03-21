import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API_URL from '../apiConfig';

import NotificationBell from './NotificationBell';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [loggedUser, setLoggedUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ firstname: '', lastname: '', phone: '', password: '' });
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const dropdownRef = useRef(null);
    const location = useLocation();
    const isHome = location.pathname === '/';

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) {
            const parsed = JSON.parse(u);
            setLoggedUser(parsed);
            setEditForm({ firstname: parsed.firstname || '', lastname: parsed.lastname || '', phone: parsed.phone || '', password: '' });
        }
    }, [location]); // Refresh on location change to ensure user state is correct

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleDarkMode = undefined; // removed

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveMsg('');
        try {
            const payload = { firstname: editForm.firstname, lastname: editForm.lastname, phone: editForm.phone };
            if (editForm.password) payload.password = editForm.password;
            const res = await fetch(`${API_URL}/auth/users/${loggedUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const updated = { ...loggedUser, ...payload };
                delete updated.password;
                localStorage.setItem('user', JSON.stringify(updated));
                setLoggedUser(updated);
                setSaveMsg('✅ Амжилттай хадгаллаа!');
                setEditing(false);
                setTimeout(() => setSaveMsg(''), 3000);
            } else {
                const d = await res.json();
                setSaveMsg('❌ ' + (d.error || 'Алдаа гарлаа'));
            }
        } catch (err) {
            setSaveMsg('❌ Серверт холбогдоход алдаа гарлаа');
        } finally {
            setSaving(false);
        }
    };

    const glassStyle = isHome
        ? {
            background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.10)' : '0 2px 12px rgba(0,0,0,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.5)',
            color: '#1a1a2e'
        }
        : {
            background: 'linear-gradient(90deg, #a2a2df 0%, #b8b8ea 100%)',
            boxShadow: '0 4px 18px rgba(162,162,223,0.25)',
            color: 'white'
        };

    const textColor = isHome ? '#1a1a2e' : 'white';

    return (
        <nav className="responsive-flex" style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 36px',
            gap: '15px',
            flexWrap: 'wrap',
            position: 'sticky',
            top: 0,
            zIndex: 999,
            transition: 'background 0.3s ease, box-shadow 0.3s ease',
            letterSpacing: '-0.3px',
            ...glassStyle
        }}>
            {/* Brand */}
            <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                <Link to={loggedUser ? '/dashboard' : '/'} style={{ color: textColor, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🐾</span> PetCare
                </Link>
            </div>

            {/* Nav links — only for guests (not logged in) */}
            {!loggedUser && (
                <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
                    {[{ to: '/', label: 'Нүүр хуудас' }, { to: '/about', label: 'Бидний тухай' }].map(({ to, label }) => (
                        <Link key={to} to={to} style={{ color: isHome ? 'rgba(26,26,46,0.7)' : 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '15px', fontWeight: '600', transition: 'color 0.2s' }}>
                            {label}
                        </Link>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>

                {loggedUser && <NotificationBell user={loggedUser} />}

                {loggedUser ? (
                    /* Logged in: avatar dropdown */
                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => { setDropdownOpen(p => !p); setEditing(false); setSaveMsg(''); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '7px 16px 7px 7px',
                                borderRadius: '50px',
                                backgroundColor: isHome ? 'rgba(162,162,223,0.13)' : 'rgba(255,255,255,0.18)',
                                border: 'none', cursor: 'pointer',
                                color: isHome ? '#1a1a2e' : 'white',
                                fontWeight: '700', fontSize: '14px',
                                transition: 'background 0.2s'
                            }}
                        >
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#f39c12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '13px', flexShrink: 0 }}>
                                {loggedUser.firstname?.[0]?.toUpperCase() || '?'}
                            </div>
                            {loggedUser.firstname} {loggedUser.lastname}
                            <span style={{ fontSize: '10px', opacity: 0.6 }}>▼</span>
                        </button>

                        {/* Dropdown */}
                        {dropdownOpen && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                                backgroundColor: 'white', borderRadius: '18px',
                                boxShadow: '0 16px 48px rgba(0,0,0,0.14)',
                                border: '1px solid #f0f0f0',
                                minWidth: '300px', overflow: 'hidden', zIndex: 1000
                            }}>
                                {!editing ? (
                                    <>
                                        {/* User info header */}
                                        <div style={{ padding: '20px', borderBottom: '1px solid #f4f4f4', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#f39c12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '18px', flexShrink: 0 }}>
                                                {loggedUser.firstname?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', color: '#1a1a2e', fontSize: '15px' }}>{loggedUser.lastname} {loggedUser.firstname}</div>
                                                <div style={{ color: '#aaa', fontSize: '13px' }}>{loggedUser.email}</div>
                                                {loggedUser.phone && <div style={{ color: '#888', fontSize: '13px' }}>📞 {loggedUser.phone}</div>}
                                            </div>
                                        </div>
                                        {saveMsg && <div style={{ padding: '10px 20px', backgroundColor: '#e8f8f2', color: '#27ae60', fontSize: '13px', fontWeight: '600' }}>{saveMsg}</div>}
                                        <div style={{ padding: '10px' }}>
                                            <button onClick={() => setEditing(true)} style={{ width: '100%', padding: '11px 16px', borderRadius: '12px', border: 'none', backgroundColor: '#f8f8f8', color: '#1a1a2e', fontWeight: '600', fontSize: '14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                ✏️ Мэдээлэл засах
                                            </button>
                                            <button onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }}
                                                style={{ width: '100%', padding: '11px 16px', borderRadius: '12px', border: 'none', backgroundColor: '#fdecea', color: '#e74c3c', fontWeight: '700', fontSize: '14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                🚪 Гарах
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    /* Edit profile form */
                                    <div style={{ padding: '20px' }}>
                                        <div style={{ fontWeight: '700', color: '#1a1a2e', marginBottom: '16px', fontSize: '15px' }}>✏️ Мэдээлэл засах</div>
                                        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {[
                                                { k: 'lastname', ph: 'Овог', t: 'text' },
                                                { k: 'firstname', ph: 'Нэр', t: 'text' },
                                                { k: 'phone', ph: '📞 Утасны дугаар', t: 'text' },
                                                { k: 'password', ph: '🔒 Шинэ нууц үг (заавал биш)', t: 'password' },
                                            ].map(({ k, ph, t }) => (
                                                <input key={k} type={t} placeholder={ph} value={editForm[k]}
                                                    onChange={e => setEditForm(p => ({ ...p, [k]: e.target.value }))}
                                                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e8e8e8', fontSize: '14px', outline: 'none' }} />
                                            ))}
                                            {saveMsg && <div style={{ color: saveMsg.startsWith('✅') ? '#27ae60' : '#e74c3c', fontSize: '13px', fontWeight: '600' }}>{saveMsg}</div>}
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: '50px', border: 'none', backgroundColor: '#f39c12', color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                                                    {saving ? '...' : 'Хадгалах'}
                                                </button>
                                                <button type="button" onClick={() => setEditing(false)} style={{ flex: 1, padding: '10px', borderRadius: '50px', border: 'none', backgroundColor: '#f4f4f4', color: '#555', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                                                    Болих
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Guest: Login button */
                    <Link to="/login" style={{
                        padding: '10px 26px', backgroundColor: '#f39c12', color: 'white',
                        textDecoration: 'none', borderRadius: '50px', fontWeight: '700', fontSize: '15px',
                        boxShadow: '0 4px 16px rgba(243,168,38,0.35)',
                        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        Нэвтрэх
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
