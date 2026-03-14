import React from 'react';

const PetCard = ({
    petName = "Амьтны нэр",
    species = "Төрөл",
    age = "Нас",
    gender = "Хүйс",
    imageUrl = "https://via.placeholder.com/300x200?text=Амьтны+Зураг",
    onClickDetails
}) => {
    return (
        <div style={{
            width: '300px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            backgroundColor: 'white',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            margin: '15px',
            fontFamily: 'sans-serif'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            }}
        >
            <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                <img
                    src={imageUrl}
                    alt={petName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#333' }}>{petName}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#666', fontSize: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '8px', fontWeight: 'bold' }}>🐾 Төрөл:</span> {species}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '8px', fontWeight: 'bold' }}>🗓️ Нас:</span> {age}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '8px', fontWeight: 'bold' }}>⚥ Хүйс:</span> {gender}
                    </div>
                </div>

                <button
                    onClick={onClickDetails}
                    style={{
                        marginTop: '20px',
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
                >
                    Мэдээлэл харах
                </button>
            </div>
        </div>
    );
};

export default PetCard;
