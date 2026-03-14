import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 30px',
            backgroundColor: '#282c34',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                    Амьтны Дэлгүүр
                </Link>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>Нүүр хуудас</Link>
                <Link to="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>Бидний тухай</Link>
                <Link to="/contact" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>Холбоо барих</Link>
            </div>
            <div>
                <Link to="/login" style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                }}>
                    Нэвтрэх
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
