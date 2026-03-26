import React, { useState, useEffect } from 'react';
import API_URL from '../apiConfig';

const AppointmentForm = ({ ownerId, onAppointmentAdded, defaultPetName }) => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [allSchedules, setAllSchedules] = useState([]);      // Эмчийн бүх сул цагууд
    const [availableDates, setAvailableDates] = useState([]);  // Тухайн эмчийн сул өдрүүд
    const [filteredSchedules, setFilteredSchedules] = useState([]); // Сонгосон өдрийн цагууд

    const [pets, setPets] = useState([]);

    const [formData, setFormData] = useState({
        petName: defaultPetName || '',
        petId: '', // Added petId
        serviceType: 'Examination', // 'Examination', 'Bathing', 'Grooming'
        selectedDate: '',
        scheduleId: '',
        manualDate: '',
        manualTime: '',
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
                // If defaultPetName is provided, find its ID
                if (defaultPetName) {
                    const found = data.data.find(p => p.name === defaultPetName);
                    if (found) {
                        setFormData(prev => ({ ...prev, petId: found._id }));
                    }
                }
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

        if (formData.serviceType === 'Examination' && (!selectedDoctorId || !formData.scheduleId)) {
            setError("Эмч болон Цагаа сонгоно уу.");
            setLoading(false);
            return;
        }

        if (formData.serviceType !== 'Examination' && (!formData.manualDate || !formData.manualTime)) {
            setError("Өдөр болон Цагаа сонгоно уу.");
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
                    petId: formData.petId,
                    reason: formData.reason,
                    serviceType: formData.serviceType,
                    ownerId,
                    doctorId: formData.serviceType === 'Examination' ? selectedDoctorId : null,
                    scheduleId: formData.serviceType === 'Examination' ? formData.scheduleId : null,
                    date: formData.serviceType === 'Examination' ? undefined : `${formData.manualDate}T${formData.manualTime}`
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Цаг амжилттай захиалагдлаа!");
                setFormData({ 
                    petName: '', 
                    serviceType: 'Examination',
                    selectedDate: '', 
                    scheduleId: '', 
                    manualDate: '',
                    manualTime: '',
                    reason: '' 
                });
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
                📅 Цаг захиалах
            </h3>
            {error && <div style={{ color: 'red', marginBottom: '10px', padding: '8px', backgroundColor: '#fff5f5', borderRadius: '5px', border: '1px solid #ffcccc' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* 0. Үйлчилгээ сонгох */}
                <div>
                    <label style={labelStyle}>⚙️ Үйлчилгээний төрөл:</label>
                    <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    >
                        <option value="Examination">🩺 Эмчийн үзлэг</option>
                        <option value="Bathing">🛁 Усанд оруулах</option>
                        <option value="Grooming">✂️ Үс засах / Гоо сайхан</option>
                        <option value="NailClipping">🐾 Хумс авах</option>
                    </select>
                </div>

                {/* 1. Эмч сонгох - Зөвхөн үзлэг бол */}
                {formData.serviceType === 'Examination' && (
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
                )}

                {/* 2. Өдөр сонгох */}
                {formData.serviceType === 'Examination' ? (
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
                ) : (
                    <div>
                        <label style={labelStyle}>📆 Өдөр сонгох:</label>
                        <input
                            type="date"
                            name="manualDate"
                            value={formData.manualDate}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                )}

                {/* 3. Цаг сонгох */}
                {formData.serviceType === 'Examination' ? (
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
                ) : (
                    <div>
                        <label style={labelStyle}>🕐 Цаг сонгох:</label>
                        <input
                            type="time"
                            name="manualTime"
                            value={formData.manualTime}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>
                )}

                {/* 4. Амьтны нэр — dropdown */}
                <div>
                    <label style={labelStyle}>🐾 Амьтан:</label>
                    {defaultPetName ? (
                        <div style={{ ...inputStyle, backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                            {defaultPetName}
                        </div>
                    ) : (
                        <select
                            name="petId"
                            value={formData.petId}
                            onChange={(e) => {
                                const id = e.target.value;
                                const pet = pets.find(p => p._id === id);
                                setFormData(prev => ({ ...prev, petId: id, petName: pet ? pet.name : '' }));
                            }}
                            required
                            style={inputStyle}
                        >
                            <option value="">-- Амьтан сонгох --</option>
                            {pets.map(pet => (
                                <option key={pet._id} value={pet._id}>
                                    {pet.name} ({pet.species})
                                </option>
                            ))}
                        </select>
                    )}
                    {!defaultPetName && pets.length === 0 && (
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
                    disabled={loading || !formData.petName || (formData.serviceType === 'Examination' ? (!selectedDoctorId || !formData.scheduleId) : (!formData.manualDate || !formData.manualTime))}
                    style={{
                        padding: '12px',
                        backgroundColor: (loading || !formData.petName || (formData.serviceType === 'Examination' ? (!selectedDoctorId || !formData.scheduleId) : (!formData.manualDate || !formData.manualTime))) ? '#ccc' : '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        cursor: (loading || !formData.petName || (formData.serviceType === 'Examination' ? (!selectedDoctorId || !formData.scheduleId) : (!formData.manualDate || !formData.manualTime))) ? 'not-allowed' : 'pointer',
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
