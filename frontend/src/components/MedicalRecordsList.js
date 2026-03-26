import React, { useEffect, useState } from 'react';
import API_URL from '../apiConfig';
import LoadingSpinner from './LoadingSpinner';

const MedicalRecordsList = ({ userId, petName, limit = 3 }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const visibleRecords = showAll ? records : records.slice(0, limit);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await fetch(`${API_URL}/medical-records/user/${userId}`);
                const data = await response.json();
                if (response.ok) {
                    let dataToSet = data.data;
                    if (petName) {
                        dataToSet = dataToSet.filter(r => r.petName === petName);
                    }
                    setRecords(dataToSet);
                }
            } catch (err) {
                console.error("Эмчийн зөвлөгөө татахад алдаа:", err);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchRecords();
        }
    }, [userId]);

    if (loading) return <LoadingSpinner text="Ачааллаж байна..." />;

    if (records.length === 0) {
        return (
            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px', textAlign: 'center', color: '#777' }}>
                Одоогоор эмчийн зөвлөгөө, үзлэгийн түүх алга байна.
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {visibleRecords.map(record => (
                <div key={record._id} style={{
                    padding: '20px',
                    borderLeft: '5px solid #3498db',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, color: '#2c3e50' }}>Амьтан: {record.petName}</h4>
                        <span style={{ color: '#7f8c8d', fontSize: '14px' }}>
                            {new Date(record.date).toLocaleDateString()}
                        </span>
                    </div>
                    <div style={{ marginBottom: '8px' }}><strong>Эмч:</strong> {record.doctorName}</div>
                    {record.ownerEmail && (
                        <div style={{ marginBottom: '8px', color: '#2980b9' }}>
                            <strong>📧 Gmail:</strong> {record.ownerEmail}
                        </div>
                    )}
                    {record.ownerPhone && (
                        <div style={{ marginBottom: '8px', color: '#27ae60' }}>
                            <strong>📞 Утас:</strong> {record.ownerPhone}
                        </div>
                    )}
                    <div style={{ marginBottom: '8px' }}><strong>Шинж тэмдэг:</strong> {record.symptoms}</div>
                    <div style={{ marginBottom: '8px' }}><strong>Онош:</strong> <span style={{ color: '#e74c3c' }}>{record.diagnosis}</span></div>
                    <div style={{ marginBottom: '8px' }}><strong>Эмчилгээ/Зөвлөгөө:</strong> <span style={{ color: '#27ae60' }}>{record.treatment}</span></div>
                    
                    {record.treatments && record.treatments.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                            <strong>Хийгдсэн үйлчилгээ:</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                                {record.treatments.map((t, idx) => (
                                    <span key={idx} style={{
                                        backgroundColor: '#e1f5fe',
                                        color: '#0288d1',
                                        padding: '4px 10px',
                                        borderRadius: '15px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        border: '1px solid #b3e5fc'
                                    }}>
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {record.notes && (
                        <div style={{ marginTop: '10px', fontSize: '13px', fontStyle: 'italic', color: '#666', backgroundColor: '#fdfdfd', padding: '8px', borderRadius: '4px', borderLeft: '3px solid #eee' }}>
                            <strong>Тэмдэглэл:</strong> {record.notes}
                        </div>
                    )}
                </div>
            ))}

            {records.length > 3 && (
                <button 
                    onClick={() => setShowAll(!showAll)}
                    style={{
                        padding: '10px',
                        backgroundColor: 'transparent',
                        color: '#3498db',
                        border: '1px solid #3498db',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                        marginTop: '10px'
                    }}
                    onMouseEnter={(e) => { e.target.style.backgroundColor = '#3498db'; e.target.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#3498db'; }}
                >
                    {showAll ? '🔼 Бага харах' : `🔽 Бүгдийг харах (${records.length})`}
                </button>
            )}
        </div>
    );
};

export default MedicalRecordsList;
