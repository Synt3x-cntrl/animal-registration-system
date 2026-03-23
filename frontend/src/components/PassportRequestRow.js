import React, { useState } from 'react';

const PassportRequestRow = ({ request, onEvaluate }) => {
  const [expanded, setExpanded] = useState(false);

  const initial = request.name?.[0]?.toUpperCase() || '?';
  const colors = ['#f39c12', '#e74c3c', '#3498db', '#9b59b6'];
  const bg = colors[request.name?.charCodeAt(0) % colors.length] || '#f39c12';

  return (
    <div style={{
      padding: '16px', borderRadius: '14px',
      backgroundColor: 'white', marginBottom: '12px',
      boxShadow: expanded ? '0 8px 25px rgba(0,0,0,0.1)' : '0 4px 15px rgba(0,0,0,0.05)',
      border: expanded ? '1px solid #a2a2df' : '1px solid #f0f0f0',
      transition: 'all 0.3s ease'
    }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        {request.imageUrl && request.imageUrl.startsWith('data:image') ? (
          <img src={request.imageUrl} alt={request.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '20px', flexShrink: 0 }}>
            {initial}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '800', color: '#1a1a2e', fontSize: '16px', marginBottom: '4px' }}>
            🐾 {request.name} 
            <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#888', marginLeft: '8px' }}>
              ({request.species} - {request.breed || 'Үүлдэр тодорхойгүй'})
            </span>
          </div>
          <div style={{ color: '#666', fontSize: '13px', display: 'flex', gap: '15px' }}>
            <span>👤 Эзэн: <strong>{request.owner?.firstname} {request.owner?.lastname}</strong></span>
            <span>📞 Утас: <strong>{request.owner?.phone}</strong></span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: '#a2a2df', fontSize: '13px', fontWeight: 'bold', marginRight: '10px' }}>
            {expanded ? '▲ Хураах' : '▼ Дэлгэрэнгүй харж шалгах'}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); onEvaluate(request._id, 'approved'); }}
            style={{ padding: '8px 16px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#219653'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#27ae60'}
          >
            Зөвшөөрөх
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onEvaluate(request._id, 'rejected'); }}
            style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
          >
            Цуцлах
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0', display: 'flex', gap: '20px' }}>
          <div style={{ width: '150px', height: '150px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
            <img 
              src={request.imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"} 
              alt="Pet" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', fontSize: '14px', alignContent: 'start' }}>
            <div><span style={{ color: '#64748b' }}>Нэр:</span> <strong style={{ color: '#0f172a' }}>{request.name}</strong></div>
            <div><span style={{ color: '#64748b' }}>Төрөл:</span> <strong style={{ color: '#0f172a' }}>{request.species}</strong></div>
            <div><span style={{ color: '#64748b' }}>Үүлдэр:</span> <strong style={{ color: '#0f172a' }}>{request.breed || 'Оруулаагүй'}</strong></div>
            <div><span style={{ color: '#64748b' }}>Хүйс:</span> <strong style={{ color: '#0f172a' }}>{request.gender}</strong></div>
            <div><span style={{ color: '#64748b' }}>Нас/Төрсөн огноо:</span> <strong style={{ color: '#0f172a' }}>{request.birthdate || request.age}</strong></div>
            <div><span style={{ color: '#64748b' }}>Жин:</span> <strong style={{ color: '#0f172a' }}>{request.weight ? `${request.weight} кг` : 'Оруулаагүй'}</strong></div>
            <div><span style={{ color: '#64748b' }}>Өнгө зүс:</span> <strong style={{ color: '#0f172a' }}>{request.color || 'Оруулаагүй'}</strong></div>
            
            <div style={{ gridColumn: '1 / -1', marginTop: '10px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#475569', fontSize: '13px' }}>
              💡 <strong>Зөвлөмж:</strong> Та амьтны мэдээлэл болон зургийг сайтар шалгаж баталгаажуулна уу. Зөвшөөрсөн тохиолдолд системээс паспортын дугаар автоматаар үүсэх болно.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassportRequestRow;
