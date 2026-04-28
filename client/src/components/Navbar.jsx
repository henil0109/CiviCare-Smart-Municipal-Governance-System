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
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none font-outfit">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`pointer-events-auto rounded-full transition-all duration-500 ease-out ${scrolled
                    ? 'bg-slate-50/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(111,76,62,0.15)] border border-slate-200/80 py-3 px-6 w-full max-w-5xl'
                    : 'bg-transparent border border-transparent py-6 px-8 w-full max-w-7xl'
                    } flex items-center justify-between`}
            >
                {/* Logo */}
                <Link to="/" className={`flex items-center gap-2 group transition-opacity duration-300 ${isActive('/') && !scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div className="bg-blue-600 text-slate-50 p-2 rounded-xl shadow-md group-hover:bg-blue-700 transition-colors">
                        <Shield size={22} />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">CiviCare</span>
                </Link>

                {/* Desktop Menu */}
                <div className={`hidden md:flex items-center gap-1 p-1 rounded-full transition-colors ${scrolled ? 'bg-slate-100/50 border border-slate-200/50' : 'bg-transparent'}`}>
                    {[
                        { name: 'Home', path: '/' },
                        { name: 'About', path: '/about' },
                        { name: 'Services', path: '/services' },
                        ...(user ? [{ name: 'Dashboard', path: '/dashboard' }] : [])
                    ].map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${isActive(item.path)
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                : 'text-slate-600 hover:text-blue-700 hover:bg-slate-200/50'
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
                                    className="relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-slate-200/50 rounded-full transition-colors"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-50 animate-pulse"></span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isNotifOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-3 w-80 bg-slate-50 rounded-3xl shadow-[0_10px_40px_rgb(111,76,62,0.15)] border border-slate-200 overflow-hidden py-2 max-h-[400px] overflow-y-auto z-50"
                                        >
                                            <div className="px-5 py-3 border-b border-slate-200/60 flex justify-between items-center bg-slate-100/50">
                                                <span className="font-extrabold text-slate-900 text-sm tracking-tight">Notifications</span>
                                                <button onClick={() => setIsNotifOpen(false)} className="text-xs font-bold text-blue-600 hover:text-blue-700">Close</button>
                                            </div>

                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-slate-500 text-sm font-medium">No new notifications</div>
                                            ) : (
                                                <div className="divide-y divide-slate-100">
                                                    {notifications.map(n => (
                                                        <div
                                                            key={n._id}
                                                            className={`p-4 text-sm hover:bg-slate-100 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/50' : ''}`}
                                                            onClick={async () => {
                                                                if (!n.read) await handleMarkRead(n._id);
                                                                setIsNotifOpen(false);
                                                            }}
                                                        >
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-bold text-slate-900">{n.title}</span>
                                                                {!n.read && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1 shadow-sm"></span>}
                                                            </div>
                                                            <p className="text-slate-600 text-xs mb-2 leading-relaxed font-medium">{n.message}</p>
                                                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                <span>{new Date(n.created_at).toLocaleDateString()}</span>
                                                                {n.read && <Check size={14} className="text-emerald-500" />}
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
                                    className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-full hover:bg-slate-200/50 transition-all border border-transparent hover:border-slate-300"
                                >
                                    <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <ChevronDown size={16} className={`text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-3 w-64 bg-slate-50 rounded-3xl shadow-[0_10px_40px_rgb(111,76,62,0.15)] border border-slate-200 overflow-hidden py-2"
                                        >
                                            <div className="px-5 py-4 border-b border-slate-200/60 bg-slate-100/50">
                                                <p className="text-sm font-extrabold text-slate-900 tracking-tight">{user.username}</p>
                                                <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{user.email}</p>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-blue-700 hover:bg-slate-100 flex items-center gap-3 transition-colors"
                                                >
                                                    <User size={16} className="text-slate-400" /> My Profile
                                                </Link>
                                                <Link
                                                    to="/dashboard"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-blue-700 hover:bg-slate-100 flex items-center gap-3 transition-colors"
                                                >
                                                    <LayoutDashboard size={16} className="text-slate-400" /> Dashboard
                                                </Link>
                                            </div>
                                            <div className="h-px bg-slate-200 my-1 mx-4"></div>
                                            <div className="p-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors"
                                                >
                                                    <LogOut size={16} /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="px-6 py-2.5 rounded-full text-sm font-bold text-slate-700 hover:bg-slate-200/50 transition-all">
                                Login
                            </Link>
                            <Link to="/register" className="px-6 py-2.5 rounded-full text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all">
                                Register
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
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
                        className="fixed inset-x-4 top-24 bg-slate-50 rounded-3xl shadow-[0_10px_40px_rgb(111,76,62,0.15)] p-6 border border-slate-200 md:hidden pointer-events-auto"
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
                                    className={`p-4 rounded-2xl font-bold transition-colors ${isActive(item.path) ? 'bg-blue-50 text-blue-700' : 'text-slate-700 active:bg-slate-100'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="h-px bg-slate-200 my-3 mx-2"></div>
                            {!user ? (
                                <div className="flex flex-col gap-3 mt-2">
                                    <Link to="/login" className="w-full py-3.5 rounded-2xl text-center font-bold bg-slate-100 text-slate-800 hover:bg-slate-200">
                                        Login
                                    </Link>
                                    <Link to="/register" className="w-full py-3.5 rounded-2xl text-center font-bold bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                                        Register
                                    </Link>
                                </div>
                            ) : (
                                <button onClick={handleLogout} className="w-full mt-2 py-3.5 rounded-2xl text-center font-bold bg-red-50 text-red-600 hover:bg-red-100">
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
