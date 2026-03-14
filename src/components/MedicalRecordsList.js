import React, { useEffect, useState } from 'react';

const MedicalRecordsList = ({ userId }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/v1/medical-records/user/${userId}`);
                const data = await response.json();
                if (response.ok) {
                    setRecords(data.data);
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

    if (loading) return <div>Ачааллаж байна...</div>;

    if (records.length === 0) {
        return (
            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px', textAlign: 'center', color: '#777' }}>
                Одоогоор эмчийн зөвлөгөө, үзлэгийн түүх алга байна.
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {records.map(record => (
                <div key={record._id} style={{
                    padding: '20px',
                    borderLeft: '5px solid #3498db',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
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
                    <div><strong>Эмчилгээ/Зөвлөгөө:</strong> <span style={{ color: '#27ae60' }}>{record.treatment}</span></div>
                </div>
            ))}
        </div>
    );
};

export default MedicalRecordsList;
