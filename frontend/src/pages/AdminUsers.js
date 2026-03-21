import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../apiConfig";

const ROLE_META = {
    admin:  { label: 'Админ',      color: '#e74c3c', bg: '#fdecea' },
    doctor: { label: 'Эмч',        color: '#a2a2df', bg: '#f0effa' },
    user:   { label: 'Хэрэглэгч',  color: '#27ae60', bg: '#e8f8f2' },
};

function PetMiniCard({ pet }) {
    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #ede9fe',
            borderRadius: '14px',
            padding: '12px 16px',
            minWidth: '180px',
            fontSize: '13px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
            <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '8px', color: '#1a1a2e' }}>🐾 {pet.name}</div>
            <div style={{ color: '#666' }}><strong>Төрөл:</strong> {pet.species}</div>
            <div style={{ color: '#666' }}><strong>Нас:</strong> {pet.age}</div>
            <div style={{ color: '#666' }}><strong>Хүйс:</strong> {pet.gender}</div>
            <div style={{ marginTop: '6px', color: '#bbb', fontSize: '11px' }}>
                {new Date(pet.createdAt).toLocaleDateString('mn-MN')}
            </div>
        </div>
    );
}

function UserPetsDrawer({ userId }) {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_URL}/pets/user/${userId}`);
                const data = await res.json();
                if (res.ok && data.data) setPets(data.data);
            } catch (err) {
                console.error(err);
            } finally { setLoading(false); }
        })();
    }, [userId]);

    return (
        <div style={{ padding: '16px 20px 20px 20px', marginTop: '4px', backgroundColor: '#faf9ff', borderRadius: '0 0 18px 18px', borderTop: '1px solid #ede9fe' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#a2a2df', marginBottom: '10px' }}>🐾 Бүртгэлтэй амьтад</div>
            {loading ? <div style={{ color: '#bbb', fontSize: '13px' }}>⏳ Уншиж байна...</div>
            : pets.length === 0 ? <div style={{ color: '#bbb', fontStyle: 'italic', fontSize: '13px' }}>Амьтан бүртгүүлээгүй байна.</div>
            : (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {pets.map(p => <PetMiniCard key={p._id} pet={p} />)}
                </div>
            )}
        </div>
    );
}

function DoctorReportsDrawer({ doctorName }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_URL}/medical-records/doctor/${encodeURIComponent(doctorName)}`);
                const data = await res.json();
                if (res.ok && data.data) setReports(data.data);
            } catch (err) {
                console.error(err);
            } finally { setLoading(false); }
        })();
    }, [doctorName]);

    return (
        <div style={{ padding: '16px 20px 20px 20px', marginTop: '4px', backgroundColor: '#fdfaff', borderRadius: '0 0 18px 18px', borderTop: '1px solid #ede9fe' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#a2a2df', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📋 Бичсэн эмнэлгийн тэмдэглэлүүд ({reports.length})
            </div>
            {loading ? <div style={{ color: '#bbb', fontSize: '13px' }}>⏳ Уншиж байна...</div>
            : reports.length === 0 ? <div style={{ color: '#bbb', fontStyle: 'italic', fontSize: '13px' }}>Бичсэн тайлан олдсонгүй.</div>
            : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {reports.map(r => (
                        <div key={r._id} style={{ backgroundColor: 'white', border: '1px solid #f0effa', borderRadius: '14px', padding: '14px', fontSize: '13px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                            <div style={{ fontWeight: '800', fontSize: '14px', color: '#1a1a2e', marginBottom: '6px' }}>🐾 {r.petName}</div>
                            <div style={{ color: '#555', marginBottom: '4px' }}><strong>Шинж тэмдэг:</strong> {r.symptoms}</div>
                            <div style={{ color: '#555', marginBottom: '4px' }}><strong>Онош:</strong> {r.diagnosis}</div>
                            <div style={{ color: '#555' }}><strong>Эмчилгээ:</strong> {r.treatment}</div>
                            <div style={{ marginTop: '10px', color: '#bbb', fontSize: '11px', textAlign: 'right' }}>
                                📅 {r.date}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function UserCard({ u, onEdit, onDelete, expanded, onToggle }) {
    const role = ROLE_META[u.role] || ROLE_META.user;
    const initial = (u.firstname?.[0] || '?').toUpperCase();
    const avatarBg = u.role === 'admin' ? '#e74c3c' : u.role === 'doctor' ? '#a2a2df' : '#27ae60';

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '18px',
            boxShadow: expanded ? '0 8px 32px rgba(162,162,223,0.15)' : '0 4px 16px rgba(0,0,0,0.06)',
            border: expanded ? '1.5px solid #a2a2df' : '1px solid #f0f0f0',
            marginBottom: '14px',
            transition: 'box-shadow 0.2s, border 0.2s',
            overflow: 'hidden'
        }}>
            {/* Card header row */}
            <div
                onClick={onToggle}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer' }}
            >
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '17px', flexShrink: 0 }}>
                    {initial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', color: '#1a1a2e', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.lastname} {u.firstname}</div>
                    <div style={{ color: '#aaa', fontSize: '13px', marginTop: '2px' }}>{u.email}</div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: role.color, backgroundColor: role.bg, padding: '4px 10px', borderRadius: '50px', flexShrink: 0 }}>
                    {role.label}
                </span>
                <div style={{ color: '#bbb', fontSize: '13px', flexShrink: 0, marginLeft: '8px' }}>{u.phone || '—'}</div>
                <div style={{ color: '#ccc', fontSize: '12px', flexShrink: 0, marginLeft: '12px' }}>{new Date(u.createdAt).toLocaleDateString()}</div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '12px' }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => onEdit(u)} style={{ padding: '6px 14px', backgroundColor: '#fff8e1', color: '#f39c12', border: '1px solid #f9e0a5', borderRadius: '50px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'transform 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >Засах</button>
                    <button onClick={() => onDelete(u._id)} style={{ padding: '6px 14px', backgroundColor: '#fdecea', color: '#e74c3c', border: '1px solid #f5c0bc', borderRadius: '50px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'transform 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >Устгах</button>
                </div>
                <span style={{ color: '#bbb', marginLeft: '10px', fontSize: '16px' }}>{expanded ? '▲' : '▼'}</span>
            </div>

            {/* Expand content based on role */}
            {expanded && (
                u.role === 'doctor' 
                    ? <DoctorReportsDrawer doctorName={`${u.firstname} ${u.lastname}`} />
                    : <UserPetsDrawer userId={u._id} />
            )}
        </div>
    );
}

function AdminUsers() {
    const [user, setUser] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ firstname: '', lastname: '', email: '', phone: '', role: '', password: '' });
    const [expandedUserId, setExpandedUserId] = useState(null);
    const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/users`);
            const data = await response.json();
            if (response.ok) setUsersList(data.data);
        } catch (error) {
            console.error("Сервертэй холбогдоход алдаа:", error);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const loggedUser = localStorage.getItem("user");
        if (loggedUser) {
            const parsedUser = JSON.parse(loggedUser);
            if (parsedUser.role !== 'admin') { alert("Танд админ эрх байхгүй!"); navigate("/"); }
            else setUser(parsedUser);
        } else { navigate("/login"); }
    }, [navigate]);

    useEffect(() => { if (user) fetchUsers(); }, [user, fetchUsers]);

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?")) return;
        try {
            const r = await fetch(`${API_URL}/auth/users/${id}`, { method: "DELETE" });
            if (r.ok) { if (expandedUserId === id) setExpandedUserId(null); fetchUsers(); }
            else { const d = await r.json(); alert("Алдаа: " + d.error); }
        } catch (e) { alert("Алдаа: " + e.message); }
    };

    const handleEditClick = (u) => {
        setEditingUser(u);
        setEditForm({ firstname: u.firstname || '', lastname: u.lastname || '', email: u.email || '', phone: u.phone || '', role: u.role || 'user', password: '' });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...editForm };
            if (!payload.password) delete payload.password;
            const r = await fetch(`${API_URL}/auth/users/${editingUser._id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
            });
            if (r.ok) { setEditingUser(null); fetchUsers(); }
            else { const d = await r.json(); alert("Алдаа: " + d.error); }
        } catch (e) { alert("Алдаа: " + e.message); }
    };

    if (!user || loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>⏳ Уншиж байна...</div>;

    const filteredUsers = usersList.filter(u => {
        const term = searchTerm.toLowerCase();
        return `${u.firstname} ${u.lastname} ${u.email} ${u.phone}`.toLowerCase().includes(term);
    });

    return (
        <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 6px 0' }}>👤 Хэрэглэгчид</h1>
                <p style={{ color: '#aaa', margin: 0, fontSize: '14px' }}>Нийт <strong>{usersList.length}</strong> хэрэглэгч · Картан дарахад амьтдын мэдээлэл нээгдэнэ</p>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="🔍  Нэр, имэйл эсвэл утасны дугаараар хайх..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                        padding: '12px 18px',
                        width: '100%',
                        maxWidth: '400px',
                        borderRadius: '50px',
                        border: '1.5px solid #e0e0e0',
                        fontSize: '14px',
                        outline: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        letterSpacing: '-0.2px'
                    }}
                />
            </div>

            {/* Cards */}
            <div>
                {filteredUsers.length === 0
                    ? <div style={{ textAlign: 'center', color: '#bbb', padding: '60px 0', fontSize: '16px' }}>Хэрэглэгч олдсонгүй 🕵️</div>
                    : filteredUsers.map(u => (
                        <UserCard
                            key={u._id}
                            u={u}
                            expanded={expandedUserId === u._id}
                            onToggle={() => setExpandedUserId(p => p === u._id ? null : u._id)}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteUser}
                        />
                    ))
                }
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '36px', borderRadius: '24px', width: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '800', color: '#1a1a2e' }}>✏️ Хэрэглэгч засах</h2>
                        <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { ph: 'Овог', k: 'lastname', t: 'text' }, { ph: 'Нэр', k: 'firstname', t: 'text' },
                                { ph: 'Имэйл', k: 'email', t: 'email' }, { ph: 'Утас', k: 'phone', t: 'text' },
                            ].map(({ ph, k, t }) => (
                                <input key={k} type={t} placeholder={ph} value={editForm[k]} required={k !== 'phone'}
                                    onChange={e => setEditForm({ ...editForm, [k]: e.target.value })}
                                    style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none' }} />
                            ))}
                            <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e0e0e0', fontSize: '14px', backgroundColor: 'white' }}>
                                <option value="user">Хэрэглэгч</option>
                                <option value="doctor">Эмч</option>
                                <option value="admin">Админ</option>
                            </select>
                            <input type="password" placeholder="Шинэ нууц үг (заавал биш)" value={editForm.password}
                                onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none' }} />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '50px', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>Хадгалах</button>
                                <button type="button" onClick={() => setEditingUser(null)} style={{ flex: 1, padding: '12px', backgroundColor: '#f0f0f0', color: '#555', border: 'none', borderRadius: '50px', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>Болих</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminUsers;
