import React from 'react';
import DoctorDailySummariesList from '../components/DoctorDailySummariesList';

const DoctorDailyReports = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    if (!user) return <div>Нэвтэрнэ үү.</div>;

    return (
        <div className="container" style={{ padding: '20px' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
                📊 Миний өдрийн тайлангууд
            </h2>
            <DoctorDailySummariesList 
                doctorId={user._id} 
                doctorName={`${user.firstname} ${user.lastname}`} 
            />
        </div>
    );
};

export default DoctorDailyReports;
