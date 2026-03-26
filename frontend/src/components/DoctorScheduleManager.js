import { useState, useEffect, useCallback } from "react";
import API_URL from "../apiConfig";

function DoctorScheduleManager({ doctorId }) {
    const [schedules, setSchedules] = useState([]);
    const [bookedAppointments, setBookedAppointments] = useState([]);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [activeTab, setActiveTab] = useState("booked"); // "booked" | "available"

    const fetchSchedules = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/doctor-schedules/${doctorId}?isBooked=false`);
            const data = await response.json();
            if (response.ok) setSchedules(data.data);
        } catch (error) {
            console.error("Цагийн хуваарь татахад алдаа:", error);
        }
    }, [doctorId]);

    const fetchBookedAppointments = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/appointments/doctor/${doctorId}`);
            const data = await response.json();
            if (response.ok && data.data) setBookedAppointments(data.data);
        } catch (error) {
            console.error("Захиалгууд татахад алдаа:", error);
        }
    }, [doctorId]);

    useEffect(() => {
        if (doctorId) {
            fetchSchedules();
            fetchBookedAppointments();
        }
    }, [doctorId, fetchSchedules, fetchBookedAppointments]);

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });
        if (!date || !time) {
            setMessage({ type: "error", text: "Огноо болон Цагийг оруулна уу" });
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/doctor-schedules`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ doctorId, date: `${date}T${time}` }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage({ type: "success", text: "Цаг амжилттай үүслээ!" });
                setDate(""); setTime("");
                fetchSchedules();
            } else {
                setMessage({ type: "error", text: data.error || "Алдаа гарлаа" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Сервертэй холбогдоход алдаа" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (scheduleId) => {
        if (!window.confirm("Энэ цагийг устгахдаа итгэлтэй байна уу?")) return;
        try {
            const response = await fetch(`${API_URL}/doctor-schedules/${scheduleId}`, { method: "DELETE" });
            if (response.ok) fetchSchedules();
            else alert("Устгахад алдаа гарлаа — хэн нэгэн захиалсан байж болзошгүй.");
        } catch (error) {
            console.error("Устгахад алдаа:", error);
        }
    };

    const tabStyle = (active) => ({
        padding: '10px 24px',
        borderRadius: '50px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '700',
        fontSize: '14px',
        backgroundColor: active ? '#a2a2df' : 'transparent',
        color: active ? 'white' : '#888',
        transition: 'all 0.2s'
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f5f5f5', padding: '6px', borderRadius: '50px', width: 'fit-content' }}>
                <button style={tabStyle(activeTab === 'booked')} onClick={() => setActiveTab('booked')}>
                    📋 Захиалсан хүмүүс ({bookedAppointments.length})
                </button>
                <button style={tabStyle(activeTab === 'available')} onClick={() => setActiveTab('available')}>
                    🗓️ Цаг нэмэх
                </button>
            </div>

            {/* === BOOKED APPOINTMENTS TAB === */}
            {activeTab === 'booked' && (
                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#1a1a2e', fontSize: '17px', fontWeight: '800' }}>
                        📅 Эмчид үзүүлэх захиалсан хүмүүс
                    </h3>
                    {bookedAppointments.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#bbb', padding: '40px 0', fontSize: '15px' }}>
                            Одоогоор захиалга байхгүй байна 🐾
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {bookedAppointments.map((appt) => {
                                const d = new Date(appt.date || appt.scheduleDate);
                                const ownerName = appt.ownerName || (appt.ownerId ? `${appt.ownerId.firstname || ''} ${appt.ownerId.lastname || ''}`.trim() : 'Мэдэгдэхгүй');
                                const ownerEmail = appt.ownerEmail || appt.ownerId?.email || '—';
                                const ownerPhone = appt.ownerPhone || appt.ownerId?.phone || '—';
                                const petName = appt.petName || '—';

                                return (
                                    <div key={appt._id} style={{
                                        display: 'flex', alignItems: 'center', gap: '16px',
                                        padding: '16px 20px',
                                        borderRadius: '16px',
                                        backgroundColor: '#faf9ff',
                                        border: '1px solid #ede9fe',
                                        boxShadow: '0 2px 8px rgba(162,162,223,0.07)'
                                    }}>
                                        {/* Avatar */}
                                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#a2a2df', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '18px', flexShrink: 0 }}>
                                            {ownerName?.[0]?.toUpperCase() || '?'}
                                        </div>

                                        {/* Owner info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: '700', color: '#1a1a2e', fontSize: '15px' }}>{ownerName}</div>
                                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '4px' }}>
                                                <span style={{ color: '#888', fontSize: '13px' }}>✉️ {ownerEmail}</span>
                                                <span style={{ color: '#888', fontSize: '13px' }}>📞 {ownerPhone}</span>
                                                <span style={{ color: '#a2a2df', fontSize: '13px', fontWeight: '600' }}>🐾 {petName}</span>
                                            </div>
                                        </div>

                                        {/* Date/time badge */}
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontWeight: '700', color: '#f39c12', fontSize: '14px' }}>
                                                {d.toLocaleDateString('mn-MN')}
                                            </div>
                                            <div style={{ color: '#aaa', fontSize: '13px' }}>
                                                {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* === ADD SCHEDULE TAB === */}
            {activeTab === 'available' && (
                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#1a1a2e', fontSize: '17px', fontWeight: '800' }}>🗓️ Цагийн хуваарь нэмэх</h3>

                    <form onSubmit={handleAddSchedule} style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '160px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#555', fontSize: '13px' }}>📅 Огноо</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: '140px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#555', fontSize: '13px' }}>🕐 Цаг</label>
                            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <button type="submit" disabled={loading} style={{
                            padding: '12px 28px', backgroundColor: '#f39c12', color: 'white',
                            border: 'none', borderRadius: '50px', cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '700', fontSize: '15px', boxShadow: '0 4px 14px rgba(243,156,18,0.3)'
                        }}>
                            {loading ? '⏳ Нэмж байна...' : '+ Нэмэх'}
                        </button>
                    </form>

                    {message.text && (
                        <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '12px', backgroundColor: message.type === 'error' ? '#fdecea' : '#e8f8f2', color: message.type === 'error' ? '#e74c3c' : '#27ae60', fontWeight: '600', fontSize: '14px' }}>
                            {message.text}
                        </div>
                    )}

                    <h4 style={{ marginTop: '28px', color: '#1a1a2e', fontWeight: '700', marginBottom: '12px' }}>
                        Боломжтой цагууд ({schedules.length})
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {schedules.map(sch => {
                            const d = new Date(sch.date);
                            return (
                                <div key={sch._id} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 16px', borderRadius: '50px',
                                    border: '1.5px solid #a2a2df', backgroundColor: '#f5f4fb',
                                    color: '#1a1a2e', fontWeight: '600', fontSize: '13px'
                                }}>
                                    <span>{d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <button onClick={() => handleDelete(sch._id)}
                                        style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', padding: '0', lineHeight: 1 }}>
                                        ✖
                                    </button>
                                </div>
                            );
                        })}
                        {schedules.length === 0 && <span style={{ color: '#bbb', fontSize: '14px' }}>Сул цаг одоогоор байхгүй байна.</span>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DoctorScheduleManager;
