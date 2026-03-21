import React, { useState, useEffect } from 'react';
import API_URL from '../apiConfig';

const PetForm = ({ onPetAdded, onPetUpdated, userId, existingPet, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        species: '',
        birthdate: '',
        age: '',
        gender: 'Эр',
        breed: '',
        color: '',
        weight: '',
        imageUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // If editing, pre-fill form
    useEffect(() => {
        if (existingPet) {
            setFormData({
                name: existingPet.name || '',
                species: existingPet.species || '',
                birthdate: existingPet.birthdate ? existingPet.birthdate.split('T')[0] : '',
                age: existingPet.age || '',
                gender: existingPet.gender || 'Эр',
                breed: existingPet.breed || '',
                color: existingPet.color || '',
                weight: existingPet.weight || '',
                imageUrl: existingPet.imageUrl || ''
            });
        }
    }, [existingPet]);

    // Calculate age from birthdate
    const handleBirthdateChange = (e) => {
        const dateStr = e.target.value;
        setFormData(prev => {
            const newDate = new Date(dateStr);
            const now = new Date();
            let years = now.getFullYear() - newDate.getFullYear();
            let months = now.getMonth() - newDate.getMonth();
            
            if (months < 0 || (months === 0 && now.getDate() < newDate.getDate())) {
                years--;
                months += 12;
            }

            let ageText = "";
            if (years > 0) {
                ageText = `${years} нас`;
                if (months > 0) ageText += ` ${months} сар`;
            } else if (months > 0) {
                ageText = `${months} сар`;
            } else {
                ageText = "Нялх";
            }

            return { ...prev, birthdate: dateStr, age: ageText };
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = existingPet ? `${API_URL}/pets/${existingPet._id}` : `${API_URL}/pets`;
            const method = existingPet ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
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
                alert(existingPet ? "Амьтны мэдээлэл шинэчлэгдлээ!" : "Амьтан амжилттай нэмэгдлээ!");
                if (!existingPet) {
                    setFormData({ name: '', species: '', birthdate: '', age: '', gender: 'Эр', breed: '', color: '', weight: '', imageUrl: '' });
                }
                if (existingPet && onPetUpdated) {
                    onPetUpdated(data.data);
                } else if (onPetAdded) {
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Зургийн хэмжээ 5MB-аас бага байх ёстой");
                e.target.value = "";
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '30px',
            backgroundColor: 'white',
            borderRadius: '24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            fontFamily: 'sans-serif',
            border: '1px solid #f0f0f0'
        }}>
            <h3 style={{
                color: '#2c3e50',
                borderBottom: '2px solid #f39c12',
                paddingBottom: '10px',
                marginBottom: '25px',
                fontSize: '20px',
                fontWeight: 'bold'
            }}>
                {existingPet ? "✏️ Амьтны мэдээлэл засах" : "🐾 Шинэ амьтан нэмэх"}
            </h3>

            {error && <div style={{ color: '#e74c3c', marginBottom: '15px', padding: '10px', backgroundColor: '#fdecea', borderRadius: '8px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* IMAGE PREVIEW */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #f39c12', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        <img 
                            src={formData.imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80"} 
                            alt="Preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <label style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            fontSize: '10px',
                            textAlign: 'center',
                            padding: '4px 0',
                            cursor: 'pointer'
                        }}>
                            СОЛИХ
                             <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                </div>

                {/* NAME & SPECIES */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Амьтны нэр:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #eee', outline: 'none' }}
                            required
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Төрөл:</label>
                        <input
                            type="text"
                            name="species"
                            value={formData.species}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #eee', outline: 'none' }}
                            required
                        />
                    </div>
                </div>

                {/* BREED & COLOR (OPTIONAL) */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Үүлдэр (Заавал биш):</label>
                        <input
                            type="text"
                            name="breed"
                            value={formData.breed}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #eee', outline: 'none' }}
                            placeholder="Жишээ: Пудель"
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Өнгө (Заавал биш):</label>
                        <input
                            type="text"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #eee', outline: 'none' }}
                            placeholder="Жишээ: Цагаан"
                        />
                    </div>
                </div>

                {/* WEIGHT & GENDER */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Жин (Заавал биш):</label>
                        <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #eee', outline: 'none' }}
                            placeholder="кг"
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Хүйс:</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #eee', backgroundColor: 'white' }}
                        >
                            <option value="Эр">Эр</option>
                            <option value="Эм">Эм</option>
                        </select>
                    </div>
                </div>

                {/* BIRTHDATE & AGE */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Төрсөн огноо:</label>
                        <input
                            type="date"
                            name="birthdate"
                            value={formData.birthdate}
                            onChange={handleBirthdateChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #eee', outline: 'none' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Нас:</label>
                        <input
                            type="text"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #eee', backgroundColor: '#f9f9f9' }}
                            readOnly
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            flex: 2,
                            padding: '14px',
                            backgroundColor: loading ? '#ccc' : '#f39c12',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 15px rgba(243, 156, 18, 0.3)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? "Түр хүлээнэ үү..." : (existingPet ? "Шинэчлэх" : "Амьтан нэмэх")}
                    </button>
                    {existingPet && (
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                flex: 1,
                                padding: '14px',
                                backgroundColor: '#fff',
                                color: '#666',
                                border: '1.5px solid #eee',
                                borderRadius: '50px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Болих
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default PetForm;
