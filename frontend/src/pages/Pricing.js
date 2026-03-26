import React from 'react';

const Pricing = () => {
    const generalServices = [
        { name: "Үзлэг", price: "10,000₮" },
        { name: "Пасспорт", price: "10,000₮" },
        { name: "Үндсэн вакцин", price: "42,000₮" },
        { name: "Галзуугийн вакцин", price: "40,000₮" },
        { name: "Микрочип суулгах", price: "40,000₮" },
        { name: "Хумс авах /муур/", price: "3,000₮" },
        { name: "Хумс авах /нохой/", price: "5,000₮" },
        { name: "Анусны булчирхай шахах", price: "8,000₮ - 20,000₮" },
    ];

    const treatments = [
        { name: "Ком эмчилгээ", price: "60,000₮" },
        { name: "Хордлогын эмчилгээ", price: "70,000₮" },
        { name: "Парвовирусын эмчилгээ", price: "70,000₮" },
        { name: "Хэвтэн эмчилгээ", price: "90,000₮" },
        { name: "Чихний эмчилгээ", price: "25,000₮ - 35,000₮" },
        { name: "Рахит эмчилгээ", price: "25,000₮ - 35,000₮" },
        { name: "Шимэгчийн эмчилгээ", price: "25,000₮ - 35,000₮" },
        { name: "Шархны цэвэрлэгээ", price: "60,000₮ - 120,000₮" },
    ];

    const surgery = [
        { name: "Шүд авах", price: "85,000₮ - 280,000₮" },
        { name: "Шүдний чулуу түүх", price: "100,000₮ - 350,000₮" },
        { name: "Катетер /унтуулгатай/", price: "80,000₮ - 150,000₮" },
        { name: "Давсагны чулуу авах", price: "130,000₮ - 320,000₮" },
        { name: "Илүү хуруу тайрах", price: "80,000₮ - 250,000₮" },
        { name: "Нүдний налхи авах", price: "80,000₮ - 250,000₮" },
        { name: "Оёдол тавих", price: "55,000₮ - 280,000₮" },
    ];

    const labTests = [
        { name: "Парвовирусын тест", price: "30,000₮" },
        { name: "Гударгын тест", price: "30,000₮" },
        { name: "Муурны тест", price: "30,000₮" },
        { name: "Арьс, үснээс дээж авах", price: "18,000₮" },
        { name: "Шээсний шинжилгээ", price: "18,000₮" },
        { name: "Цусны биохими /Нохой, муур/", price: "95,000₮" },
        { name: "Цусны биохими /Адуу/", price: "120,000₮" },
        { name: "Баасны шинжилгээ", price: "18,000₮" },
        { name: "Рентген зураг авах", price: "50,000₮ - 70,000₮" },
    ];

    const otherServices = [
        { name: "Унтуулгах тариа", price: "60,000₮ - 220,000₮" },
        { name: "Шатаах чандарлах", price: "40,000₮ - 80,000₮" },
        { name: "Хонуулах (1 хоног)", price: "25,000₮" },
        { name: "Туулга (1ш)", price: "8,000₮" },
        { name: "Нохой нийлүүлэх", price: "45,000₮ - 75,000₮" },
        { name: "Ариутгах (1м2)", price: "30,000₮" },
    ];

    const complexDogPrices = [
        { weight: "1-9кг", price1: "300,000₮", price2: "150,000₮", price3: "350,000₮" },
        { weight: "10-13кг", price1: "320,000₮", price2: "220,000₮", price3: "420,000₮" },
        { weight: "14-17кг", price1: "350,000₮", price2: "220,000₮", price3: "420,000₮" }, // Image says 10-19kg for others, 14-17 for first table
        { weight: "18-21кг", price1: "380,000₮", price2: "250,000₮", price3: "480,000₮" }, // Mapping weights is tricky but I'll follow images
        { weight: "22-25кг", price1: "400,000₮", price2: "250,000₮", price3: "480,000₮" },
        { weight: "26-29кг", price1: "450,000₮", price2: "250,000₮", price3: "480,000₮" },
        { weight: "30-35кг", price1: "500,000₮", price2: "300,000₮", price3: "550,000₮" },
        { weight: "36-49кг", price1: "550,000₮", price2: "350,000₮", price3: "630,000₮" },
        { weight: "50кг-с дээш", price1: "600,000₮", price2: "380,000₮", price3: "680,000₮" },
    ];

    const complexCatPrices = [
        { weight: "Эм", price1: "150,000₮", price2: "300,000₮" }, // weight field used for Gender for Cat Spay/Neuter section
        { weight: "Эр", price1: "110,000₮", price2: "320,000₮" },
        { weight: "1-2кг", price1: "-", price2: "300,000₮" },
        { weight: "2-3кг", price1: "-", price2: "320,000₮" },
        { weight: "3-4кг", price1: "-", price2: "350,000₮" },
        { weight: "4-5кг", price1: "-", price2: "380,000₮" },
        { weight: "5кг-с дээш", price1: "-", price2: "400,000₮" },
    ];

    const Section = ({ title, data }) => (
        <div style={{ marginBottom: '40px', backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ borderBottom: '3px solid #3498db', paddingBottom: '10px', color: '#2c3e50', marginBottom: '20px' }}>{title}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                {data.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                        <span style={{ color: '#555' }}>{item.name}</span>
                        <strong style={{ color: '#2c3e50' }}>{item.price}</strong>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ color: '#2c3e50', fontSize: '36px', fontWeight: '800' }}>💰 Үйлчилгээний үнийн тариф</h1>
                <p style={{ color: '#7f8c8d' }}>Манай эмнэлгийн санал болгож буй үйлчилгээнүүдийн дэлгэрэнгүй үнийн жагсаалт</p>
            </div>

            <Section title="🏥 Ерөнхий үйлчилгээ" data={generalServices} />
            <Section title="💊 Эмчилгээ" data={treatments} />
            <Section title="✂️ Мэс засал" data={surgery} />
            <Section title="🧪 Лабораторийн шинжилгээ" data={labTests} />
            <Section title="✨ Бусад үйлчилгээ" data={otherServices} />

            <div style={{ marginBottom: '40px', backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                <h3 style={{ borderBottom: '3px solid #e67e22', paddingBottom: '10px', color: '#2c3e50', marginBottom: '20px' }}>🐕 Нохой (Хагалгааны үнэ жингээс хамаарна)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#fff5eb', color: '#e67e22' }}>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e67e22' }}>Жин</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e67e22' }}>Спэй, Зовхи татах, Ивэрхий, Шүд цэвэрлэх</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e67e22' }}>Заслага, Шүд авах, Ургацаг авах</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e67e22' }}>Кесерово, Түгжрэл, Түнх, Хугарал, Хавдар</th>
                        </tr>
                    </thead>
                    <tbody>
                        {complexDogPrices.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.weight}</td>
                                <td style={{ padding: '12px' }}>{item.price1}</td>
                                <td style={{ padding: '12px' }}>{item.price2}</td>
                                <td style={{ padding: '12px' }}>{item.price3}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginBottom: '40px', backgroundColor: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                <h3 style={{ borderBottom: '3px solid #9b59b6', paddingBottom: '10px', color: '#2c3e50', marginBottom: '20px' }}>🐈 Муур (Хагалгааны үнийн тариф)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f5eeff', color: '#9b59b6' }}>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #9b59b6' }}>Төрөл / Жин</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #9b59b6' }}>Спэй, Заслага</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #9b59b6' }}>Кесерово, Түгжрэл, Түнх, Хугарал, Хавдар</th>
                        </tr>
                    </thead>
                    <tbody>
                        {complexCatPrices.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.weight}</td>
                                <td style={{ padding: '12px' }}>{item.price1}</td>
                                <td style={{ padding: '12px' }}>{item.price2}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div style={{ padding: '20px', backgroundColor: '#e8f6f3', borderRadius: '15px', color: '#16a085', fontSize: '14px', marginBottom: '40px' }}>
                💡 <strong>Тэмдэглэл:</strong> Дээрх үнүүд нь үндсэн үнэ бөгөөд амьтны эрүүл мэндийн байдал, нэмэлт эм тариа, материалаас хамаарч өөрчлөгдөх боломжтойг анхаарна уу.
            </div>
        </div>
    );
};

export default Pricing;
