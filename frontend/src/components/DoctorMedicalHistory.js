import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../apiConfig';
import LoadingSpinner from './LoadingSpinner';

const DoctorMedicalHistory = ({ doctorName }) => {
    const [records, setRecords] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Шүүлтийн state-үүд
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [filterMonth, setFilterMonth] = useState('All');
    const [filterDate, setFilterDate] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

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

    // Шүүх логик
    useEffect(() => {
        let result = records;

        // 1. Хайлт (Gmail, Утас, Амьтны нэр)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(r =>
                (r.ownerEmail || '').toLowerCase().includes(q) ||
                (r.ownerPhone || '').toLowerCase().includes(q) ||
                (r.petName || '').toLowerCase().includes(q)
            );
        }

        // 2. Жилээр шүүх
        if (filterYear && filterYear !== 'All') {
            result = result.filter(r => {
                const d = new Date(r.date);
                return d.getFullYear().toString() === filterYear;
            });
        }

        // 3. Сараар шүүх
        if (filterMonth && filterMonth !== 'All') {
            result = result.filter(r => {
                const d = new Date(r.date);
                return (d.getMonth() + 1).toString() === filterMonth;
            });
        }

        // 4. Нарийвчилсан огноогоор шүүх
        if (filterDate) {
            result = result.filter(r => {
                const d = new Date(r.date);
                const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                return localDateStr === filterDate;
            });
        }

        // 5. Хугацаагаар шүүх (Заасан хоёр огнооны хооронд)
        if (filterStartDate || filterEndDate) {
            result = result.filter(r => {
                const recordDate = r.date; // YYYY-MM-DD
                let match = true;
                if (filterStartDate && recordDate < filterStartDate) match = false;
                if (filterEndDate && recordDate > filterEndDate) match = false;
                return match;
            });
        }

        setFiltered(result);
    }, [records, searchQuery, filterYear, filterMonth, filterDate]);

    const stats = {
        totalTreatments: filtered.length,
        uniquePets: new Set(filtered.map(r => r.petName)).size
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
            <h3 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📋 Эмнэлгийн түүх ({filtered.length})</span>
                {records.length > 0 && (
                    <button 
                        onClick={fetchRecords} 
                        style={{ fontSize: '12px', padding: '5px 10px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        🔄 Шинэчлэх
                    </button>
                )}
            </h3>

            {/* Статистик */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '150px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px', borderLeft: '5px solid #2196f3' }}>
                    <div style={{ fontSize: '12px', color: '#1976d2', fontWeight: 'bold', textTransform: 'uppercase' }}>Нийт үзлэг</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0d47a1' }}>{stats.totalTreatments}</div>
                </div>
                <div style={{ flex: '1', minWidth: '150px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', borderLeft: '5px solid #4caf50' }}>
                    <div style={{ fontSize: '12px', color: '#388e3c', fontWeight: 'bold', textTransform: 'uppercase' }}>Үйлчлүүлсэн амьтад</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1b5e20' }}>{stats.uniquePets}</div>
                </div>
            </div>

            {/* Шүүлтүүрүүд */}
            <div style={{ backgroundColor: '#fdfdfd', padding: '15px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#666' }}>🔍 Шүүлтүүр</div>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1', minWidth: '120px' }}>
                        <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px', color: '#888' }}>Жил:</label>
                        <select 
                            value={filterYear} 
                            onChange={(e) => { setFilterYear(e.target.value); setFilterDate(''); }}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                        >
                            <option value="All">Бүгд</option>
                            {Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()).map(y => (
                                <option key={y} value={y}>{y} он</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ flex: '1', minWidth: '120px' }}>
                        <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px', color: '#888' }}>Сар:</label>
                        <select 
                            value={filterMonth} 
                            onChange={(e) => { setFilterMonth(e.target.value); setFilterDate(''); }}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                        >
                            <option value="All">Бүгд</option>
                            {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(m => (
                                <option key={m} value={m}>{m} сар</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ flex: '1', minWidth: '150px' }}>
                        <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px', color: '#888' }}>Эхлэх:</label>
                        <input 
                            type="date" 
                            value={filterStartDate}
                            onChange={(e) => { 
                                setFilterStartDate(e.target.value);
                                if (e.target.value) {
                                    setFilterYear('All');
                                    setFilterMonth('All');
                                    setFilterDate('');
                                }
                            }}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div style={{ flex: '1', minWidth: '150px' }}>
                        <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px', color: '#888' }}>Дуусах:</label>
                        <input 
                            type="date" 
                            value={filterEndDate}
                            onChange={(e) => { 
                                setFilterEndDate(e.target.value);
                                if (e.target.value) {
                                    setFilterYear('All');
                                    setFilterMonth('All');
                                    setFilterDate('');
                                }
                            }}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '15px', position: 'relative' }}>
                    <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px', color: '#888' }}>Хайлт:</label>
                    <span style={{ position: 'absolute', left: '12px', top: '34px', fontSize: '14px' }}>🔍</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Амьтан, Gmail эсвэл утасаар хайх..."
                        style={{
                            width: '100%',
                            padding: '8px 10px 8px 35px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '14px'
                        }}
                    />
                </div>
                
                {(filterYear !== 'All' || filterMonth !== 'All' || filterDate || filterStartDate || filterEndDate || searchQuery) && (
                    <button 
                        onClick={() => {
                            setFilterYear('All');
                            setFilterMonth('All');
                            setFilterDate('');
                            setFilterStartDate('');
                            setFilterEndDate('');
                            setSearchQuery('');
                        }}
                        style={{ marginTop: '10px', fontSize: '12px', color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        ❌ Шүүлтийг цэвэрлэх
                    </button>
                )}
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
                            
                            {record.treatments && record.treatments.length > 0 && (
                                <div style={{ marginTop: '10px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        {record.treatments.map((t, idx) => (
                                            <span key={idx} style={{
                                                backgroundColor: '#e1f5fe',
                                                color: '#0288d1',
                                                padding: '2px 8px',
                                                borderRadius: '10px',
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

                            {record.notes && (
                                <div style={{ marginTop: '10px', fontSize: '12px', fontStyle: 'italic', color: '#666', backgroundColor: '#fff', padding: '5px', borderRadius: '4px', border: '1px solid #eee' }}>
                                    <strong>Тэмдэглэл:</strong> {record.notes}
                                </div>
                            )}
                            
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
