import React from 'react';

const PassportCard = ({ pet }) => {
  if (!pet || pet.passportStatus !== 'approved') return null;

  return (
    <div style={{
      width: '100%',
      maxWidth: '480px',
      height: '300px',
      backgroundColor: '#f8f9fa',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      overflow: 'hidden',
      fontFamily: '"Arial", sans-serif',
      position: 'relative',
      border: '1px solid #dee2e6',
      backgroundImage: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)'
    }}>
      {/* Background Watermark */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '150px',
        opacity: 0.03,
        pointerEvents: 'none'
      }}>
        🐾
      </div>

      {/* Header */}
      <div style={{
        backgroundColor: '#1E3A8A',
        color: 'white',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '4px solid #F59E0B'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🇲🇳</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>Монгол Улс</div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>Гэрийн тэжээвэр амьтны паспорт</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>PASSPORT NO.</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'monospace' }}>{pet.passportId}</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px', display: 'flex', gap: '20px', height: 'calc(100% - 64px)' }}>
        {/* Photo Container */}
        <div style={{
          width: '120px',
          height: '150px',
          border: '2px solid #cbd5e1',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#e2e8f0',
          flexShrink: 0,
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <img 
            src={pet.imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"} 
            alt="Pet" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>

        {/* Details Container */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Нэр / Name</span>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{pet.name}</span>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Төрөл / Species</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{pet.species}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Үүлдэр / Breed</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{pet.breed || 'Тодорхойгүй'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Хүйс / Sex</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{pet.gender}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Төрсөн / DOB</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{pet.birthdate || pet.age}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Өнгө / Color</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{pet.color || '-'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Жин / Weight</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{pet.weight ? `${pet.weight}кг` : '-'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
            <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Олгосон огноо / Date of Issue</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{new Date(pet.passportIssueDate).toLocaleDateString()}</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PassportCard;
