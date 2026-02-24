import { useState, useEffect } from 'react';
import { Bell, Search, Menu, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const AdminHeader = ({ toggleSidebar }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{"username": "Admin", "role": "admin"}');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    // Fetch Notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get('/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(res.data);
                setUnreadCount(res.data.filter(n => !n.read).length);
            } catch (err) {
                console.error("Failed to fetch notifications in AdminHeader", err);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const handleMarkRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-gray-100 rounded-lg md:hidden text-gray-600"
                >
                    <Menu size={24} />
                </button>

                {/* Search Bar - Could be made functional later for global search */}
                <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2 w-64 border border-gray-100 focus-within:border-blue-200 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search system..."
                        className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-gray-600 placeholder-gray-400"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-600 transition-colors relative"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>

                    <AnimatePresence>
                        {isNotifOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2 max-h-[400px] overflow-y-auto z-50 origin-top-right"
                            >
                                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <span className="font-bold text-gray-800 text-sm">Notifications</span>
                                    <button onClick={() => setIsNotifOpen(false)} className="text-xs text-blue-500 hover:underline">Close</button>
                                </div>

                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-gray-400 text-sm">No new notifications</div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {notifications.map(n => (
                                            <div
                                                key={n._id}
                                                className={`p-3 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/50' : ''}`}
                                                onClick={async () => {
                                                    if (!n.read) await handleMarkRead(n._id);
                                                }}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`font-bold ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</span>
                                                    {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></span>}
                                                </div>
                                                <p className="text-gray-500 text-xs mb-1 leading-relaxed">{n.message}</p>
                                                <div className="flex justify-between items-center text-[10px] text-gray-400">
                                                    <span>{new Date(n.created_at).toLocaleDateString()}</span>
                                                    {n.read && <Check size={12} className="text-emerald-500" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                        <p className="text-xs text-blue-600 font-medium capitalize">{user.role === 'admin' ? 'Administrator' : user.role}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
