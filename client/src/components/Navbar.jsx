import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, ChevronDown, Bell, Shield, LayoutDashboard, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Navbar = ({ user, setUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();

    // Handle scroll effect for floating navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch Notifications
    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(res.data);
                setUnreadCount(res.data.filter(n => !n.read).length);
            } catch (err) {
                console.error("Failed to fetch notifications");
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user]);

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
        setIsOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`pointer-events-auto rounded-full transition-all duration-500 ease-out ${scrolled
                    ? 'bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-blue-900/20 border border-blue-500/30 py-3 px-6 w-full max-w-5xl'
                    : 'bg-transparent border border-transparent py-6 px-8 w-full max-w-7xl'
                    } flex items-center justify-between`}
            >
                {/* Logo */}
                <Link to="/" className={`flex items-center gap-2 group transition-opacity duration-300 ${isActive('/') && !scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <img
                        src="/logo.png"
                        alt="CiviCare Logo"
                        className="h-10 w-auto group-hover:scale-105 transition-transform"
                    />
                </Link>

                {/* Desktop Menu */}
                <div className={`hidden md:flex items-center gap-1 p-1 rounded-full transition-colors ${scrolled ? 'bg-slate-800/50 border border-slate-700' : 'bg-transparent'}`}>
                    {[
                        { name: 'Home', path: '/' },
                        { name: 'About', path: '/about' },
                        { name: 'Services', path: '/services' },
                        ...(user ? [{ name: 'Dashboard', path: '/dashboard' }] : [])
                    ].map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${isActive(item.path)
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            {/* Notification Bell */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                                    className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isNotifOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-2 w-80 bg-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden py-2 max-h-[400px] overflow-y-auto z-50"
                                        >
                                            <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center">
                                                <span className="font-bold text-white text-sm">Notifications</span>
                                                <button onClick={() => setIsNotifOpen(false)} className="text-xs text-blue-400 hover:underline">Close</button>
                                            </div>

                                            {notifications.length === 0 ? (
                                                <div className="p-6 text-center text-slate-500 text-sm">No new notifications</div>
                                            ) : (
                                                <div className="divide-y divide-white/5">
                                                    {notifications.map(n => (
                                                        <div
                                                            key={n._id}
                                                            className={`p-3 text-sm hover:bg-slate-800 transition-colors cursor-pointer ${!n.read ? 'bg-blue-900/20' : ''}`}
                                                            onClick={async () => {
                                                                if (!n.read) await handleMarkRead(n._id);
                                                                // Extract ID if message contains it (basic logic)
                                                                // Ideally, notification should carry target_link
                                                                setIsNotifOpen(false);
                                                            }}
                                                        >
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-bold text-slate-200">{n.title}</span>
                                                                {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 status-dot"></span>}
                                                            </div>
                                                            <p className="text-slate-400 text-xs mb-1 leading-relaxed">{n.message}</p>
                                                            <div className="flex justify-between items-center text-[10px] text-slate-500">
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

                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-800 transition-all border border-transparent hover:border-white/10"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-2 w-56 bg-slate-900 rounded-2xl shadow-xl border border-white/10 overflow-hidden py-2"
                                        >
                                            <div className="px-4 py-3 border-b border-white/5 bg-slate-800/50">
                                                <p className="text-sm font-bold text-white">{user.username}</p>
                                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                            </div>
                                            <Link
                                                to="/profile"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                                            >
                                                <User size={16} /> My Profile
                                            </Link>
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                                            >
                                                <LayoutDashboard size={16} /> Dashboard
                                            </Link>
                                            <div className="h-px bg-white/5 my-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                                            >
                                                <LogOut size={16} /> Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="px-5 py-2.5 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all">
                                Login
                            </Link>
                            <Link to="/register" className="px-5 py-2.5 rounded-full text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
                                Register
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-x-4 top-24 bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 md:hidden pointer-events-auto"
                    >
                        <div className="flex flex-col gap-2">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'About', path: '/about' },
                                { name: 'Services', path: '/services' },
                                ...(user ? [{ name: 'Dashboard', path: '/dashboard' }] : [])
                            ].map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`p-3 rounded-xl font-medium transition-colors ${isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 active:bg-gray-50'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="h-px bg-gray-100 my-2"></div>
                            {!user ? (
                                <>
                                    <Link to="/login" className="w-full py-3 rounded-xl text-center font-bold bg-gray-100 text-gray-800">
                                        Login
                                    </Link>
                                    <Link to="/register" className="w-full py-3 rounded-xl text-center font-bold bg-blue-600 text-white">
                                        Register
                                    </Link>
                                </>
                            ) : (
                                <button onClick={handleLogout} className="w-full py-3 rounded-xl text-center font-bold bg-red-50 text-red-600">
                                    Logout
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Navbar;
