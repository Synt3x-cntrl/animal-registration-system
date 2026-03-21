import React, { useState, useEffect } from 'react';

const Settings = () => {
    const [theme, setTheme] = useState(localStorage.getItem('appTheme') || '#a2a2df');

    useEffect(() => {
        // Хэрэглэгч өнгө сонгох үед бүх вэбийн үндсэн өнгийг солино
        document.documentElement.style.setProperty('--primary-color', theme);
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    const themes = [
        { name: 'Ягаан (Үндсэн)', color: '#a2a2df' },
        { name: 'Ногоон', color: '#27ae60' },
        { name: 'Улаан', color: '#e74c3c' },
        { name: 'Нил ягаан', color: '#9b59b6' },
        { name: 'Улбар шар', color: '#e67e22' },
        { name: 'Хар', color: '#34495e' }
    ];

    return (
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ borderBottom: "2px solid var(--primary-color)", paddingBottom: "10px", marginTop: "0", color: "#2c3e50" }}>
                ⚙️ Тохиргоо (Өнгө солих)
            </h3>
            <p style={{ color: '#666' }}>Системийн үндсэн өнгийг сонгоно уу:</p>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
                {themes.map(t => (
                    <button
                        key={t.color}
                        onClick={() => setTheme(t.color)}
                        style={{
                            padding: '10px 15px',
                            backgroundColor: t.color,
                            color: 'white',
                            border: theme === t.color ? '3px solid #2c3e50' : 'none',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            opacity: theme === t.color ? 1 : 0.8
                        }}
                    >
                        {t.name}
                    </button>
                ))}
            </div>
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
                Одоо ийм өнгөтэй харагдаж байна
            </div>
        </div>
    );
};

export default Settings;
