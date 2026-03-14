import { useState, useEffect } from "react";
import MedicalRecordsList from "../components/MedicalRecordsList";
import DoctorMedicalHistory from "../components/DoctorMedicalHistory";

function MedicalHistory() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    if (!user) {
        return (
            <div style={{ marginTop: "50px", textAlign: "center", padding: "40px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>Та системд нэвтрээгүй байна</h3>
                <p style={{ color: "#6c757d", marginBottom: "25px" }}>Энэ хуудсыг үзэхийн тулд нэвтэрч орно уу.</p>
                <a href="/login" style={{ padding: "10px 25px", backgroundColor: "var(--primary-color, #007bff)", color: "white", textDecoration: "none", borderRadius: "5px", fontWeight: "bold" }}>Нэвтрэх</a>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
            <h2 style={{ color: "#2c3e50", borderBottom: "2px solid var(--primary-color)", paddingBottom: "10px", marginBottom: "30px" }}>🏥 Эмнэлгийн түүх</h2>

            {user.role === 'doctor' ? (
                <DoctorMedicalHistory doctorName={`${user.firstname} ${user.lastname}`} />
            ) : (
                <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                    <MedicalRecordsList userId={user._id} />
                </div>
            )}
        </div>
    );
}

export default MedicalHistory;
