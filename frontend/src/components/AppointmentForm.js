import React, { useState, useEffect } from 'react';
import API_URL from '../apiConfig';

const AppointmentForm = ({ ownerId, onAppointmentAdded }) => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [schedules, setSchedules] = useState([]);

    const [formData, setFormData] = useState({
        petName: '',
        scheduleId: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch doctors on mount
    useEffect(() => {
        fetchDoctors();
    }, []);

    // Fetch schedules when doctor changes
    useEffect(() => {
        if (selectedDoctorId) {
            fetchSchedules(selectedDoctorId);
            setFormData(prev => ({ ...prev, scheduleId: '' })); // reset schedule
        } else {
            setSchedules([]);
        }
    }, [selectedDoctorId]);

    const fetchDoctors = async () => {
        try {
            // Note: Ideally we'd have a specific endpoint to list doctors. 
            // If not, we can list users where role='doctor'. 
            // Assuming an endpoint `/users?role=doctor` or `/auth/doctors` exists, 
            // or we might need to create it. We will use a mock fetching approach for now 
            // assuming the backend has a way or we will add one.
            // Let's assume we add `GET /auth/users?role=doctor` or similar.
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

    const fetchSchedules = async (docId) => {
        try {
            const response = await fetch(`${API_URL}/doctor-schedules/${docId}?isBooked=false`);
            const data = await response.json();
            if (response.ok) {
                setSchedules(data.data);
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
                setFormData({ petName: '', scheduleId: '', reason: '' });
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
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Эмч сонгох:</label>
                    <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    >
                        <option value="">-- Сонгох --</option>
                        {doctors.map(doc => (
                            <option key={doc._id} value={doc._id}>
                                {doc.firstname} {doc.lastname} (Эмч)
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Боломжтой цагууд:</label>
                    <select
                        name="scheduleId"
                        value={formData.scheduleId}
                        onChange={handleChange}
                        required
                        disabled={!selectedDoctorId || schedules.length === 0}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    >
                        <option value="">{schedules.length === 0 && selectedDoctorId ? "Сул цаг байхгүй" : "-- Цаг сонгох --"}</option>
                        {schedules.map(sch => {
                            const d = new Date(sch.date);
                            return (
                                <option key={sch._id} value={sch._id}>
                                    {d.toLocaleDateString()} - {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Амьтны нэр / ID:</label>
                    <input
                        type="text"
                        name="petName"
                        value={formData.petName}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Шалтгаан:</label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', minHeight: '60px', boxSizing: 'border-box' }}
                        placeholder="Ямар шалтгаанаар цаг авах гэж байна вэ?"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !selectedDoctorId || !formData.scheduleId}
                    style={{
                        padding: '12px',
                        backgroundColor: (loading || !selectedDoctorId || !formData.scheduleId) ? '#ccc' : '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        cursor: (loading || !selectedDoctorId || !formData.scheduleId) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? "Захиалж байна..." : "Захиалах"}
                </button>
            </form>
        </div>
    );
};

export default AppointmentForm;
