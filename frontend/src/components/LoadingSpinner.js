import React from 'react';

const LoadingSpinner = ({ text = "Ачааллаж байна..." }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            color: '#7f8c8d'
        }}>
            <div style={{
                fontSize: '40px',
                animation: 'spin 2s linear infinite',
                display: 'inline-block',
                marginBottom: '10px'
            }}>
                🐾
            </div>
            <div>{text}</div>
            
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default LoadingSpinner;
