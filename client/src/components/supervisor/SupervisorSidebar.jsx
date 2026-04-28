import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    Users,
    History,
    LogOut,
    Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

const SupervisorSidebar = ({ isOpen, toggleSidebar, user: propUser, setUser }) => {
    const location = useLocation();
    const navigate = useNavigate();
    // Prefer propUser (reactive), fallback to localStorage
    const user = propUser || JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (setUser) setUser(null); // Update global state
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Command Center', path: '/supervisor/dashboard' },
        { icon: ClipboardList, label: 'Active Operations', path: '/supervisor/tasks' },
        { icon: Users, label: 'Squad Status', path: '/supervisor/team' },
        { icon: History, label: 'Mission History', path: '/supervisor/history' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Container */}
            <motion.div
                className={`fixed top-0 left-0 h-full bg-white border-r border-slate-200 text-slate-800 w-64 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
                            <Shield size={18} />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-slate-800">Field Command</span>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                                }`}
                        >
                            <item.icon size={20} className={`${isActive(item.path) ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* User Profile / Logout */}
                <div className="absolute bottom-0 left-0 w-full p-6 border-t border-slate-100 bg-white">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-slate-500 hover:text-red-600 transition-colors w-full"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>

                    <div className="mt-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-sm font-bold uppercase text-white shadow-sm">
                            {user.username ? user.username.substring(0, 2) : 'SU'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">{user.username}</p>
                            <p className="text-xs text-purple-600 font-mono uppercase">Supervisor</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default SupervisorSidebar;
