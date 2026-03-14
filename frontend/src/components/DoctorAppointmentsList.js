import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../apiConfig';

const DoctorAppointmentsList = ({ doctorId, onAppointmentClick }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/appointments/doctor/${doctorId}`);
            const data = await response.json();
            if (response.ok) {
                setAppointments(data.data);
            }
        } catch (error) {
            console.error("Захиалгууд татахад алдаа гарлаа:", error);
        } finally {
            setLoading(false);
        }
    }, [doctorId]);

    useEffect(() => {
        if (doctorId) {
            fetchAppointments();
        }
    }, [doctorId, fetchAppointments]);

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            marginTop: '20px'
        }}>
            <h3 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px', marginBottom: '15px' }}>
                🩺 Миний захиалгууд ({appointments.length})
            </h3>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Ачааллаж байна...</div>
            ) : appointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#7f8c8d', border: '1px dashed #ced4da', borderRadius: '5px' }}>
                    Одоогоор захиалга байхгүй байна.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {appointments.map(app => {
                        const d = new Date(app.date);
                        return (
                            <div key={app._id}
                                onClick={() => onAppointmentClick && onAppointmentClick(app)}
                                style={{
                                    padding: '15px',
                                    borderLeft: '4px solid #3498db',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s, box-shadow 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <strong style={{ color: '#2c3e50', fontSize: '18px' }}>
                                        🐾 {app.petName}
                                    </strong>
                                    <span style={{
                                        backgroundColor: '#3498db',
                                        color: 'white',
                                        padding: '4px 10px',
                                        borderRadius: '15px',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}>
                                        {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div style={{ fontSize: '14px', color: '#555', marginBottom: '5px' }}>
                                    <strong>Шалтгаан:</strong> {app.reason}
                                </div>
                                <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                                    <strong>Эзэмшигч:</strong> {app.ownerId?.firstname} {app.ownerId?.lastname}
                                    {app.ownerId?.phone && ` (${app.ownerId?.phone})`}
                                </div>
                                <div style={{ fontSize: '12px', color: '#3498db', marginTop: '8px', fontStyle: 'italic' }}>
                                    👆 Дарж маягтад автоматаар бөглөнө
                                </div>
                            </div>
                        );
                    })}

                </div>
            )}
        </div>
    );
};

export default DoctorAppointmentsList;
