import React, { useState, useEffect, useCallback } from 'react';

const DoctorMedicalHistory = ({ doctorName }) => {
    const [records, setRecords] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const encoded = encodeURIComponent(doctorName);
            const res = await fetch(`http://localhost:4000/api/v1/medical-records/doctor/${encoded}`);
            const data = await res.json();
            if (res.ok) {
                setRecords(data.data);
                setFiltered(data.data);
            }
        } catch (err) {
            console.error('Эмнэлгийн түүх татахад алдаа:', err);
        } finally {
            setLoading(false);
        }
    }, [doctorName]);

    useEffect(() => {
        if (doctorName) {
            fetchRecords();
        }
    }, [doctorName, fetchRecords]);

    const handleSearch = (e) => {
        const q = e.target.value.toLowerCase();
        setSearchQuery(e.target.value);
        if (!q) {
            setFiltered(records);
        } else {
            setFiltered(records.filter(r =>
                (r.ownerEmail || '').toLowerCase().includes(q) ||
                (r.ownerPhone || '').toLowerCase().includes(q)
            ));
        }
    };

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            padding: '20px',
            marginTop: '20px'
        }}>
            <h3 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px', marginBottom: '15px' }}>
                📋 Эмнэлгийн түүх ({filtered.length})
            </h3>

            {/* Хайлтын хэсэг */}
            <div style={{ position: 'relative', marginBottom: '15px' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔍</span>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Gmail эсвэл утасны дугаараар хайх..."
                    style={{
                        width: '100%',
                        padding: '10px 10px 10px 38px',
                        borderRadius: '8px',
                        border: '1px solid #ced4da',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                        outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#3498db'}
                    onBlur={e => e.target.style.borderColor = '#ced4da'}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>Ачааллаж байна...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#7f8c8d', border: '1px dashed #ced4da', borderRadius: '6px' }}>
                    {searchQuery ? 'Хайлтын үр дүн олдсонгүй.' : 'Одоогоор эмнэлгийн түүх байхгүй байна.'}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filtered.map(record => (
                        <div key={record._id} style={{
                            padding: '16px',
                            borderLeft: '4px solid #3498db',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '6px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <strong style={{ color: '#2c3e50', fontSize: '16px' }}>🐾 {record.petName}</strong>
                                <span style={{
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    fontSize: '13px'
                                }}>
                                    {new Date(record.date).toLocaleDateString()}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                {record.ownerEmail && (
                                    <span style={{ fontSize: '13px', color: '#2980b9' }}>
                                        <strong>📧</strong> {record.ownerEmail}
                                    </span>
                                )}
                                {record.ownerPhone && (
                                    <span style={{ fontSize: '13px', color: '#27ae60' }}>
                                        <strong>📞</strong> {record.ownerPhone}
                                    </span>
                                )}
                            </div>

                            <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>
                                <strong>Шинж тэмдэг:</strong> {record.symptoms}
                            </div>
                            <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>
                                <strong>Онош:</strong> <span style={{ color: '#e74c3c' }}>{record.diagnosis}</span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#555' }}>
                                <strong>Эмчилгээ:</strong> <span style={{ color: '#27ae60' }}>{record.treatment}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorMedicalHistory;
