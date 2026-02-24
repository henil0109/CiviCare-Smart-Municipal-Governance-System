import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SupervisorSidebar from './SupervisorSidebar';
import { Menu } from 'lucide-react';

const SupervisorLayout = ({ user, setUser }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <SupervisorSidebar
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                user={user}
                setUser={setUser}
            />

            <div className="flex-1 md:ml-64 transition-all duration-300">
                {/* Mobile Header */}
                <div className="md:hidden bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-gray-900">Field Command</span>
                </div>

                <main className="p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SupervisorLayout;
