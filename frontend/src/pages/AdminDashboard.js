import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // New Doctor Form States
    const [doctorFirstname, setDoctorFirstname] = useState("");
    const [doctorLastname, setDoctorLastname] = useState("");
    const [doctorEmail, setDoctorEmail] = useState("");
    const [doctorPhone, setDoctorPhone] = useState("");
    const [doctorPassword, setDoctorPassword] = useState("");

    useEffect(() => {
        const loggedUser = localStorage.getItem("user");
        if (loggedUser) {
            const parsedUser = JSON.parse(loggedUser);
            if (parsedUser.role !== 'admin') {
                alert("Танд админ эрх байхгүй байна!");
                navigate("/");
            } else {
                setUser(parsedUser);
            }
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleRegisterDoctor = async (e) => {
        e.preventDefault();
        if (!doctorFirstname || !doctorLastname || !doctorEmail || !doctorPhone || !doctorPassword) {
            alert("Бүх талбарыг бөглөнө үү");
            return;
        }

        try {
            const response = await fetch("http://localhost:4000/api/v1/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstname: doctorFirstname,
                    lastname: doctorLastname,
                    email: doctorEmail,
                    phone: doctorPhone,
                    password: doctorPassword,
                    role: "doctor",
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Эмч амжилттай бүртгэгдлээ.");
                setDoctorFirstname("");
                setDoctorLastname("");
                setDoctorEmail("");
                setDoctorPhone("");
                setDoctorPassword("");
            } else {
                alert("Алдаа гарлаа: " + data.error);
            }
        } catch (error) {
            alert("Сервертэй холбогдоход алдаа гарлаа: " + error.message);
        }
    };

    if (!user) return <div>Уншиж байна...</div>;

    return (
        <div style={{ padding: '30px' }}>
            <h1>Админ Удирдлагын Хэсэг</h1>
            <p>Сайн байна уу, {user.firstname} {user.lastname}</p>

            <div style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <h2>Системийн тойм</h2>
                <p>Энд админы хийх үйлдлүүд байрлана (Жишээ нь: Хэрэглэгчид, Эмч нар, Цаг захиалгууд).</p>
            </div>

            <div style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                maxWidth: '500px'
            }}>
                <h2>Шинэ эмч бүртгэх</h2>
                <form onSubmit={handleRegisterDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="text"
                        placeholder="Овог"
                        value={doctorLastname}
                        onChange={(e) => setDoctorLastname(e.target.value)}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Нэр"
                        value={doctorFirstname}
                        onChange={(e) => setDoctorFirstname(e.target.value)}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Эмэйл хаяг"
                        value={doctorEmail}
                        onChange={(e) => setDoctorEmail(e.target.value)}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Утасны дугаар"
                        value={doctorPhone}
                        onChange={(e) => setDoctorPhone(e.target.value)}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Нууц үг"
                        value={doctorPassword}
                        onChange={(e) => setDoctorPassword(e.target.value)}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '10px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Эмч бүртгэх
                    </button>
                </form>
            </div>

            <button
                onClick={handleLogout}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Гарах
            </button>
        </div>
    );
}

export default AdminDashboard;
