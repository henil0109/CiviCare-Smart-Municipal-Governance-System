import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const links = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/complaints', label: 'Complaints', icon: <FileText size={20} /> },
        { path: '/admin/team', label: 'Staff & Team', icon: <Users size={20} /> },
        { path: '/admin/citizens', label: 'Citizens', icon: <Users size={20} /> },
        { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
            <div className="mb-8 p-2">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="AdminPanel" className="h-8 w-auto" />
                        <span className="text-xl font-bold">AdminPanel</span>
                    </div>
                </h1>
            </div>

            <nav className="flex-1 space-y-2">
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(link.path)
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        {link.icon}
                        <span>{link.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="border-t border-slate-700 pt-4 mt-auto">
                <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 hover:text-red-300 w-full rounded-lg transition-colors">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
