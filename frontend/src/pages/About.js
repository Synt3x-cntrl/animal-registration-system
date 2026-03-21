import React from 'react';

function About() {
    return (
        <div style={{ padding: '0', margin: '0', backgroundColor: '#f5f7fc', minHeight: 'calc(100vh - 66px)', paddingBottom: '30px' }}>
            <div style={{
                background: 'linear-gradient(135deg, #a2a2df 0%, #dcdcef 100%)',
                color: 'white',
                padding: '60px 20px',
                textAlign: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
            }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: '800', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>Бидний тухай & Үйлчилгээ</h1>
                <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', opacity: '0.9' }}>
                    Таны хайртай амьтдад зориулсан мэргэжлийн тусламж үйлчилгээ
                </p>
            </div>

            <div className="responsive-flex" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', gap: '30px' }}>
                <div style={{ flex: 1, padding: '30px', backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                    <h2 style={{ color: '#2c3e50', borderBottom: '3px solid #f9a826', paddingBottom: '10px' }}>🏥 Бидний тухай</h2>
                    <p style={{ color: '#555', lineHeight: '1.8', fontSize: '16px' }}>
                        Манай эмнэлэг нь 2020 оноос хойш амьтны эрүүл мэнд, урьдчилан сэргийлэх үзлэг, мэс засал 
                        болон бүх төрлийн эмчилгээний чиглэлээр тасралтгүй үйл ажиллагаа явуулж байна.
                        Мэргэжлийн туршлагатай эмч нарын баг таны гэр бүлийн гишүүн болсон хайртай амьтдад 
                        тусламж үйлчилгээ үзүүлэхэд хэзээд бэлэн байх болно.
                    </p>
                </div>
                
                <div style={{ flex: 1, padding: '30px', backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                    <h2 style={{ color: '#2c3e50', borderBottom: '3px solid #a2a2df', paddingBottom: '10px' }}>🩺 Үйлчилгээнүүд</h2>
                    <ul style={{ color: '#555', lineHeight: '1.8', fontSize: '16px', paddingLeft: '20px' }}>
                        <li>Урьдчилан сэргийлэх үзлэг, зөвлөгөө</li>
                        <li>Вакцинжуулалт болон туулгалт</li>
                        <li>Мэс засал (Хөнгөн болон Хүнд)</li>
                        <li>Лабораторийн шинжилгээ (Цус, Шээс)</li>
                        <li>Эхо (Хэт авиан шинжилгээ) болон Рентген</li>
                        <li>Гоо сайхан болон усанд оруулах үйлчилгээ</li>
                    </ul>
                </div>
            </div>

            {/* Images & Gallery */}
            <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px', textAlign: 'center' }}>
                <h2 style={{ color: '#2c3e50', marginBottom: '30px' }}>📸 Эмнэлгийн орчин</h2>
                <div className="responsive-flex-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                    <img 
                        src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=800" 
                        alt="Hospital Interior" 
                        style={{ width: '100%', maxWidth: '350px', borderRadius: '20px', objectFit: 'cover', height: '250px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }} 
                    />
                    <img 
                        src="https://images.unsplash.com/photo-1596272875729-ed66ab0e5c94?auto=format&fit=crop&q=80&w=800" 
                        alt="Vet examining dog" 
                        style={{ width: '100%', maxWidth: '350px', borderRadius: '20px', objectFit: 'cover', height: '250px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }} 
                    />
                    <img 
                        src="https://images.unsplash.com/photo-1628009368231-7bb7cbcb8127?auto=format&fit=crop&q=80&w=800" 
                        alt="Happy pet" 
                        style={{ width: '100%', maxWidth: '350px', borderRadius: '20px', objectFit: 'cover', height: '250px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }} 
                    />
                </div>
            </div>

            {/* Footer Contact Info */}
            <div style={{ width: '100%', backgroundColor: '#2c3e50', color: 'white', padding: '50px 20px', textAlign: 'center', marginTop: 'auto' }}>
                <p style={{ margin: '10px 0' }}>📍 Хаяг: Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо</p>
                <p style={{ margin: '10px 0' }}>📞 Утас: +(976) 8800-0088, 9900-0099</p>
                <p style={{ margin: '10px 0' }}>📧 Имэйл: info@animal-registry.mn</p>
            </div>
            
        </div>
    );
}

export default About;
