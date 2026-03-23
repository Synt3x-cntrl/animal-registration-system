import React, { useState } from 'react';
import API_URL from '../apiConfig';
import PetMedicalTimeline from './PetMedicalTimeline';

const DoctorFastSearch = ({ onExamine }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);

    const handleSearch = async (e) => {
        const val = e.target.value;
        setQuery(val);
        
        if (val.length < 2) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(`${API_URL}/pets/search?q=${encodeURIComponent(val)}`);
            const data = await res.json();
            if (res.ok) {
                setResults(data.data);
            }
        } catch (error) {
            console.error("Хайлт амжилтгүй:", error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', marginBottom: '25px', zIndex: 100 }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px' }}>🔍</span>
                <input
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    placeholder="Хурдан хайлт: Амьтны нэр эсвэл эзэмшигчийн утсаар хайх..."
                    style={{
                        width: '100%',
                        padding: '18px 20px 18px 45px',
                        fontSize: '16px',
                        border: '2px solid #3498db',
                        borderRadius: '30px',
                        outline: 'none',
                        boxShadow: '0 4px 15px rgba(52, 152, 219, 0.15)',
                        transition: 'box-shadow 0.3s'
                    }}
                />
                
                {isSearching && (
                    <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', animation: 'spin 2s linear infinite' }}>
                        🐾
                    </div>
                )}
            </div>

            {results.length > 0 && query.length >= 2 && (
                <div style={{
                    position: 'absolute',
                    top: '65px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    maxWidth: '800px',
                    backgroundColor: 'white',
                    borderRadius: '15px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    border: '1px solid #eee'
                }}>
                    <div style={{ padding: '10px 15px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#7f8c8d' }}>
                        Хайлтын үр дүн ({results.length})
                    </div>
                    {results.map(pet => (
                        <div 
                            key={pet._id}
                            style={{
                                display: 'flex', alignItems: 'center', padding: '15px',
                                borderBottom: '1px solid #f1f1f1',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                        >
                            <div style={{ fontSize: '24px', marginRight: '15px' }}>🐾</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>{pet.name}</div>
                                <div style={{ fontSize: '13px', color: '#7f8c8d' }}>
                                    Эзэмшигч: {pet.owner?.firstname} {pet.owner?.lastname} ({pet.owner?.phone})
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPet(pet);
                                    }}
                                    style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                                >
                                    Түүх
                                </button>
                                {onExamine && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onExamine(pet);
                                            setQuery('');
                                            setResults([]);
                                        }}
                                        style={{ padding: '6px 12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                                    >
                                        Үзлэг хийх
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {results.length === 0 && query.length >= 2 && !isSearching && (
                <div style={{
                    position: 'absolute', top: '65px', left: '50%', transform: 'translateX(-50%)',
                    width: '100%', maxWidth: '800px', backgroundColor: 'white',
                    borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    padding: '20px', textAlign: 'center', color: '#7f8c8d'
                }}>
                    Илэрц олдсонгүй
                </div>
            )}

            {selectedPet && (
                <PetMedicalTimeline 
                    pet={selectedPet} 
                    onClose={() => setSelectedPet(null)} 
                />
            )}
        </div>
    );
};

export default DoctorFastSearch;
