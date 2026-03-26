import React, { useState, useEffect } from 'react';
import API_URL from '../apiConfig';

const MedicalForm = ({ onSuccess, prefillData, doctorName, doctorId }) => {
    const [formData, setFormData] = useState({
        ownerEmail: '',
        petName: '',
        doctorName: doctorName || '',
        date: new Date().toISOString().split('T')[0],
        symptoms: '',
        diagnosis: '',
    treatment: '',
        treatments: [], // Сонгосон үйлчилгээнүүд
        notes: ''
    });

    const treatmentCategories = {
        "Ерөнхий": [
            "бүртгэл", "пасспорт", "үзлэг", "туулга", "галзуу", 
            "үндсэн", "анус", "хумс dog", "шарлага", "чип", "хумс"
        ],
        "Эмчилгээ": [
            "чих", "чих/д ус", "хэвтэн", "шарх", "тайвшарх", 
            "наркоз", "cylan 250", "cylan 50", "Bim80", "klizm", 
            "vincrist", "мөөг тос"
        ]
    };
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Давтан үзлэгийн цаг захиалах state-үүд
    const [wantFollowUp, setWantFollowUp] = useState(false);
    const [followUpDate, setFollowUpDate] = useState('');
    const [followUpReason, setFollowUpReason] = useState('Давтан үзлэг');

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

    // Давтан үзлэгийн checkbox-ийг болиулбал утгыг нь цэвэрлэх
    useEffect(() => {
        if (!wantFollowUp) {
            setFollowUpDate('');
        }
    }, [wantFollowUp]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTreatmentChange = (item) => {
        setFormData(prev => {
            const currentTreatments = prev.treatments || [];
            if (currentTreatments.includes(item)) {
                return { ...prev, treatments: currentTreatments.filter(t => t !== item) };
            } else {
                return { ...prev, treatments: [...currentTreatments, item] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.ownerEmail) {
            setError("Хэрэглэгчийн Имэйл хаягийг оруулна уу.");
            return;
        }

        // Давтан үзлэг сонгосон бол огноог нь оруулсан байх шаардлагатай
        if (wantFollowUp && !followUpDate) {
            setError("Давтан үзлэгийн огноог оруулна уу эсвэл давтан үзлэгийн хэсгийг болиулна уу.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Эмнэлгийн түүх хадгалах
            const response = await fetch(`${API_URL}/medical-records`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Алдаа гарлаа");
                setLoading(false);
                return;
            }

            // 2. Захиалгыг устгах (хэрэв prefillData._ ID байвал)
            if (prefillData?._id) {
                await fetch(`${API_URL}/appointments/${prefillData._id}?received=true`, {
                    method: "DELETE",
                });
            }

            // 3. Давтан үзлэгийн цаг захиалах (сонголттой)
            if (wantFollowUp && followUpDate) {
                const ownerId = prefillData?.ownerId?._id || prefillData?.ownerId;
                const docId = doctorId || prefillData?.doctorId?._id || prefillData?.doctorId;

                if (ownerId && docId) {
                    await fetch(`${API_URL}/appointments`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            petName: formData.petName,
                            reason: followUpReason,
                            ownerId,
                            doctorId: docId,
                            date: followUpDate,
                        }),
                    });
                }
            }

            alert('Эмнэлгийн түүх амжилттай хадгалагдлаа!' + (wantFollowUp && followUpDate ? ' Давтан үзлэгийн цаг захиалагдлаа.' : ''));
            setFormData({
                ownerEmail: '',
                petName: '',
                doctorName: doctorName || '',
                date: new Date().toISOString().split('T')[0],
                symptoms: '',
                diagnosis: '',
                treatment: '',
                treatments: [],
                notes: ''
            });
            setWantFollowUp(false);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError("Сервертэй холбогдоход алдаа гарлаа: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' };

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

            {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#fff5f5', borderRadius: '6px', border: '1px solid #ffcccc' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Хэрэглэгчийн Имэйл:</label>
                        <input
                            type="email"
                            name="ownerEmail"
                            value={formData.ownerEmail}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="user@example.com"
                            required
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Амьтны нэр / ID:</label>
                        <input
                            type="text"
                            name="petName"
                            value={formData.petName}
                            onChange={handleChange}
                            style={inputStyle}
                            required
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Огноо:</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            style={inputStyle}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>Эмчийн нэр:</label>
                    <input
                        type="text"
                        name="doctorName"
                        value={formData.doctorName}
                        onChange={handleChange}
                        style={{ ...inputStyle, backgroundColor: '#f0f4f8', color: '#555' }}
                        readOnly
                        required
                    />
                </div>

                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    {/* Left Column: Treatment Selection */}
                    <div style={{ flex: '1.2', minWidth: '300px' }}>
                        <div style={{
                            padding: '20px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '12px',
                            border: '1px solid #e9ecef',
                            height: '100%',
                            boxSizing: 'border-box'
                        }}>
                            <label style={{ ...labelStyle, color: '#2c3e50', marginBottom: '15px' }}>🛠 Хийгдсэн үйлчилгээ / эмчилгээ сонгох:</label>
                            
                            {Object.entries(treatmentCategories).map(([category, items]) => (
                                <div key={category} style={{ marginBottom: '18px' }}>
                                    <div style={{ fontWeight: 'bold', color: '#3498db', marginBottom: '10px', fontSize: '15px', borderBottom: '1px solid #dee2e6', paddingBottom: '3px' }}>
                                        {category}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                                        {items.map(item => (
                                            <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#444' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.treatments.includes(item)}
                                                    onChange={() => handleTreatmentChange(item)}
                                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                />
                                                {item}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Textareas */}
                    <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={labelStyle}>Шинж тэмдэг:</label>
                            <textarea
                                name="symptoms"
                                value={formData.symptoms}
                                onChange={handleChange}
                                style={{ ...inputStyle, minHeight: '70px' }}
                                placeholder="Шинж тэмдэг... (Сонголттой)"
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Онош:</label>
                            <textarea
                                name="diagnosis"
                                value={formData.diagnosis}
                                onChange={handleChange}
                                style={{ ...inputStyle, minHeight: '70px' }}
                                placeholder="Онош... (Сонголттой)"
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Эмчилгээ ба Зөвлөмж:</label>
                            <textarea
                                name="treatment"
                                value={formData.treatment}
                                onChange={handleChange}
                                style={{ ...inputStyle, minHeight: '130px' }}
                                placeholder="Эмчилгээ, зөвлөгөө... (Сонголттой)"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>Тэмдэглэл (Дотоод хэрэгцээнд):</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        style={{ ...inputStyle, minHeight: '60px' }}
                        placeholder="Нэмэлт тэмдэглэл бичих..."
                    />
                </div>

                {/* ====== ДАВТАН ҮЗЛЭГИЙН ЦАГ ЗАХИАЛАХ (СОНГОЛТТОЙ) ====== */}
                <div style={{
                    border: '2px dashed #3498db',
                    borderRadius: '10px',
                    padding: '16px',
                    backgroundColor: '#f0f7ff'
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                        <input
                            type="checkbox"
                            checked={wantFollowUp}
                            onChange={e => setWantFollowUp(e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3498db' }}
                        />
                        <span style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '15px' }}>
                            🔄 Давтан үзлэгийн цаг захиалах <span style={{ fontWeight: 'normal', color: '#888', fontSize: '13px' }}>(сонголттой)</span>
                        </span>
                    </label>

                    {wantFollowUp && (
                        <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                            {/* Дурын огноо, цаг сонгох */}
                            <div>
                                <label style={{ ...labelStyle, color: '#2c3e50' }}>📆 Огноо, цаг сонгох:</label>
                                <input
                                    type="datetime-local"
                                    value={followUpDate}
                                    onChange={e => setFollowUpDate(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Давтан үзлэгийн шалтгаан */}
                            <div>
                                <label style={{ ...labelStyle, color: '#2c3e50' }}>📝 Шалтгаан:</label>
                                <input
                                    type="text"
                                    value={followUpReason}
                                    onChange={e => setFollowUpReason(e.target.value)}
                                    style={inputStyle}
                                    placeholder="Давтан үзлэг..."
                                />
                            </div>

                            {followUpDate && (
                                <div style={{ padding: '8px 12px', backgroundColor: '#d4edda', borderRadius: '6px', color: '#155724', fontSize: '13px' }}>
                                    ✅ Давтан үзлэгийн цаг сонгогдлоо. Хадгалах үед захиалга автоматаар үүснэ.
                                </div>
                            )}
                        </div>
                    )}
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
