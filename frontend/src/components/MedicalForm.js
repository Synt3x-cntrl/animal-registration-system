import React, { useState, useEffect } from 'react';
import API_URL from '../apiConfig';

const MedicalForm = ({ onSuccess, prefillData, doctorName }) => {
    const [formData, setFormData] = useState({
        ownerEmail: '',
        petName: '',
        doctorName: doctorName || '',
        date: new Date().toISOString().split('T')[0],
        symptoms: '',
        diagnosis: '',
        treatment: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Захиалга дарахад автоматаар бөглөх
    useEffect(() => {
        if (prefillData) {
            const d = new Date(prefillData.date);
            const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            setFormData(prev => ({
                ...prev,
                ownerEmail: prefillData.ownerId?.email || '',
                petName: prefillData.petName || '',
                date: localDate,
                doctorName: doctorName || prev.doctorName,
            }));
        }
    }, [prefillData, doctorName]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!formData.ownerEmail) {
            setError("Хэрэглэгчийн Имэйл хаягийг оруулна уу.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/medical-records`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Захиалгыг устгах
                if (prefillData?._id) {
                    await fetch(`${API_URL}/appointments/${prefillData._id}`, {
                        method: "DELETE",
                    });
                }

                alert('Эмнэлгийн түүх амжилттай хадгалагдлаа! Захиалга устгагдлаа.');
                setFormData({
                    ownerEmail: '',
                    petName: '',
                    doctorName: doctorName || '',
                    date: new Date().toISOString().split('T')[0],
                    symptoms: '',
                    diagnosis: '',
                    treatment: '',
                    notes: ''
                });
                if (onSuccess) onSuccess();
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
            maxWidth: '600px',
            margin: '0 auto',
            padding: '30px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
            fontFamily: 'sans-serif'
        }}>
            <h2 style={{
                color: '#2c3e50',
                borderBottom: '2px solid #3498db',
                paddingBottom: '10px',
                marginBottom: '25px',
                fontSize: '24px'
            }}>
                Эмнэлгийн үзлэгийн маягт
            </h2>

            {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Хэрэглэгчийн Имэйл:</label>
                        <input
                            type="email"
                            name="ownerEmail"
                            value={formData.ownerEmail}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
                            placeholder="user@example.com"
                            required
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Амьтны нэр / ID:</label>
                        <input
                            type="text"
                            name="petName"
                            value={formData.petName}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
                            required
                        />
                    </div>

                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Огноо:</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Эмчийн нэр:</label>
                    <input
                        type="text"
                        name="doctorName"
                        value={formData.doctorName}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box', backgroundColor: '#f0f4f8', color: '#555' }}
                        readOnly
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Шинж тэмдэг:</label>
                    <textarea
                        name="symptoms"
                        value={formData.symptoms}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box', minHeight: '80px' }}
                        placeholder="Өвчний шинж тэмдгүүдийг бичнэ үү..."
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Онош:</label>
                    <textarea
                        name="diagnosis"
                        value={formData.diagnosis}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box', minHeight: '80px' }}
                        placeholder="Эмчийн онош..."
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Эмчилгээ ба Зөвлөмж:</label>
                    <textarea
                        name="treatment"
                        value={formData.treatment}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box', minHeight: '100px' }}
                        placeholder="Хийх эмчилгээ, уух эм, зөвлөгөө..."
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: '10px',
                        padding: '14px',
                        backgroundColor: loading ? '#ccc' : '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#2980b9')}
                    onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#3498db')}
                >
                    {loading ? "Хадгалж байна..." : "Хадгалах"}
                </button>
            </form>
        </div>
    );
};

export default MedicalForm;
