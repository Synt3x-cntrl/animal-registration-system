import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../apiConfig';
import LoadingSpinner from './LoadingSpinner';

const DoctorMedicalHistory = ({ doctorName }) => {
    const [records, setRecords] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [schedulingRecord, setSchedulingRecord] = useState(null);
    const [nextApptDate, setNextApptDate] = useState('');
    const [isScheduling, setIsScheduling] = useState(false);

    const doctorUser = JSON.parse(localStorage.getItem('user'));

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const encoded = encodeURIComponent(doctorName);
            const res = await fetch(`${API_URL}/medical-records/doctor/${encoded}`);
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

    const handleScheduleNextAppt = async (e) => {
        e.preventDefault();
        if (!nextApptDate || !schedulingRecord) return;
        setIsScheduling(true);

        try {
            // 1. Create a schedule slot
            const schedRes = await fetch(`${API_URL}/doctor-schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId: doctorUser._id, date: nextApptDate }) // Save exactly as string
            });
            const schedData = await schedRes.json();
            
            if (!schedRes.ok) throw new Error(schedData.error || "Цаг үүсгэхэд алдаа гарлаа");

            // 2. Book the appointment
            const apptRes = await fetch(`${API_URL}/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    petName: schedulingRecord.petName,
                    reason: "Давтан үзлэг",
                    ownerId: schedulingRecord.ownerId,
                    doctorId: doctorUser._id,
                    scheduleId: schedData.data._id
                })
            });
            const apptData = await apptRes.json();

            if (!apptRes.ok) throw new Error(apptData.error || "Захиалга үүсгэхэд алдаа гарлаа");

            alert("Дараагийн үзлэг амжилттай товлогдлоо!");
            setSchedulingRecord(null);
            setNextApptDate('');
        } catch (error) {
            alert(error.message);
        } finally {
            setIsScheduling(false);
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
                            
                            <div style={{ marginTop: '15px' }}>
                                <button
                                    onClick={() => setSchedulingRecord(record)}
                                    style={{
                                        padding: '8px 15px',
                                        backgroundColor: '#2980b9',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1f6391'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2980b9'}
                                >
                                    📅 Дараагийн үзлэг товлох
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {schedulingRecord && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', width: '90%', maxWidth: '400px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            🗓 Дараагийн үзлэг товлох
                        </h3>
                        <p style={{ marginBottom: '15px', fontSize: '14px', color: '#555' }}>
                            <strong>Амьтан:</strong> {schedulingRecord.petName}
                        </p>
                        
                        <form onSubmit={handleScheduleNextAppt} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>Огноо болон цаг:</label>
                                <input 
                                    type="datetime-local" 
                                    value={nextApptDate}
                                    onChange={(e) => setNextApptDate(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                                />
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setSchedulingRecord(null)}
                                    style={{ padding: '8px 15px', backgroundColor: '#e0e0e0', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                >
                                    Цуцлах
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isScheduling}
                                    style={{ padding: '8px 15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: isScheduling ? 'not-allowed' : 'pointer', opacity: isScheduling ? 0.7 : 1 }}
                                >
                                    {isScheduling ? 'Уншиж байна...' : 'Товлох'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorMedicalHistory;
