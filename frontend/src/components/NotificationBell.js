import React, { useState, useEffect, useRef } from 'react';
import API_URL from '../apiConfig';

const NotificationBell = ({ user }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/notifications?userId=${user._id}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data);
                setUnreadCount(data.data.filter(n => !n.read).length);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markAsRead = async (id) => {
        try {
            const res = await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PUT'
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const res = await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id })
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '22px',
                    position: 'relative',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'inherit'
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white',
                        fontWeight: 'bold'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '320px',
                    maxHeight: '400px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    border: '1px solid #eee',
                    zIndex: 1000,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        padding: '15px',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#fafafa'
                    }}>
                        <strong style={{ color: '#1a1a2e' }}>Мэдэгдэл</strong>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    color: '#3498db',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Бүгдийг уншсанаар тэмдэглэх
                            </button>
                        )}
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '30px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                                Шинэ мэдэгдэл байхгүй байна.
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n._id}
                                    onClick={() => !n.read && markAsRead(n._id)}
                                    style={{
                                        padding: '15px',
                                        borderBottom: '1px solid #f9f9f9',
                                        backgroundColor: n.read ? 'white' : 'rgba(162,162,223,0.05)',
                                        cursor: n.read ? 'default' : 'pointer',
                                        transition: 'background 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    {!n.read && (
                                        <div style={{
                                            position: 'absolute',
                                            left: '8px',
                                            top: '20px',
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: '#e74c3c'
                                        }} />
                                    )}
                                    <div style={{ paddingLeft: '10px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333', marginBottom: '4px' }}>{n.title}</div>
                                        <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.4' }}>{n.message}</div>
                                        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '6px' }}>
                                            {new Date(n.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
