import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div style={{ padding: '0', margin: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#faf9f6', minHeight: 'calc(100vh - 66px)' }}>

            {/* Hero Section — Split Layout */}
            <div style={{
                width: '100%',
                backgroundColor: '#faf9f6',
                display: 'flex',
                alignItems: 'stretch',
                flexWrap: 'wrap',
                minHeight: '520px',
                overflow: 'hidden'
            }}>
                {/* LEFT: Text content */}
                <div style={{
                    flex: '1 1 420px',
                    padding: '80px 60px 80px 80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    maxWidth: '640px'
                }}>
                    <span style={{
                        display: 'inline-block',
                        backgroundColor: '#fff3e0',
                        color: '#f39c12',
                        padding: '6px 16px',
                        borderRadius: '50px',
                        fontSize: '14px',
                        fontWeight: '700',
                        marginBottom: '24px',
                        letterSpacing: '0.5px'
                    }}>🐾 Амьтны тусламжийн систем</span>

                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        color: '#1a1a2e',
                        lineHeight: '1.2',
                        margin: '0 0 20px 0'
                    }}>
                        Амьтны эрүүл мэнд, асрамжийг{' '}
                        <span style={{ color: '#a2a2df' }}>технологиор</span>{' '}
                        шийднэ
                    </h1>

                    <p style={{
                        fontSize: '1.1rem',
                        color: '#666',
                        lineHeight: '1.8',
                        margin: '0 0 40px 0',
                        maxWidth: '480px'
                    }}>
                        Бид таны хайртай амьтанд зориулсан дижитал пасспорт, вакцины хяналт болон мэргэжлийн эмчийн зөвлөгөөг нэг дор нэгтгэлээ.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <Link to="/login" style={{
                            padding: '16px 40px',
                            backgroundColor: '#f39c12',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '50px',
                            fontWeight: 'bold',
                            fontSize: '17px',
                            boxShadow: '0 8px 25px rgba(243, 156, 18, 0.35)',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}>🚀 Яг одоо эхлэх</Link>

                        <Link to="/about" style={{
                            padding: '16px 36px',
                            backgroundColor: 'transparent',
                            border: '2px solid #d5d5d5',
                            color: '#444',
                            textDecoration: 'none',
                            borderRadius: '50px',
                            fontWeight: '600',
                            fontSize: '17px',
                            transition: 'border-color 0.2s ease, color 0.2s ease'
                        }}>Дэлгэрэнгүй →</Link>
                    </div>
                </div>

                {/* RIGHT: Image panel */}
                <div style={{
                    flex: '1 1 380px',
                    minHeight: '520px',
                    background: 'linear-gradient(160deg, #ede9fe 0%, #faf9f6 100%)',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <img
                        src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=900"
                        alt="Хайртай нохой"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center center',
                            display: 'block',
                            minHeight: '520px'
                        }}
                    />
                </div>
            </div>

            {/* Quick Info Cards */}
            <div style={{
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '1000px',
                padding: '50px 20px',
            }}>
                <div style={{ flex: '1 1 250px', backgroundColor: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.07)', textAlign: 'center', border: '1px solid #f0eeee' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>📋</div>
                    <h3 style={{ color: '#2c3e50', marginBottom: '10px', fontSize: '18px' }}>Цахим бүртгэл</h3>
                    <p style={{ color: '#7f8c8d', margin: 0, fontSize: '15px' }}>Амьтны бүх мэдээлэл нэг дор</p>
                </div>
                <div style={{ flex: '1 1 250px', backgroundColor: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.07)', textAlign: 'center', border: '1px solid #f0eeee' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔔</div>
                    <h3 style={{ color: '#2c3e50', marginBottom: '10px', fontSize: '18px' }}>Ухаалаг сануулга</h3>
                    <p style={{ color: '#7f8c8d', margin: 0, fontSize: '15px' }}>Вакцин, туулгын хугацааг мартахгүй</p>
                </div>
                <div style={{ flex: '1 1 250px', backgroundColor: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.07)', textAlign: 'center', border: '1px solid #f0eeee' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>👨‍⚕️</div>
                    <h3 style={{ color: '#2c3e50', marginBottom: '10px', fontSize: '18px' }}>Эмчийн хяналт</h3>
                    <p style={{ color: '#7f8c8d', margin: 0, fontSize: '15px' }}>Мэргэжлийн эмчийн зөвлөгөө, түүх</p>
                </div>
            </div>

            {/* Footer */}
            <div id="contact" style={{ marginTop: 'auto', width: '100%', backgroundColor: '#1a1a2e', color: 'white', padding: '50px 20px', textAlign: 'center' }}>
                <p>📍 Хаяг: Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо</p>
                <p>📞 Утас: +(976) 8800-0088, 9900-0099</p>
                <p>📧 Имэйл: info@animal-registry.mn</p>
            </div>

        </div>
    );
}

export default Home;
