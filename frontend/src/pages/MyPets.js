import { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import PetCard from "../components/PetCard";
import PetForm from "../components/PetForm";
import PassportCard from "../components/PassportCard";
import AppointmentForm from "../components/AppointmentForm";
import API_URL from "../apiConfig";

function MyPets() {
    const [user, setUser] = useState(null);
    const [pets, setPets] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [loadingPets, setLoadingPets] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [editingPet, setEditingPet] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            if (parsedUser.role === 'user') {
                fetchPets(parsedUser._id);
                fetchAppointments(parsedUser._id);
                fetchMedicalRecords(parsedUser._id);
            }
        }
    }, []);

    const fetchPets = async (userId) => {
        setLoadingPets(true);
        try {
            const response = await fetch(`${API_URL}/pets/user/${userId}`);
            const data = await response.json();
            if (response.ok) {
                setPets(data.data);
            }
        } catch (error) {
            console.error("Амьтныг татахад алдаа гарлаа:", error);
        } finally {
            setLoadingPets(false);
        }
    };

    const fetchAppointments = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/appointments/user/${userId}`);
            const data = await response.json();
            if (response.ok) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const futureAppts = data.data.filter(app => new Date(app.date) >= today);
                setAppointments(futureAppts);
            }
        } catch (error) {
            console.error("Цаг татахад алдаа гарлаа:", error);
        }
    };

    const fetchMedicalRecords = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/medical-records/user/${userId}`);
            const data = await response.json();
            if (response.ok) {
                setMedicalRecords(data.data);
            }
        } catch (error) {
            console.error("Эмнэлгийн түүх татахад алдаа гарлаа:", error);
        }
    };

    const getNextAppointment = (petName) => {
        if (!petName) return null;
        const petAppts = appointments.filter(a => a.petName?.toLowerCase().trim() === petName.toLowerCase().trim());
        if (petAppts.length === 0) return null;
        petAppts.sort((a, b) => new Date(a.date) - new Date(b.date));
        return petAppts[0].date;
    };

    const handlePetAdded = (newPet) => {
        setPets([newPet, ...pets]);
    };

    const handlePetUpdated = (updatedPet) => {
        setPets(prev => prev.map(p => p._id === updatedPet._id ? updatedPet : p));
        setEditingPet(null);
    };

    const handleRequestPassport = async (petId) => {
        try {
            const response = await fetch(`${API_URL}/pets/${petId}/request-passport`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                setPets(prev => prev.map(p => p._id === petId ? data.data : p));
                setSelectedPet(data.data);
            } else {
                alert(data.error || "Алдаа гарлаа");
            }
        } catch (error) {
            console.error("Пасспорт хүсэх үед алдаа гарлаа:", error);
            alert("Пасспорт хүсэх үед алдаа гарлаа");
        }
    };

    if (!user) {
        return (
            <div style={{ marginTop: "50px", textAlign: "center", padding: "40px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>Та системд нэвтрээгүй байна</h3>
                <p style={{ color: "#6c757d", marginBottom: "25px" }}>Энэ хуудсыг үзэхийн тулд нэвтэрч орно уу.</p>
                <a href="/login" style={{ padding: "10px 25px", backgroundColor: "var(--primary-color, #007bff)", color: "white", textDecoration: "none", borderRadius: "5px", fontWeight: "bold" }}>Нэвтрэх</a>
            </div>
        );
    }

    // 1. EDIT MODE
    if (editingPet) {
        return (
            <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <button 
                    onClick={() => setEditingPet(null)} 
                    style={{ padding: '10px 22px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
                >
                    ⬅ Буцах
                </button>
                <PetForm
                    existingPet={editingPet}
                    userId={user._id}
                    onPetUpdated={handlePetUpdated}
                    onCancel={() => setEditingPet(null)}
                />
            </div>
        );
    }

    // 2. DETAILS MODE
    if (selectedPet) {
        const petRecords = medicalRecords.filter(r => r.petName?.toLowerCase().trim() === selectedPet.name?.toLowerCase().trim());
        return (
            <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
                <button 
                    onClick={() => setSelectedPet(null)}
                    style={{ padding: '10px 22px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
                >
                    ⬅ Буцах
                </button>
                
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {/* Left Column: Pet Info & History */}
                    <div style={{ flex: '2 1 600px' }}>
                        <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '32px', boxShadow: '0 12px 40px rgba(0,0,0,0.08)', display: 'flex', gap: '40px', flexWrap: 'wrap', marginBottom: '40px', border: '1px solid #f0f0f0' }}>
                            <div style={{ flex: '1 1 300px', maxWidth: '400px', height: '300px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                                <img src={selectedPet.imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"} alt={selectedPet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: '2 1 400px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #f39c12', paddingBottom: '15px' }}>
                                    <h2 style={{ color: '#2c3e50', margin: 0, fontSize: '32px', fontWeight: '800' }}>🐾 {selectedPet.name}</h2>
                                    <button 
                                        onClick={() => document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' })}
                                        style={{ padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 10px rgba(231, 76, 60, 0.3)' }}
                                    >
                                        📅 Цаг авах
                                    </button>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginTop: '25px', fontSize: '17px' }}>
                                    <div><span style={{ color: '#7f8c8d' }}>Төрөл:</span> <strong style={{ color: '#2c3e50' }}>{selectedPet.species}</strong></div>
                                    <div><span style={{ color: '#7f8c8d' }}>Нас:</span> <strong style={{ color: '#2c3e50' }}>{selectedPet.age}</strong></div>
                                    <div><span style={{ color: '#7f8c8d' }}>Хүйс:</span> <strong style={{ color: '#2c3e50' }}>{selectedPet.gender}</strong></div>
                                    <div style={{ color: '#27ae60' }}>🏥 <span style={{ color: '#7f8c8d' }}>Үзүүлсэн тоо:</span> <strong>{petRecords.length} удаа</strong></div>
                                    <div><span style={{ color: '#7f8c8d' }}>Үүлдэр:</span> <strong style={{ color: '#2c3e50' }}>{selectedPet.breed || 'Мэдэгдэхгүй'}</strong></div>
                                    <div><span style={{ color: '#7f8c8d' }}>Өнгө:</span> <strong style={{ color: '#2c3e50' }}>{selectedPet.color || 'Мэдэгдэхгүй'}</strong></div>
                                    <div><span style={{ color: '#7f8c8d' }}>Жин:</span> <strong style={{ color: '#2c3e50' }}>{selectedPet.weight ? `${selectedPet.weight} кг` : 'Мэдэгдэхгүй'}</strong></div>

                                    {/* Passport UI */}
                                    <div style={{ gridColumn: 'span 2', marginTop: '5px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '16px', border: '1px solid #e9ecef' }}>
                                        <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '18px' }}>🛂 Амьтны Пасспорт</h4>
                                        {(!selectedPet.passportStatus || selectedPet.passportStatus === 'none' || selectedPet.passportStatus === 'rejected') && (
                                            <div>
                                                {selectedPet.passportStatus === 'rejected' && <p style={{ color: '#e74c3c', marginTop: 0, marginBottom: '10px', fontSize: '14px' }}>Өмнөх хүсэлт цуцлагдсан байна.</p>}
                                                <button 
                                                    onClick={() => handleRequestPassport(selectedPet._id)}
                                                    style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: '0.2s' }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
                                                >
                                                    Пасспорт хүсэх
                                                </button>
                                            </div>
                                        )}
                                        {selectedPet.passportStatus === 'requested' && (
                                            <div style={{ color: '#f39c12', fontWeight: 'bold', fontSize: '15px', padding: '10px', backgroundColor: 'rgba(243, 156, 18, 0.1)', borderRadius: '8px' }}>
                                                ⏳ Хүсэлт илгээгдсэн, эмч зөвшөөрөхийг хүлээж байна...
                                            </div>
                                        )}
                                        {selectedPet.passportStatus === 'approved' && (
                                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                                <PassportCard pet={selectedPet} />
                                            </div>
                                        )}
                                    </div>

                                    {getNextAppointment(selectedPet.name) ? (
                                        <div style={{ color: '#e74c3c', gridColumn: 'span 2' }}>📅 <span style={{ color: '#7f8c8d' }}>Дараагийн үзлэг:</span> <strong>{new Date(getNextAppointment(selectedPet.name)).toLocaleDateString()} {new Date(getNextAppointment(selectedPet.name)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></div>
                                    ) : (
                                        <div style={{ color: '#bdc3c7', gridColumn: 'span 2' }}>📅 <span style={{ color: '#7f8c8d' }}>Дараагийн үзлэг:</span> Цаг аваагүй</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', backgroundColor: '#fff', padding: '35px', borderRadius: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
                            <h3 style={{ borderBottom: '3px solid #27ae60', paddingBottom: '15px', color: '#2c3e50', marginBottom: '30px', fontSize: '24px', fontWeight: '700' }}>🩺 Эмнэлгийн түүх</h3>
                            
                            {petRecords.length === 0 ? (
                                <div style={{ padding: '50px', backgroundColor: '#f9fafb', borderRadius: '20px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', fontSize: '18px' }}>
                                    🏥 Одоогоор эмнэлгийн түүх байхгүй байна.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {petRecords.map(record => (
                                        <div key={record._id} style={{ padding: '25px', backgroundColor: 'white', borderRadius: '20px', borderLeft: '8px solid #27ae60', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderTop: '1px solid #f8fafc', borderRight: '1px solid #f8fafc', borderBottom: '1px solid #f8fafc' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                                                <strong style={{ fontSize: '20px', color: '#1e293b' }}>👨‍⚕️ Эмчийн тэмдэглэл</strong>
                                                <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '6px 16px', borderRadius: '50px', fontSize: '14px', fontWeight: '700', border: '1px solid #d1fae5' }}>{new Date(record.date).toLocaleDateString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '16px' }}>
                                                <div style={{ color: '#475569' }}>🔍 <strong>Шинж тэмдэг:</strong> {record.symptoms}</div>
                                                <div style={{ color: '#475569' }}>📋 <strong>Онош:</strong> <span style={{ color: '#dc2626', fontWeight: '700' }}>{record.diagnosis}</span></div>
                                                <div style={{ color: '#475569' }}>💊 <strong>Эмчилгээ:</strong> <span style={{ color: '#2563eb', fontWeight: '600' }}>{record.treatment}</span></div>
                                                
                                                {record.treatments && record.treatments.length > 0 && (
                                                    <div style={{ marginTop: '10px' }}>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                                                            {record.treatments.map((t, idx) => (
                                                                <span key={idx} style={{
                                                                    backgroundColor: '#e0f2fe',
                                                                    color: '#0369a1',
                                                                    padding: '4px 12px',
                                                                    borderRadius: '50px',
                                                                    fontSize: '13px',
                                                                    fontWeight: '600',
                                                                    border: '1px solid #bae6fd'
                                                                }}>
                                                                    ✅ {t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {record.doctorName && <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '15px', fontStyle: 'italic', borderTop: '1px solid #f1f5f9', paddingTop: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>⚕️ Эмч: {record.doctorName}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Appointment Booking */}
                    <div id="booking-section" style={{ flex: '1 1 400px', position: 'sticky', top: '20px' }}>
                        <AppointmentForm 
                            ownerId={user._id} 
                            defaultPetName={selectedPet.name}
                            onAppointmentAdded={() => fetchAppointments(user._id)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div className="responsive-width" style={{ flex: '1 1 60%', minWidth: '400px' }}>
                    <div className="responsive-flex" style={{ justifyContent: 'space-between', alignItems: 'center', borderBottom: "2px solid var(--primary-color)", paddingBottom: "10px", marginBottom: "20px" }}>
                        <h3 style={{ margin: 0, color: "#2c3e50" }}>🐾 Миний амьтад ({pets.length})</h3>
                    </div>

                    {loadingPets ? (
                        <LoadingSpinner text="Амьтдын мэдээллийг ачааллаж байна..." />
                    ) : pets.length > 0 ? (
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: '40px' }}>
                            {pets.map(pet => {
                                const count = medicalRecords.filter(r => r.petName?.toLowerCase().trim() === pet.name?.toLowerCase().trim()).length;
                                return (
                                    <div key={pet._id}>
                                        <PetCard
                                            key={pet._id}
                                            petName={pet.name}
                                            species={pet.species}
                                            age={pet.age}
                                            gender={pet.gender}
                                            visitCount={count}
                                            nextAppointmentDate={getNextAppointment(pet.name)}
                                            imageUrl={pet.imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"}
                                            onClickDetails={() => setSelectedPet(pet)}
                                            onBookAppointment={() => window.location.href = '/appointments'}
                                            onEdit={() => setEditingPet(pet)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', marginBottom: '40px' }}>
                            <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80" alt="Empty Pets" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'inline-block' }} />
                            <h3 style={{ color: '#2c3e50', fontSize: '22px', marginBottom: '10px' }}>Таны амьтны жагсаалт хоосон байна.</h3>
                            <p style={{ color: '#7f8c8d', fontSize: '16px' }}>Эхний амьтнаа бүртгүүлэх үү? 🐶</p>
                        </div>
                    )}
                </div>

                <div className="responsive-width" style={{ flex: '1 1 35%', minWidth: '300px' }}>
                    <PetForm userId={user._id} onPetAdded={handlePetAdded} />
                </div>
            </div>
        </div>
    );
}

export default MyPets;
