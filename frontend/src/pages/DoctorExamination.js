import React from 'react';
import MedicalForm from '../components/MedicalForm';

const DoctorExamination = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    const doctorName = user ? `${user.firstname} ${user.lastname}` : '';
    const doctorId = user ? user._id : '';

    return (
        <div className="container" style={{ padding: '20px' }}>
            <MedicalForm 
                doctorName={doctorName}
                doctorId={doctorId}
                onSuccess={() => {
                    // Optionally navigate to dashboard or just stay on the page
                    // navigate("/dashboard");
                }}
            />
        </div>
    );
};

export default DoctorExamination;
