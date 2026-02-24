import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Bell,
    Check,
    AlertTriangle,
    Info,
    CheckCircle,
    Clock,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, is_read: true } : n
            ));
        } catch (err) {
            console.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        // Optimistically update UI + call API for each unread (ideal: bulk API endpoint)
        const unread = notifications.filter(n => !n.is_read);
        const token = localStorage.getItem('token');

        unread.forEach(async (n) => {
            await axios.put(`/api/notifications/${n._id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        });

        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'alert': return <AlertTriangle className="text-white" size={20} />;
            case 'success': return <CheckCircle className="text-white" size={20} />;
            case 'warning': return <Clock className="text-white" size={20} />;
            default: return <Info className="text-white" size={20} />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'alert': return 'bg-red-500';
            case 'success': return 'bg-green-500';
            case 'warning': return 'bg-orange-500';
            default: return 'bg-blue-500';
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading notifications...</div>;

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500">Stay updated with latest system alerts and activities.</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <motion.div
                                key={notif._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`bg-white p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md relative overflow-hidden ${!notif.is_read ? 'border-blue-100 bg-blue-50/30' : 'border-gray-100'
                                    }`}
                            >
                                <div className={`absolute top-0 left-0 w-1 h-full ${!notif.is_read ? 'bg-blue-500' : 'bg-transparent'
                                    }`}></div>

                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${getBgColor(notif.type)} shadow-lg shadow-blue-500/20`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`font-semibold ${!notif.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {notif.title}
                                            </h3>
                                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                {new Date(notif.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                                            {notif.message}
                                        </p>
                                    </div>
                                    {!notif.is_read && (
                                        <button
                                            onClick={() => markAsRead(notif._id)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-full transition-colors self-center"
                                            title="Mark as read"
                                        >
                                            <Check size={18} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No notifications yet</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminNotifications;
