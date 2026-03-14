import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../apiConfig";

function AdminPets() {
    const [user, setUser] = useState(null);
    const [petsList, setPetsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchPets = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/pets`);
            const data = await response.json();
            if (response.ok) {
                setPetsList(data.data);
            } else {
                console.error("Амьтдыг татахад алдаа гарлаа:", data.error);
            }
        } catch (error) {
            console.error("Сервертэй холбогдоход алдаа гарлаа:", error);
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        if (user) {
            fetchPets();
        }
    }, [user]);

    const handleDeletePet = async (id) => {
        if (window.confirm("Энэ амьтныг устгахдаа итгэлтэй байна уу?")) {
            try {
                const response = await fetch(`${API_URL}/pets/${id}`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    alert("Амжилттай устгагдлаа");
                    fetchPets();
                } else {
                    const data = await response.json();
                    alert("Алдаа гарлаа: " + data.error);
                }
            } catch (error) {
                alert("Алдаа гарлаа: " + error.message);
            }
        }
    };

    if (!user || loading) return <div>Уншиж байна...</div>;

    return (
        <div style={{ padding: '30px' }}>
            <h1>Амьтад</h1>
            <p>Системд бүртгэлтэй бүх амьтдын жагсаалт</p>

            <div style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                overflowX: 'auto'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ padding: '12px' }}>Нэр</th>
                            <th style={{ padding: '12px' }}>Төрөл</th>
                            <th style={{ padding: '12px' }}>Нас</th>
                            <th style={{ padding: '12px' }}>Хүйс</th>
                            <th style={{ padding: '12px' }}>Бүртгүүлсэн огноо</th>
                            <th style={{ padding: '12px' }}>Үйлдэл</th>
                        </tr>
                    </thead>
                    <tbody>
                        {petsList && petsList.length > 0 ? (
                            petsList.map((p) => (
                                <tr key={p._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                    <td style={{ padding: '12px' }}>{p.name}</td>
                                    <td style={{ padding: '12px' }}>{p.species}</td>
                                    <td style={{ padding: '12px' }}>{p.age}</td>
                                    <td style={{ padding: '12px' }}>{p.gender}</td>
                                    <td style={{ padding: '12px' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px' }}>
                                        <button onClick={() => handleDeletePet(p._id)} style={{ padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Устгах</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ padding: '12px', textAlign: 'center' }}>Амьтан олдсонгүй</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminPets;
