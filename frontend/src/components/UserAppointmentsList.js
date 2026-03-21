import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../apiConfig';

const UserAppointmentsList = ({ userId, refreshKey }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);

    const fetchAppointments = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/appointments/user/${userId}`);
            const data = await res.json();
            if (res.ok && data.data) {
                setAppointments(data.data);
            }
        } catch (err) {
            console.error('Захиалга татахад алдаа:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments, refreshKey]);

    const handleCancel = async (appointmentId) => {
        if (!window.confirm('Та энэ захиалгаа цуцлахдаа итгэлтэй байна уу?')) return;
        setCancellingId(appointmentId);
        try {
            const res = await fetch(`${API_URL}/appointments/${appointmentId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (res.ok) {
                alert('Захиалга амжилттай цуцлагдлаа!');
                setAppointments(prev => prev.filter(a => a._id !== appointmentId));
            } else {
                alert(data.error || 'Цуцлахад алдаа гарлаа');
            }
        } catch (err) {
            alert('Сервертэй холбогдоход алдаа гарлаа');
        } finally {
            setCancellingId(null);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString('mn-MN', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusColor = (date) => {
        const now = new Date();
        const apptDate = new Date(date);
        return apptDate > now ? '#27ae60' : '#95a5a6';
    };

    const getStatusLabel = (date) => {
        const now = new Date();
        const apptDate = new Date(date);
        return apptDate > now ? 'Хүлээгдэж байна' : 'Дууссан';
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                ⏳ Захиалгуудыг татаж байна...
            </div>
        );
    }

    return (
        <div style={{ marginTop: '30px' }}>
            <h3 style={{
                color: '#2c3e50',
                borderBottom: '2px solid #e74c3c',
                paddingBottom: '10px',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                📋 Миний захиалгууд
                <span style={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '2px 9px',
                    fontSize: '13px',
                    fontWeight: 'normal'
                }}>
                    {appointments.length}
                </span>
            </h3>

            {appointments.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '30px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '10px',
                    color: '#888',
                    fontSize: '15px'
                }}>
                    📭 Одоогоор захиалга байхгүй байна.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {appointments.map(appt => {
                        const isPast = new Date(appt.date) <= new Date();
                        const isCancelling = cancellingId === appt._id;
                        return (
                            <div key={appt._id} style={{
                                backgroundColor: 'white',
                                borderRadius: '10px',
                                padding: '16px 20px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                borderLeft: `5px solid ${getStatusColor(appt.date)}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '10px',
                                opacity: isPast ? 0.7 : 1
                            }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>
                                            🐾 {appt.petName}
                                        </span>
                                        <span style={{
                                            fontSize: '12px',
                                            backgroundColor: getStatusColor(appt.date),
                                            color: 'white',
                                            borderRadius: '10px',
                                            padding: '2px 8px'
                                        }}>
                                            {getStatusLabel(appt.date)}
                                        </span>
                                    </div>
                                    <div style={{ color: '#555', fontSize: '14px', marginBottom: '4px' }}>
                                        🩺 Эмч: {appt.doctorId
                                            ? `${appt.doctorId.firstname} ${appt.doctorId.lastname}`
                                            : 'Мэдээлэл байхгүй'}
                                    </div>
                                    <div style={{ color: '#555', fontSize: '14px', marginBottom: '4px' }}>
                                        📅 Цаг: {formatDate(appt.date)}
                                    </div>
                                    {appt.reason && (
                                        <div style={{ color: '#777', fontSize: '13px' }}>
                                            📝 Шалтгаан: {appt.reason}
                                        </div>
                                    )}
                                </div>

                                {!isPast && (
                                    <button
                                        onClick={() => handleCancel(appt._id)}
                                        disabled={isCancelling}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: isCancelling ? '#ccc' : '#e74c3c',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: isCancelling ? 'not-allowed' : 'pointer',
                                            fontWeight: 'bold',
                                            fontSize: '13px',
                                            whiteSpace: 'nowrap',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={e => { if (!isCancelling) e.target.style.backgroundColor = '#c0392b'; }}
                                        onMouseLeave={e => { if (!isCancelling) e.target.style.backgroundColor = '#e74c3c'; }}
                                    >
                                        {isCancelling ? '⏳ Цуцалж байна...' : '❌ Цуцлах'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UserAppointmentsList;
