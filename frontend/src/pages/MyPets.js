import { useState, useEffect } from "react";
import PetCard from "../components/PetCard";
import PetForm from "../components/PetForm";
import API_URL from "../apiConfig";

function MyPets() {
    const [user, setUser] = useState(null);
    const [pets, setPets] = useState([]);
    const [loadingPets, setLoadingPets] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            if (parsedUser.role === 'user') {
                fetchPets(parsedUser._id);
            }
        }
    }, []);

    const fetchPets = async (userId) => {
        setLoadingPets(true);
        try {
            const response = await fetch(`${API_URL}/pets/user/${userId}`);
            const data = await response.json();
            if (response.ok) {
                setPets(data.data);
            }
        } catch (error) {
            console.error("Амьтныг татахад алдаа гарлаа:", error);
        } finally {
            setLoadingPets(false);
        }
    };

    const handlePetAdded = (newPet) => {
        setPets([newPet, ...pets]);
    };

    if (!user) {
        return (
            <div style={{ marginTop: "50px", textAlign: "center", padding: "40px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>Та системд нэвтрээгүй байна</h3>
                <p style={{ color: "#6c757d", marginBottom: "25px" }}>Энэ хуудсыг үзэхийн тулд нэвтэрч орно уу.</p>
                <a href="/login" style={{ padding: "10px 25px", backgroundColor: "var(--primary-color, #007bff)", color: "white", textDecoration: "none", borderRadius: "5px", fontWeight: "bold" }}>Нэвтрэх</a>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 60%', minWidth: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: "2px solid var(--primary-color)", paddingBottom: "10px", marginBottom: "20px" }}>
                        <h3 style={{ margin: 0, color: "#2c3e50" }}>🐾 Миний амьтад ({pets.length})</h3>
                    </div>

                    {loadingPets ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Ачааллаж байна...</div>
                    ) : pets.length > 0 ? (
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: '40px' }}>
                            {pets.map(pet => (
                                <PetCard
                                    key={pet._id}
                                    petName={pet.name}
                                    species={pet.species}
                                    age={pet.age}
                                    gender={pet.gender}
                                    imageUrl={pet.imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px', color: '#6c757d', border: '1px dashed #ced4da', marginBottom: '40px' }}>
                            <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🐕</span>
                            Танд одоогоор бүртгэлтэй амьтан байхгүй байна.
                        </div>
                    )}
                </div>

                <div style={{ flex: '1 1 35%', minWidth: '300px' }}>
                    <PetForm userId={user._id} onPetAdded={handlePetAdded} />
                </div>
            </div>
        </div>
    );
}

export default MyPets;
