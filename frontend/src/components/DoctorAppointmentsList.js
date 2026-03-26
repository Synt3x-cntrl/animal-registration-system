import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../apiConfig';
import LoadingSpinner from './LoadingSpinner';

const DoctorAppointmentsList = ({ doctorId, onAppointmentClick, onSuccess }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchDate, setSearchDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const [showCompleted, setShowCompleted] = useState(false);

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/appointments/doctor/${doctorId}`);
            const data = await response.json();
            if (response.ok) {
                const sorted = data.data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setAppointments(sorted);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #3498db', paddingBottom: '10px', marginBottom: '15px' }}>
                <h3 style={{ color: '#2c3e50', margin: 0 }}>
                    🩺 Миний захиалгууд ({appointments.filter(a => a.status !== 'Completed').length})
                </h3>
                <button 
                    onClick={() => setShowCompleted(!showCompleted)}
                    style={{
                        padding: '5px 10px',
                        fontSize: '12px',
                        backgroundColor: showCompleted ? '#3498db' : '#f8f9fa',
                        color: showCompleted ? 'white' : '#7f8c8d',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {showCompleted ? '✅ Дууссаныг нуух' : '👁️ Дууссаныг харах'}
                </button>
            </div>

            <div style={{ position: 'relative', marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555', fontWeight: 'bold' }}>Огноогоор хайх:</label>
                <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
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
                <LoadingSpinner text="Захиалгуудыг ачааллаж байна..." />
            ) : appointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#7f8c8d', border: '1px dashed #ced4da', borderRadius: '5px' }}>
                    Одоогоор захиалга байхгүй байна.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {(() => {
                        let filteredAppointments = appointments;
                        
                        // 1. Filter by date
                        if (searchDate) {
                            filteredAppointments = filteredAppointments.filter(app => {
                                const d = new Date(app.date);
                                const localDateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                return localDateStr === searchDate;
                            });
                        }
                        
                        // 2. Filter by status (hide completed if toggle is off)
                        if (!showCompleted) {
                            filteredAppointments = filteredAppointments.filter(app => app.status !== 'Completed');
                        }

                        if (filteredAppointments.length === 0) {
                            return <div style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>Харуулах захиалга олдсонгүй.</div>;
                        }

                        return filteredAppointments.map(app => {
                            const d = new Date(app.date);
                            const isCompleted = app.status === 'Completed';

                            const handleMarkCompleted = async (e) => {
                                e.stopPropagation();
                                if (!window.confirm('Үйлчилгээ дууссан гэж тэмдэглэх үү?')) return;
                                try {
                                    const res = await fetch(`${API_URL}/appointments/${app._id}/status`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ status: 'Completed' })
                                    });
                                    if (res.ok) {
                                        alert('Амжилттай шинэчлэгдлээ!');
                                        fetchAppointments();
                                        if (onSuccess) onSuccess();
                                    } else {
                                        const errorData = await res.json();
                                        alert('Алдаа: ' + (errorData.error || 'Үйлчилгээг дуусгахад алдаа гарлаа'));
                                    }
                                } catch (err) {
                                    alert('Сүлжээний алдаа: ' + err.message);
                                }
                            };

                            return (
                                <div key={app._id}
                                    onClick={() => onAppointmentClick && onAppointmentClick(app)}
                                    style={{
                                        padding: '15px',
                                        borderLeft: `4px solid ${isCompleted ? '#27ae60' : '#3498db'}`,
                                        backgroundColor: isCompleted ? '#f0fdf4' : '#f8f9fa',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s, box-shadow 0.2s',
                                        opacity: isCompleted ? 0.8 : 1
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = isCompleted ? '#dcfce7' : '#e3f2fd'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = isCompleted ? '#f0fdf4' : '#f8f9fa'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <strong style={{ color: '#2c3e50', fontSize: '18px' }}>
                                                🐾 {app.petName}
                                            </strong>
                                            <span style={{ fontSize: '12px', color: '#7f8c8d' }}>
                                                ⚙️ {app.serviceType === 'Bathing' ? '🛁 Усанд оруулах' : 
                                                    app.serviceType === 'Grooming' ? '✂️ Үс засах' : 
                                                    app.serviceType === 'NailClipping' ? '💅 Хумс авах' : '🩺 Үзлэг'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                            <span style={{
                                                backgroundColor: isCompleted ? '#27ae60' : '#3498db',
                                                color: 'white',
                                                padding: '4px 10px',
                                                borderRadius: '15px',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }}>
                                                {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isCompleted && (
                                                <span style={{ fontSize: '11px', color: '#27ae60', fontWeight: 'bold' }}>✅ ДУУССАН</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>
                                        <strong>Шалтгаан:</strong> {app.reason}
                                    </div>
                                    {app.petId && (
                                        <div style={{ 
                                            fontSize: '12px', 
                                            color: '#666', 
                                            backgroundColor: '#fff', 
                                            padding: '8px', 
                                            borderRadius: '6px', 
                                            marginBottom: '10px',
                                            border: '1px solid #eee',
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '10px'
                                        }}>
                                            <span><strong>Төрөл:</strong> {app.petId.species}</span>
                                            <span><strong>Үүлдэр:</strong> {app.petId.breed || 'Тодорхойгүй'}</span>
                                            <span><strong>Нас/Хүйс:</strong> {app.petId.age || '—'} / {app.petId.gender === 'male' ? ' Эр' : ' Эм'}</span>
                                            {app.petId.weight && <span><strong>Жин:</strong> {app.petId.weight}кг</span>}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '14px', color: '#7f8c8d', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <div>
                                            <strong>Эзэмшигч:</strong> {app.ownerId?.firstname} {app.ownerId?.lastname}
                                            {app.ownerId?.phone && ` (${app.ownerId?.phone})`}
                                        </div>
                                        
                                        {!isCompleted && (
                                            <button 
                                                onClick={handleMarkCompleted}
                                                style={{
                                                    backgroundColor: '#27ae60',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '6px 12px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Дуусгах
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#3498db', marginTop: '8px', fontStyle: 'italic' }}>
                                        👆 Дарж маягтад автоматаар бөглөнө
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>
            )}
        </div>
    );
};

export default DoctorAppointmentsList;
