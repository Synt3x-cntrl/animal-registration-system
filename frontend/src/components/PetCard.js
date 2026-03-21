import React from 'react';

const PetCard = ({
    petName = "Амьтны нэр",
    species = "Төрөл",
    age = "Нас",
    gender = "Хүйс",
    nextAppointmentDate,
    visitCount = 0,
    imageUrl = "https://via.placeholder.com/300x200?text=Амьтны+Зураг",
    onClickDetails,
    onBookAppointment,
    onEdit
}) => {
    return (
        <div className="responsive-width" style={{
            width: '100%',
            maxWidth: '300px',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
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
                {onEdit && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '18px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            zIndex: 10,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'white'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.9)'}
                        title="Засах"
                    >
                        ✏️
                    </button>
                )}
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
                    <div style={{ display: 'flex', alignItems: 'center', color: '#27ae60' }}>
                        <span style={{ marginRight: '8px', fontWeight: 'bold' }}>🏥 Үзүүлсэн тоо:</span> {visitCount} удаа
                    </div>
                    {nextAppointmentDate && (
                        <div style={{ display: 'flex', alignItems: 'center', color: '#e74c3c', marginTop: '5px', fontWeight: 'bold' }}>
                            <span style={{ marginRight: '8px' }}>📅 Дараагийн үзлэг:</span> {new Date(nextAppointmentDate).toLocaleDateString()} {new Date(nextAppointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onBookAppointment && onBookAppointment(); }}
                        style={{
                            flex: 1, padding: '12px', backgroundColor: '#f39c12', color: 'white',
                            border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer',
                            transition: 'background-color 0.2s', boxShadow: '0 4px 10px rgba(243, 156, 18, 0.3)'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e67e22'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f39c12'}
                    >
                        📅 Цаг авах
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClickDetails && onClickDetails(); }}
                        style={{
                            flex: 1, padding: '12px', backgroundColor: '#f8f9fa', color: '#2c3e50',
                            border: '1px solid #ced4da', borderRadius: '50px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    >
                        Мэдээлэл
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PetCard;
