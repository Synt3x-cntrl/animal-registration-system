import "../styles/style.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MyInput from "../components/MyInput";
import MyButton from "../components/My_button";
import API_URL from "../apiConfig";

function Register() {
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleRegister = async () => {
        // Basic validation
        if (!firstname || !lastname || !email || !phone || !password) {
            alert("Бүх талбарыг бөглөнө үү");
            return;
        }

        try {
            // Registering via our backend creates the user in BOTH Firebase Auth and Firestore.
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    phone: phone,
                    password: password,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    throw new Error(`Сервер дээр алдаа гарлаа: ${response.status}. ${errorText.substring(0, 100)}`);
                }
                throw new Error(errorData.error || "Бүртгэл хийхэд алдаа гарлаа");
            }

            await response.json();

            if (response.ok) {
                alert("Амжилттай бүртгэгдлээ. Одоо нэвтэрч орно уу.");
                navigate("/login");
            }
        } catch (error) {
            alert("Алдаа гарлаа: " + error.message);
        }
    };

    return (
        <div className="container">
            <p className="title">Шинээр бүртгүүлэх</p>
            <div>
                <MyInput
                    type="text"
                    placeholder="Овог"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                />

                <MyInput
                    type="text"
                    placeholder="Нэр"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                />

                <MyInput
                    type="email"
                    placeholder="Эмэйл хаяг"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <MyInput
                    type="text"
                    placeholder="Утасны дугаар"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <MyInput
                    type="password"
                    placeholder="Нууц үг"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <MyButton
                    title="Бүртгүүлэх"
                    onClick={handleRegister}
                    value="mybutton"
                />

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p>Бүртгэлтэй юу? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Нэвтрэх</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Register;
