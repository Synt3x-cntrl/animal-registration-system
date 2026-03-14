import React, { useState } from 'react';
import API_URL from '../apiConfig';

const PetForm = ({ onPetAdded, userId }) => {
    const [formData, setFormData] = useState({
        name: '',
        species: '',
        age: '',
        gender: 'Эр',
        imageUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/pets`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    owner: userId
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Амьтан амжилттай нэмэгдлээ!");
                setFormData({ name: '', species: '', age: '', gender: 'Эр', imageUrl: '' });
                if (onPetAdded) {
                    onPetAdded(data.data);
                }
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
            <h3 style={{
                color: '#2c3e50',
                borderBottom: '2px solid #28a745',
                paddingBottom: '10px',
                marginBottom: '25px',
                fontSize: '20px'
            }}>
                🐾 Шинэ амьтан нэмэх
            </h3>

            {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: 'bold' }}>Амьтны нэр / Дуудлага:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
                        required
                    />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: 'bold' }}>Төрөл (Нохой, Муур...):</label>
                        <input
                            type="text"
                            name="species"
                            value={formData.species}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
                            required
                        />
                    </div>

                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: 'bold' }}>Нас:</label>
                        <input
                            type="text"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
                            placeholder="Жш: 2 сар, 1 нас"
                            required
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: 'bold' }}>Хүйс:</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box', backgroundColor: 'white' }}
                        >
                            <option value="Эр">Эр</option>
                            <option value="Эм">Эм</option>
                            <option value="Бусад">Бусад</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: 'bold' }}>Зургийн холбоос (Url) - заавал биш:</label>
                    <input
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box' }}
                        placeholder="https://..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: '10px',
                        padding: '12px',
                        backgroundColor: loading ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                >
                    {loading ? "Хадгалж байна..." : "Амьтан нэмэх"}
                </button>
            </form>
        </div>
    );
};

export default PetForm;
