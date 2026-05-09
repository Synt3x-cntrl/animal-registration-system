import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_URL from '../apiConfig';
import './AIChatBot.css';

const AIChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Сайн байна уу! Би бол Amitani Delguur-ийн AI туслах байна. Танд юугаар туслах уу? (Цаг захиалахын тулд Gmail-ээр нэвтрээрэй)' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Орон нутгийн storage-оос хэрэглэгчийн мэдээллийг авна (Login хийсэн бол)
            const userData = JSON.parse(localStorage.getItem('user'));
            
            const response = await axios.post(`${API_URL}/ai/chat`, {
                message: input,
                userId: userData?._id // Нэвтэрсэн хэрэглэгчийн ID
            });

            const aiMessage = { role: 'assistant', content: response.data.reply };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage = { 
                role: 'assistant', 
                content: 'Уучлаарай, холболтонд алдаа гарлаа. Та интернэтээ шалгана уу.' 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ai-chatbot-container">
            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`chat-toggle-btn ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="chat-window"
                    >
                        {/* Header */}
                        <div className="chat-header">
                            <div className="header-info">
                                <div className="bot-icon">
                                    <Bot size={20} color="white" />
                                </div>
                                <div>
                                    <h3>Ухаалаг туслах</h3>
                                    <span>Online</span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)}><X size={18} /></button>
                        </div>

                        {/* Messages Area */}
                        <div className="messages-area">
                            {messages.map((msg, index) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={index}
                                    className={`message-wrapper ${msg.role}`}
                                >
                                    <div className="message-icon">
                                        {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                                    </div>
                                    <div className="message-content">
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="message-wrapper assistant">
                                    <div className="message-icon">
                                        <Loader2 className="animate-spin" size={16} />
                                    </div>
                                    <div className="message-content loading">
                                        Бодож байна...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="input-area">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Мессеж бичих..."
                            />
                            <button onClick={handleSend} disabled={isLoading}>
                                <Send size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIChatBot;
