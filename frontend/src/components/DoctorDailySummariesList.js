import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../apiConfig';
import LoadingSpinner from './LoadingSpinner';

const DoctorDailySummariesList = ({ doctorId, doctorName }) => {
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form states
    const [showForm, setShowForm] = useState(false);
    const [notes, setNotes] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const fetchSummaries = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/daily-summaries/doctor/${doctorId}`);
            const data = await response.json();
            if (response.ok) {
                setSummaries(data.data);
            }
        } catch (error) {
            console.error("Тайлангууд татахад алдаа гарлаа:", error);
        } finally {
            setLoading(false);
        }
    }, [doctorId]);

    useEffect(() => {
        if (doctorId) {
            fetchSummaries();
        }
    }, [doctorId, fetchSummaries]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setSubmitError(null);

        const today = new Date();
        // Get local date string YYYY-MM-DD
        const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        try {
            const response = await fetch(`${API_URL}/daily-summaries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    doctorId,
                    doctorName,
                    date: localDate,
                    notes
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setSubmitError(data.error || "Алдаа гарлаа");
                setSubmitLoading(false);
                return;
            }

            alert('Өдрийн тайлан амжилттай хадгалагдлаа!');
            setNotes('');
            setShowForm(false);
            fetchSummaries(); // Refresh the list
        } catch (err) {
            setSubmitError("Сервертэй холбогдоход алдаа гарлаа: " + err.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            marginTop: '20px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2ecc71', paddingBottom: '10px', marginBottom: '15px' }}>
                <h3 style={{ color: '#27ae60', margin: 0 }}>
                    📊 Миний өдрийн тайлангууд ({summaries.length})
                </h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        padding: '8px 15px',
                        backgroundColor: showForm ? '#e74c3c' : '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'background-color 0.2s'
                    }}
                >
                    {showForm ? 'Болих' : '+ Өдрийн тайлан үүсгэх'}
                </button>
            </div>

            {showForm && (
                <div style={{
                    marginBottom: '20px',
                    padding: '20px',
                    backgroundColor: '#f9fbf9',
                    border: '1px solid #d4edda',
                    borderRadius: '8px'
                }}>
                    <h4 style={{ marginTop: 0, color: '#2c3e50' }}>Өнөөдрийн багцалсан тайлан хадгалах</h4>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>Энэхүү үйлдэл нь таны өнөөдрийн хийсэн бүх үзлэгийн түүхийг нэгтгэн тайлан болгон хадгалах болно.</p>
                    
                    {submitError && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#fff5f5', borderRadius: '6px', border: '1px solid #ffcccc' }}>{submitError}</div>}

                    <form onSubmit={handleSubmit}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold', fontSize: '14px' }}>Нэмэлт тэмдэглэл (заавал биш):</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #ced4da',
                                boxSizing: 'border-box',
                                minHeight: '80px',
                                marginBottom: '15px'
                            }}
                            placeholder="Өнөөдрийн ажлын тухай товч тэмдэглэл..."
                        />
                        <button
                            type="submit"
                            disabled={submitLoading}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: submitLoading ? '#ccc' : '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: submitLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {submitLoading ? 'Хадгалж байна...' : 'Хадгалах'}
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <LoadingSpinner />
            ) : summaries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#7f8c8d', border: '1px dashed #ced4da', borderRadius: '5px' }}>
                    Одоогоор өдрийн тайлан байхгүй байна.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {summaries.map(summary => (
                        <div key={summary._id} style={{
                            padding: '15px',
                            borderLeft: '4px solid #2ecc71',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <strong style={{ color: '#2c3e50', fontSize: '16px' }}>
                                    📅 Огноо: {summary.date}
                                </strong>
                                <span style={{
                                    backgroundColor: '#2ecc71',
                                    color: 'white',
                                    padding: '4px 10px',
                                    borderRadius: '15px',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}>
                                    Үзсэн амьтад: {summary.totalPatientsSeen}
                                </span>
                            </div>
                            {summary.notes && (
                                <div style={{ fontSize: '14px', color: '#555', marginTop: '10px', backgroundColor: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #eee' }}>
                                    <strong>Тэмдэглэл:</strong> {summary.notes}
                                </div>
                            )}
                            <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '10px' }}>
                                Үүсгэсэн: {new Date(summary.createdAt).toLocaleString('mn-MN')}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorDailySummariesList;
