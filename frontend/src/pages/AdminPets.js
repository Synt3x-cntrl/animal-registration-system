import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../apiConfig";

function MedicalRecordRow({ record }) {
    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #ede9fe',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '8px',
            fontSize: '13px',
            marginBottom: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
        }}>
            <div><strong>📅 Огноо:</strong> {new Date(record.date).toLocaleDateString('mn-MN')}</div>
            <div><strong>🩺 Эмч:</strong> {record.doctorName}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong>🔬 Шинж тэмдэг:</strong> {record.symptoms}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong>🧬 Онош:</strong> <span style={{ color: '#e74c3c', fontWeight: '600' }}>{record.diagnosis}</span></div>
            <div style={{ gridColumn: '1 / -1' }}><strong>💊 Эмчилгээ:</strong> {record.treatment}</div>
            {record.notes && <div style={{ gridColumn: '1 / -1', color: '#888' }}><strong>📝 Тэмдэглэл:</strong> {record.notes}</div>}
        </div>
    );
}

function MedicalDrawer({ pet }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_URL}/medical-records/user/${pet.owner?._id || pet.owner}`);
                const data = await res.json();
                if (res.ok && data.data) {
                    setRecords(data.data.filter(r => r.petName?.toLowerCase() === pet.name?.toLowerCase()));
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        })();
    }, [pet]);

    return (
        <div style={{ padding: '16px 20px 20px 20px', backgroundColor: '#faf9ff', borderTop: '1px solid #ede9fe', borderRadius: '0 0 18px 18px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#a2a2df', marginBottom: '12px' }}>📋 Эмнэлгийн үзлэгийн түүх</div>
            {loading ? <div style={{ color: '#bbb', fontSize: '13px' }}>⏳ Уншиж байна...</div>
                : records.length === 0 ? <div style={{ color: '#bbb', fontStyle: 'italic', fontSize: '13px' }}>Үзлэгийн түүх байхгүй байна.</div>
                : records.map(r => <MedicalRecordRow key={r._id} record={r} />)
            }
        </div>
    );
}

function PetCard({ p, expanded, onToggle, onDelete }) {
    const initial = (p.name?.[0] || '?').toUpperCase();
    const colors = ['#a2a2df', '#f39c12', '#27ae60', '#e74c3c', '#3498db'];
    const avatarBg = colors[p.name?.charCodeAt(0) % colors.length] || '#a2a2df';

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '18px',
            boxShadow: expanded ? '0 8px 32px rgba(162,162,223,0.15)' : '0 4px 16px rgba(0,0,0,0.06)',
            border: expanded ? '1.5px solid #a2a2df' : '1px solid #f0f0f0',
            marginBottom: '14px',
            overflow: 'hidden',
            transition: 'box-shadow 0.2s, border 0.2s'
        }}>
            <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer' }}>
                {/* Avatar */}
                {p.imageUrl && p.imageUrl.startsWith('data:image') ? (
                    <img src={p.imageUrl} alt={p.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '18px', flexShrink: 0 }}>
                        {initial}
                    </div>
                )}

                {/* Name + Species */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', color: '#1a1a2e', fontSize: '15px' }}>{p.name}</div>
                    <div style={{ color: '#aaa', fontSize: '13px', marginTop: '2px' }}>{p.species} · {p.gender} · {p.age}</div>
                </div>

                {/* Owner */}
                <div style={{ color: '#888', fontSize: '13px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>👤</span> {p.owner ? `${p.owner.firstname} ${p.owner.lastname}` : 'Мэдэгдэхгүй'}
                </div>

                {/* Date */}
                <div style={{ color: '#ccc', fontSize: '12px', flexShrink: 0, marginLeft: '12px' }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                </div>

                {/* Delete button */}
                <div onClick={e => e.stopPropagation()} style={{ marginLeft: '12px', flexShrink: 0 }}>
                    <button
                        onClick={() => onDelete(p._id)}
                        style={{ padding: '6px 14px', backgroundColor: '#fdecea', color: '#e74c3c', border: '1px solid #f5c0bc', borderRadius: '50px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'transform 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Устгах
                    </button>
                </div>

                <span style={{ color: '#bbb', marginLeft: '10px', fontSize: '16px' }}>{expanded ? '▲' : '▼'}</span>
            </div>

            {expanded && <MedicalDrawer pet={p} />}
        </div>
    );
}

function AdminPets() {
    const [user, setUser] = useState(null);
    const [petsList, setPetsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPetId, setExpandedPetId] = useState(null);
    const navigate = useNavigate();

    const fetchPets = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/pets`);
            const data = await response.json();
            if (response.ok) setPetsList(data.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const loggedUser = localStorage.getItem("user");
        if (loggedUser) {
            const p = JSON.parse(loggedUser);
            if (p.role !== 'admin') { alert("Танд админ эрх байхгүй!"); navigate("/"); }
            else setUser(p);
        } else { navigate("/login"); }
    }, [navigate]);

    useEffect(() => { if (user) fetchPets(); }, [user, fetchPets]);

    const handleDeletePet = async (id) => {
        if (!window.confirm("Энэ амьтныг устгахдаа итгэлтэй байна уу?")) return;
        try {
            const r = await fetch(`${API_URL}/pets/${id}`, { method: "DELETE" });
            if (r.ok) { if (expandedPetId === id) setExpandedPetId(null); fetchPets(); }
            else { const d = await r.json(); alert("Алдаа: " + d.error); }
        } catch (e) { alert("Алдаа: " + e.message); }
    };

    if (!user || loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>⏳ Уншиж байна...</div>;

    return (
        <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 6px 0' }}>🐾 Амьтад</h1>
                <p style={{ color: '#aaa', margin: 0, fontSize: '14px' }}>Нийт <strong>{petsList.length}</strong> амьтан · Картан дарахад үзлэгийн түүх нээгдэнэ</p>
            </div>

            <div>
                {petsList.length === 0
                    ? <div style={{ textAlign: 'center', color: '#bbb', padding: '60px 0', fontSize: '16px' }}>Амьтан олдсонгүй 🐾</div>
                    : petsList.map(p => (
                        <PetCard
                            key={p._id}
                            p={p}
                            expanded={expandedPetId === p._id}
                            onToggle={() => setExpandedPetId(prev => prev === p._id ? null : p._id)}
                            onDelete={handleDeletePet}
                        />
                    ))
                }
            </div>
        </div>
    );
}

export default AdminPets;
