import React, { useState, useEffect } from 'react';
import API_URL from '../apiConfig';
import LoadingSpinner from './LoadingSpinner';

const PetMedicalTimeline = ({ pet, onClose }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!pet) return;
        const fetchRecords = async () => {
            setLoading(true);
            try {
                const ownerId = typeof pet.owner === 'object' ? pet.owner._id : pet.owner;
                const res = await fetch(`${API_URL}/medical-records/user/${ownerId}`);
                const data = await res.json();
                if (res.ok) {
                    const filtered = data.data.filter(r => r.petName.toLowerCase().trim() === pet.name.toLowerCase().trim());
                    // Цаг хугацаагаар нь буурах дарааллаар (Хамгийн сүүлийнх нь эхэндээ)
                    filtered.sort((a,b) => new Date(b.date) - new Date(a.date)); 
                    setRecords(filtered);
                }
            } catch (error) {
                console.error("Түүх татахад алдаа:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, [pet]);

    if (!pet) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 9999, padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                width: '100%', maxWidth: '600px',
                height: '80vh',
                borderRadius: '15px',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #eee',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: '#f8f9fa'
                }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '24px' }}>🐾 {pet.name}</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>
                            Эрүүл мэндийн карт / Timeline
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'none', border: 'none', fontSize: '28px',
                            color: '#95a5a6', cursor: 'pointer'
                        }}
                    >
                        &times;
                    </button>
                </div>

                <div style={{ padding: '20px', overflowY: 'auto', flex: 1, backgroundColor: '#fff' }}>
                    {loading ? (
                        <LoadingSpinner text="Түүхийг ачааллаж байна..." />
                    ) : records.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#95a5a6', marginTop: '40px' }}>
                            Эмнэлгийн түүх байхгүй байна.
                        </div>
                    ) : (
                        <div style={{ position: 'relative', paddingLeft: '30px' }}>
                            {/* Босоо зураас */}
                            <div style={{
                                position: 'absolute', top: 0, bottom: 0, left: '11px',
                                width: '3px', backgroundColor: '#e9ecef'
                            }}></div>

                            {records.map((record, index) => {
                                const d = new Date(record.date);
                                const isLatest = index === 0;

                                return (
                                    <div key={record._id} style={{ position: 'relative', marginBottom: '30px' }}>
                                        {/* Timeline Dot */}
                                        <div style={{
                                            position: 'absolute', left: '-30px', top: '15px',
                                            width: '25px', height: '25px', backgroundColor: isLatest ? '#3498db' : '#95a5a6',
                                            borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            color: 'white', fontSize: '12px', zIndex: 1, boxShadow: '0 0 0 4px #fff'
                                        }}>
                                            {isLatest ? '🌟' : '✓'}
                                        </div>

                                        <div style={{
                                            backgroundColor: '#f8f9fa', padding: '15px 20px',
                                            borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                                            borderLeft: `4px solid ${isLatest ? '#3498db' : '#bdc3c7'}`
                                        }}>
                                            <div style={{ fontSize: '14px', color: '#3498db', fontWeight: 'bold', marginBottom: '8px' }}>
                                                {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div style={{ marginBottom: '8px', fontSize: '15px' }}>
                                                <strong>Онош:</strong> <span style={{ color: '#e74c3c' }}>{record.diagnosis}</span>
                                            </div>
                                            <div style={{ marginBottom: '8px', fontSize: '15px' }}>
                                                <strong>Шинж тэмдэг:</strong> {record.symptoms}
                                            </div>
                                            <div style={{ marginBottom: '10px', fontSize: '15px' }}>
                                                <strong>Эмчилгээ:</strong> <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{record.treatment}</span>
                                            </div>

                                            {record.treatments && record.treatments.length > 0 && (
                                                <div style={{ marginBottom: '12px' }}>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                        {record.treatments.map((t, idx) => (
                                                            <span key={idx} style={{
                                                                backgroundColor: '#e1f5fe',
                                                                color: '#0288d1',
                                                                padding: '3px 10px',
                                                                borderRadius: '15px',
                                                                fontSize: '11px',
                                                                fontWeight: 'bold',
                                                                border: '1px solid #b3e5fc'
                                                            }}>
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div style={{ fontSize: '13px', color: '#7f8c8d', borderTop: '1px solid #eee', paddingTop: '8px', fontStyle: 'italic' }}>
                                                👨‍⚕️ Үзсэн эмч: {record.doctorName}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PetMedicalTimeline;
