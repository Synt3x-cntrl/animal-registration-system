import React, { useState, useEffect } from 'react';
import API_URL from '../apiConfig';

const AppointmentForm = ({ ownerId, onAppointmentAdded }) => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [allSchedules, setAllSchedules] = useState([]);      // Эмчийн бүх сул цагууд
    const [availableDates, setAvailableDates] = useState([]);  // Тухайн эмчийн сул өдрүүд
    const [filteredSchedules, setFilteredSchedules] = useState([]); // Сонгосон өдрийн цагууд

    const [pets, setPets] = useState([]);

    const [formData, setFormData] = useState({
        petName: '',
        selectedDate: '',
        scheduleId: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Эмч нарын жагсаалтыг татавч хэрэглэгчийн амьтдыг татах
    useEffect(() => {
        fetchDoctors();
        if (ownerId) {
            fetchPets(ownerId);
        }
    }, [ownerId]);

    // Эмч сонгоход цагийн хуваарийг татах
    useEffect(() => {
        if (selectedDoctorId) {
            fetchSchedules(selectedDoctorId);
            setFormData(prev => ({ ...prev, selectedDate: '', scheduleId: '' }));
            setAvailableDates([]);
            setFilteredSchedules([]);
        } else {
            setAllSchedules([]);
            setAvailableDates([]);
            setFilteredSchedules([]);
        }
    }, [selectedDoctorId]);

    // Өдөр сонгоход тэр өдрийн цагийг шүүх
    useEffect(() => {
        if (formData.selectedDate && allSchedules.length > 0) {
            const filtered = allSchedules.filter(sch => {
                const d = new Date(sch.date);
                const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                return localDate === formData.selectedDate;
            });
            setFilteredSchedules(filtered);
            setFormData(prev => ({ ...prev, scheduleId: '' })); // цаг reset
        } else {
            setFilteredSchedules([]);
        }
    }, [formData.selectedDate, allSchedules]);

    const fetchDoctors = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/users`);
            const data = await response.json();
            if (response.ok && data.data) {
                const docs = data.data.filter(u => u.role === 'doctor');
                setDoctors(docs);
            }
        } catch (error) {
            console.error("Эмч нарын жагсаалт татахад алдаа:", error);
        }
    };

    const fetchPets = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/pets/user/${userId}`);
            const data = await response.json();
            if (response.ok && data.data) {
                setPets(data.data);
            }
        } catch (error) {
            console.error("Амьтдын жагсаалт татахад алдаа:", error);
        }
    };

    const fetchSchedules = async (docId) => {
        try {
            const response = await fetch(`${API_URL}/doctor-schedules/${docId}?isBooked=false`);
            const data = await response.json();
            if (response.ok) {
                const schedules = data.data;
                setAllSchedules(schedules);

                // Өвөрмөц өдрүүдийг авах
                const dateSet = new Set();
                schedules.forEach(sch => {
                    const d = new Date(sch.date);
                    const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    dateSet.add(localDate);
                });
                // Өдрүүдийг эрэмбэлэх
                const sortedDates = Array.from(dateSet).sort();
                setAvailableDates(sortedDates);
            }
        } catch (error) {
            console.error("Цагийн хуваарь татахад алдаа гарлаа:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!selectedDoctorId || !formData.scheduleId) {
            setError("Эмч болон Цагаа сонгоно уу.");
            setLoading(false);
            return;
        }

        if (!formData.petName) {
            setError("Амьтнаа сонгоно уу.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    petName: formData.petName,
                    reason: formData.reason,
                    ownerId,
                    doctorId: selectedDoctorId,
                    scheduleId: formData.scheduleId
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Цаг амжилттай захиалагдлаа!");
                setFormData({ petName: '', selectedDate: '', scheduleId: '', reason: '' });
                setSelectedDoctorId('');
                if (onAppointmentAdded) onAppointmentAdded(data.data);
            } else {
                setError(data.error || "Алдаа гарлаа");
            }
        } catch (err) {
            setError("Сервертэй холбогдоход алдаа гарлаа: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
        fontSize: '14px'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#555'
    };

    return (
        <div style={{
            maxWidth: '500px',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            marginBottom: '20px'
        }}>
            <h3 style={{ color: '#2c3e50', borderBottom: '2px solid #e74c3c', paddingBottom: '10px', marginBottom: '15px' }}>
                📅 Эмчид цаг захиалах
            </h3>
            {error && <div style={{ color: 'red', marginBottom: '10px', padding: '8px', backgroundColor: '#fff5f5', borderRadius: '5px', border: '1px solid #ffcccc' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                {/* 1. Эмч сонгох */}
                <div>
                    <label style={labelStyle}>🩺 Эмч сонгох:</label>
                    <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        required
                        style={inputStyle}
                    >
                        <option value="">-- Эмч сонгох --</option>
                        {doctors.map(doc => (
                            <option key={doc._id} value={doc._id}>
                                {doc.firstname} {doc.lastname} (Эмч)
                            </option>
                        ))}
                    </select>
                </div>

                {/* 2. Өдөр сонгох — зөвхөн эмч захиалга байгаа өдрүүд */}
                <div>
                    <label style={labelStyle}>📆 Өдөр сонгох:</label>
                    <select
                        name="selectedDate"
                        value={formData.selectedDate}
                        onChange={handleChange}
                        required
                        disabled={!selectedDoctorId || availableDates.length === 0}
                        style={inputStyle}
                    >
                        <option value="">
                            {!selectedDoctorId
                                ? "-- Эхлээд эмч сонгоно уу --"
                                : availableDates.length === 0
                                    ? "Боломжтой өдөр байхгүй"
                                    : "-- Өдөр сонгох --"
                            }
                        </option>
                        {availableDates.map(dateStr => {
                            const d = new Date(dateStr + 'T00:00:00');
                            return (
                                <option key={dateStr} value={dateStr}>
                                    {d.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* 3. Цаг сонгох — сонгосон өдрийн боломжтой цагууд */}
                <div>
                    <label style={labelStyle}>🕐 Цаг сонгох:</label>
                    <select
                        name="scheduleId"
                        value={formData.scheduleId}
                        onChange={handleChange}
                        required
                        disabled={!formData.selectedDate || filteredSchedules.length === 0}
                        style={inputStyle}
                    >
                        <option value="">
                            {!formData.selectedDate
                                ? "-- Эхлээд өдөр сонгоно уу --"
                                : filteredSchedules.length === 0
                                    ? "Тэр өдөр сул цаг байхгүй"
                                    : "-- Цаг сонгох --"
                            }
                        </option>
                        {filteredSchedules.map(sch => {
                            const d = new Date(sch.date);
                            return (
                                <option key={sch._id} value={sch._id}>
                                    {d.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* 4. Амьтны нэр — dropdown */}
                <div>
                    <label style={labelStyle}>🐾 Амьтны нэр сонгох:</label>
                    <select
                        name="petName"
                        value={formData.petName}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    >
                        <option value="">-- Амьтан сонгох --</option>
                        {pets.map(pet => (
                            <option key={pet._id} value={pet.name}>
                                {pet.name} ({pet.species})
                            </option>
                        ))}
                    </select>
                    {pets.length === 0 && (
                        <p style={{ color: '#e67e22', fontSize: '13px', marginTop: '5px', margin: '5px 0 0 0' }}>
                            ⚠️ Та амьтан бүртгэлгүй байна. Эхлээд "Миний амьтад" хэсэгт амьтан нэмнэ үү.
                        </p>
                    )}
                </div>

                {/* 5. Шалтгаан */}
                <div>
                    <label style={labelStyle}>📝 Шалтгаан:</label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        required
                        style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                        placeholder="Ямар шалтгаанаар цаг авах гэж байна вэ?"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !selectedDoctorId || !formData.scheduleId || !formData.petName}
                    style={{
                        padding: '12px',
                        backgroundColor: (loading || !selectedDoctorId || !formData.scheduleId || !formData.petName) ? '#ccc' : '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        cursor: (loading || !selectedDoctorId || !formData.scheduleId || !formData.petName) ? 'not-allowed' : 'pointer',
                        fontSize: '15px'
                    }}
                >
                    {loading ? "Захиалж байна..." : "✅ Захиалах"}
                </button>
            </form>
        </div>
    );
};

export default AppointmentForm;
