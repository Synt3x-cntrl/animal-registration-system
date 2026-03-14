import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminUsers() {
    const [user, setUser] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ firstname: '', lastname: '', email: '', phone: '', role: '', password: '' });
    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:4000/api/v1/auth/users");
            const data = await response.json();
            if (response.ok) {
                setUsersList(data.data);
            } else {
                console.error("Хэрэглэгчдийг татахад алдаа гарлаа:", data.error);
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
            fetchUsers();
        }
    }, [user]);

    const handleDeleteUser = async (id) => {
        if (window.confirm("Энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?")) {
            try {
                const response = await fetch(`http://localhost:4000/api/v1/auth/users/${id}`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    alert("Амжилттай устгагдлаа");
                    fetchUsers();
                } else {
                    const data = await response.json();
                    alert("Алдаа гарлаа: " + data.error);
                }
            } catch (error) {
                alert("Алдаа гарлаа: " + error.message);
            }
        }
    };

    const handleEditClick = (userToEdit) => {
        setEditingUser(userToEdit);
        setEditForm({
            firstname: userToEdit.firstname || '',
            lastname: userToEdit.lastname || '',
            email: userToEdit.email || '',
            phone: userToEdit.phone || '',
            role: userToEdit.role || 'user',
            password: '' // Keep empty unless changing
        });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const updateData = { ...editForm };
            if (!updateData.password) {
                delete updateData.password;
            }

            const response = await fetch(`http://localhost:4000/api/v1/auth/users/${editingUser._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                alert("Амжилттай шинэчлэгдлээ");
                setEditingUser(null);
                fetchUsers();
            } else {
                const data = await response.json();
                alert("Алдаа гарлаа: " + data.error);
            }
        } catch (error) {
            alert("Алдаа: " + error.message);
        }
    };

    if (!user || loading) return <div>Уншиж байна...</div>;

    const filteredUsers = usersList.filter((u) => {
        const term = searchTerm.toLowerCase();
        const emailMatch = u.email && u.email.toLowerCase().includes(term);
        const phoneMatch = u.phone && u.phone.toLowerCase().includes(term);
        return emailMatch || phoneMatch;
    });

    return (
        <div style={{ padding: '30px' }}>
            <h1>Хэрэглэгчид</h1>
            <p>Системд бүртгэлтэй бүх хэрэглэгчид</p>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Имэйл эсвэл утасны дугаараар хайх..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                        padding: '10px 15px', 
                        width: '300px', 
                        borderRadius: '5px', 
                        border: '1px solid #ccc',
                        fontSize: '14px'
                    }}
                />
            </div>

            <div style={{
                marginTop: '15px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                overflowX: 'auto'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ padding: '12px' }}>Овог Нэр</th>
                            <th style={{ padding: '12px' }}>Имэйл</th>
                            <th style={{ padding: '12px' }}>Утас</th>
                            <th style={{ padding: '12px' }}>Эрх</th>
                            <th style={{ padding: '12px' }}>Бүртгүүлсэн огноо</th>
                            <th style={{ padding: '12px' }}>Үйлдэл</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers && filteredUsers.length > 0 ? (
                            filteredUsers.map((u) => (
                                <tr key={u._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                    <td style={{ padding: '12px' }}>{u.lastname} {u.firstname}</td>
                                    <td style={{ padding: '12px' }}>{u.email}</td>
                                    <td style={{ padding: '12px' }}>{u.phone || '-'}</td>
                                    <td style={{ padding: '12px', fontWeight: 'bold', color: u.role === 'admin' ? '#e74c3c' : u.role === 'doctor' ? '#3498db' : '#2ecc71' }}>
                                        {u.role === 'admin' ? 'Админ' : u.role === 'doctor' ? 'Эмч' : 'Хэрэглэгч'}
                                    </td>
                                    <td style={{ padding: '12px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px' }}>
                                        <button onClick={() => handleEditClick(u)} style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#f1c40f', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Засах</button>
                                        <button onClick={() => handleDeleteUser(u._id)} style={{ padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Устгах</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ padding: '12px', textAlign: 'center' }}>Хэрэглэгч олдсонгүй</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '400px' }}>
                        <h2>Хэрэглэгч засах</h2>
                        <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input type="text" placeholder="Овог" value={editForm.lastname} onChange={(e) => setEditForm({...editForm, lastname: e.target.value})} required style={{ padding: '8px' }} />
                            <input type="text" placeholder="Нэр" value={editForm.firstname} onChange={(e) => setEditForm({...editForm, firstname: e.target.value})} required style={{ padding: '8px' }} />
                            <input type="email" placeholder="Имэйл" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} required style={{ padding: '8px' }} />
                            <input type="text" placeholder="Утас" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} style={{ padding: '8px' }} />
                            <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} style={{ padding: '8px' }}>
                                <option value="user">Хэрэглэгч</option>
                                <option value="doctor">Эмч</option>
                                <option value="admin">Админ</option>
                            </select>
                            <input type="password" placeholder="Шинэ нууц үг (заавал биш)" value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})} style={{ padding: '8px' }} />
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px' }}>Хадгалах</button>
                                <button type="button" onClick={() => setEditingUser(null)} style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px' }}>Болих</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminUsers;
