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

    // Handle scroll effect for sleek floating navbar
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
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                // SLEEK & MODERN DESIGN: Thin padding (py-2.5), frosted glass (bg-white/60), vibrant colorful shadow
                className={`pointer-events-auto rounded-full transition-all duration-500 ease-out flex items-center justify-between ${scrolled
                    ? 'bg-white/60 backdrop-blur-2xl shadow-[0_8px_30px_rgba(99,102,241,0.2)] border border-white/80 py-2 px-5 w-full max-w-4xl'
                    : 'bg-white/40 backdrop-blur-xl shadow-[0_8px_20px_rgba(14,165,233,0.1)] border border-white/60 py-3 px-6 w-full max-w-6xl'
                    }`}
            >
                {/* Logo - Vibrant Gradient Text */}
                <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
                    <div className="bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 text-white p-1.5 rounded-xl shadow-md shadow-indigo-500/30">
                        <Shield size={20} className="stroke-[2.5]"/>
                    </div>
                    <span className="font-black text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600">
                        CiviCare
                    </span>
                </Link>

                {/* Desktop Menu - Ultra sleek links */}
                <div className={`hidden md:flex items-center gap-1.5 px-2 rounded-full transition-colors ${scrolled ? 'bg-white/50 border border-white/50 shadow-sm' : 'bg-transparent'}`}>
                    {[
                        { name: 'Home', path: '/' },
                        { name: 'About', path: '/about' },
                        { name: 'Services', path: '/services' },
                        ...(user ? [{ name: 'Dashboard', path: '/dashboard' }] : [])
                    ].map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase transition-all duration-300 ${isActive(item.path)
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-3">
                            {/* Notification Bell */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                                    className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-white/60 rounded-full transition-all hover:shadow-sm border border-transparent hover:border-indigo-100"
                                >
                                    <Bell size={18} className="stroke-[2.5]" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-rose-400 to-red-500 rounded-full border border-white animate-pulse shadow-sm shadow-red-500/50"></span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isNotifOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-3 w-80 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_rgba(79,70,229,0.15)] border border-white overflow-hidden py-2 max-h-[400px] overflow-y-auto z-50 text-slate-800"
                                        >
                                            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                                <span className="font-extrabold text-slate-900 text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Notifications</span>
                                                <button onClick={() => setIsNotifOpen(false)} className="text-[10px] uppercase font-black tracking-wider text-indigo-500 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">Close</button>
                                            </div>

                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-slate-500 text-xs font-bold tracking-wide">No new notifications</div>
                                            ) : (
                                                <div className="divide-y divide-slate-50">
                                                    {notifications.map(n => (
                                                        <div
                                                            key={n._id}
                                                            className={`p-4 text-sm hover:bg-indigo-50/30 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/40' : ''}`}
                                                            onClick={async () => {
                                                                if (!n.read) await handleMarkRead(n._id);
                                                                setIsNotifOpen(false);
                                                            }}
                                                        >
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-bold text-slate-800 text-xs">{n.title}</span>
                                                                {!n.read && <span className="w-2 h-2 bg-indigo-500 rounded-full mt-0.5 shadow-sm shadow-indigo-500/50"></span>}
                                                            </div>
                                                            <p className="text-slate-500 text-[11px] mb-2 leading-relaxed font-medium">{n.message}</p>
                                                            <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
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
                                    className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full hover:bg-white/60 transition-all border border-white/50 shadow-sm"
                                >
                                    <div className="w-7 h-7 bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-3 w-60 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_rgba(79,70,229,0.15)] border border-white overflow-hidden py-2 text-slate-800"
                                        >
                                            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                                                <p className="text-sm font-extrabold text-slate-900 tracking-tight">{user.username}</p>
                                                <p className="text-[10px] font-bold tracking-wide text-slate-500 truncate mt-0.5">{user.email}</p>
                                            </div>
                                            <div className="p-1.5 space-y-0.5">
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 flex items-center gap-2.5 transition-colors"
                                                >
                                                    <User size={14} className="text-indigo-400" /> My Profile
                                                </Link>
                                                <Link
                                                    to="/dashboard"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 flex items-center gap-2.5 transition-colors"
                                                >
                                                    <LayoutDashboard size={14} className="text-indigo-400" /> Dashboard
                                                </Link>
                                            </div>
                                            <div className="h-px bg-slate-100 my-1 mx-4"></div>
                                            <div className="p-1.5">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2.5 transition-colors"
                                                >
                                                    <LogOut size={14} /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase text-slate-600 hover:bg-slate-100/80 transition-all hover:text-slate-900">
                                Login
                            </Link>
                            <Link to="/register" className="px-5 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-indigo-500/30 transition-all hover:scale-105">
                                Register
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="fixed inset-x-4 top-20 bg-white/95 backdrop-blur-3xl rounded-3xl shadow-[0_30px_60px_rgba(79,70,229,0.2)] p-5 border border-white md:hidden pointer-events-auto"
                    >
                        <div className="flex flex-col gap-1.5">
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
                                    className={`p-3 rounded-2xl font-black text-sm uppercase tracking-wide transition-all ${isActive(item.path) ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="h-px bg-slate-100 my-3 mx-2"></div>
                            {!user ? (
                                <div className="flex flex-col gap-2">
                                    <Link to="/login" className="w-full py-3 rounded-2xl text-center font-black text-sm uppercase tracking-wide bg-slate-50 text-slate-600 hover:bg-slate-100">
                                        Login
                                    </Link>
                                    <Link to="/register" className="w-full py-3 rounded-2xl text-center font-black text-sm uppercase tracking-wide bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30">
                                        Register
                                    </Link>
                                </div>
                            ) : (
                                <button onClick={handleLogout} className="w-full py-3 rounded-2xl text-center font-black text-sm uppercase tracking-wide bg-rose-50 text-rose-600 hover:bg-rose-100">
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
