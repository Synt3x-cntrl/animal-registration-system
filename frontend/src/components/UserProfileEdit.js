import React, { useState } from 'react';
import API_URL from '../apiConfig';

const UserProfileEdit = ({ user }) => {
    const [formData, setFormData] = useState({
        firstname: user?.firstname || '',
        lastname: user?.lastname || '',
        email: user?.email || '',
        phone: user?.phone || '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const updateData = { ...formData };
            if (!updateData.password) {
                delete updateData.password;
            }

            const response = await fetch(`${API_URL}/auth/users/${user._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                await response.json();
                setMessage({ type: 'success', text: 'Мэдээлэл амжилттай шинэчлэгдлээ!' });
                
                // Update local storage
                const updatedUser = { ...user, ...updateData };
                delete updatedUser.password;
                localStorage.setItem("user", JSON.stringify(updatedUser));
                
                setFormData(prev => ({ ...prev, password: '' })); // clear password
            } else {
                const data = await response.json();
                setMessage({ type: 'error', text: data.error || 'Алдаа гарлаа' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Холболтын алдаа гарлаа: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3 style={{ borderBottom: "2px solid var(--primary-color)", paddingBottom: "10px", marginTop: "0", color: "#2c3e50" }}>
                👤 Хувийн мэдээлэл
            </h3>
            
            {message.text && (
                <div style={{ marginBottom: "15px", padding: "10px", borderRadius: "5px", backgroundColor: message.type === "error" ? "#f8d7da" : "#d4edda", color: message.type === "error" ? "#721c24" : "#155724" }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                <div className="responsive-flex" style={{ gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Овог</label>
                        <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Нэр</label>
                        <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>
                </div>
                
                <div className="responsive-flex" style={{ gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Имэйл</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Утасны дугаар</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Шинэ нууц үг (Өөрчлөхгүй бол хоосон үлдээнэ үү)</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Шинэ нууц үг" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginTop: '10px' }}>
                    <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                        {loading ? 'Хадгалж байна...' : 'Мэдээлэл Шинэчлэх'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserProfileEdit;
