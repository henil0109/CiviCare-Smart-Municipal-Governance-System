import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, CheckCircle, Clock, ShieldCheck, Activity, Search } from 'lucide-react';
import GamificationCard from '../components/GamificationCard';
import { useEffect, useState } from 'react';
import axios from 'axios';

const UserDashboard = () => {
    const navigate = useNavigate();
    // Get user from local storage directly for initial render
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // State for dashboard data
    const [activeComplaints, setActiveComplaints] = useState(0);
    const [resolvedComplaints, setResolvedComplaints] = useState(0);
    const [recentUpdates, setRecentUpdates] = useState([]);
    const [gamificationStats, setGamificationStats] = useState({
        xp: user.xp || 0,
        level: user.level || 1,
        nextLevelXp: 1000,
        rank: "Novice Citizen"
    });

    useEffect(() => {
        if (user) {
            // Fetch real stats from API
            const fetchStats = async () => {
                try {
                    const token = localStorage.getItem('token');

                    // 1. Fetch Complaints
                    const resVideo = await axios.get('/api/complaints', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    // 2. Fetch User Profile (for XP/Level)
                    const resProfile = await axios.get('/api/auth/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    // Update local user state with real XP/Level
                    if (resProfile.data && resProfile.data.stats) {
                        const realStats = resProfile.data.stats;
                        setGamificationStats({
                            xp: realStats.xp,
                            level: realStats.level,
                            nextLevelXp: realStats.nextLevelXp,
                            rank: realStats.rank
                        });
                    }

                    const myComplaints = resVideo.data;
                    const active = myComplaints.filter(c => c.status !== 'Resolved').length;
                    const resolved = myComplaints.filter(c => c.status === 'Resolved').length;

                    setActiveComplaints(active);
                    setResolvedComplaints(resolved);

                    // Format recent updates
                    const updates = myComplaints.slice(0, 3).map(c => ({
                        id: c._id,
                        title: c.title,
                        status: c.status,
                        time: new Date(c.updated_at || c.created_at).toLocaleDateString()
                    }));
                    setRecentUpdates(updates);

                } catch (e) {
                    console.error("Failed to load dashboard stats", e);
                }
            };
            fetchStats();
        }
    }, []);

    // If no user, technically ProtectedRoute handles this, but safe fallback
    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-outfit">
            {/* Dashboard Header - Premium Light */}
            <div className="bg-white sticky top-0 z-20 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-b border-slate-100">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
                                Welcome back, {user.username}! 👋
                            </h1>
                            <p className="text-slate-500 font-medium text-sm">Here's what's happening in your city today.</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            {/* Track Complaint Input */}
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Track ID (e.g. 65b...)"
                                    className="pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all w-full md:w-64 text-sm shadow-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (!e.target.value.trim()) {
                                                alert("Please enter a Complaint ID");
                                                return;
                                            }
                                            window.location.href = `/complaints/${e.target.value.trim()}`;
                                        }
                                    }}
                                />
                                <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <Search size={18} />
                                </div>
                            </div>

                            <Link to="/complaint/new">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-xl font-bold shadow-[0_8px_20px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2 whitespace-nowrap transition-all text-sm w-full md:w-auto h-full"
                                >
                                    <Zap size={18} className="fill-current" /> Report Issue
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 space-y-8">
                {/* Stats & Gamification Row */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Gamification Card - Takes 1 column */}
                    <div className="md:col-span-1">
                        <GamificationCard
                            xp={gamificationStats.xp}
                            level={gamificationStats.level}
                            nextLevelXp={gamificationStats.nextLevelXp}
                            rank={gamificationStats.rank}
                        />
                    </div>

                    {/* Stats Grid - Takes 2 columns */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-6">
                        <Link to="/my-complaints" onClick={() => localStorage.setItem('complaint_filter', 'Active')}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-full cursor-pointer hover:shadow-lg hover:border-amber-200 transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="w-14 h-14 bg-amber-50 rounded-2xl text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm border border-amber-100 group-hover:border-transparent">
                                        <Clock size={28} />
                                    </div>
                                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">{activeComplaints}</span>
                                </div>
                                <div className="mt-6">
                                    <p className="font-extrabold text-slate-900 text-xl">Active Reports</p>
                                    <p className="text-slate-500 mt-1 font-medium">Cases currently in progress</p>
                                </div>
                            </motion.div>
                        </Link>

                        <Link to="/my-complaints" onClick={() => localStorage.setItem('complaint_filter', 'Resolved')}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-full cursor-pointer hover:shadow-lg hover:border-emerald-200 transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm border border-emerald-100 group-hover:border-transparent">
                                        <CheckCircle size={28} />
                                    </div>
                                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">{resolvedComplaints}</span>
                                </div>
                                <div className="mt-6">
                                    <p className="font-extrabold text-slate-900 text-xl">Resolved Issues</p>
                                    <p className="text-slate-500 mt-1 font-medium">Successfully closed cases</p>
                                </div>
                            </motion.div>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity & Quick Actions */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Activity Feed */}
                    <div className="md:col-span-2 bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100 shadow-sm">
                                    <Activity size={20} />
                                </div>
                                Recent Activity
                            </h3>
                            <Link to="/my-complaints" className="text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors hover:underline">View All History</Link>
                        </div>

                        <div className="space-y-6">
                            {recentUpdates.length > 0 ? recentUpdates.map((update, i) => (
                                <div key={i} className="flex gap-5 items-start group relative">
                                    {/* Timeline line */}
                                    {i !== recentUpdates.length - 1 && (
                                        <div className="absolute left-2.5 top-8 bottom-[-24px] w-0.5 bg-slate-100" />
                                    )}
                                    <div className="w-5 h-5 mt-1.5 rounded-full bg-blue-100 border-4 border-white shadow-sm shrink-0 flex items-center justify-center z-10">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-150 transition-transform" />
                                    </div>
                                    <div className="flex-1 pb-6">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-slate-800 text-lg">{update.title}</p>
                                            <span className="text-xs text-slate-400 font-semibold bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{update.time}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-3">
                                            <span className={`text-[11px] uppercase font-bold px-3 py-1 rounded-full border shadow-sm ${update.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                {update.status}
                                            </span>
                                            <p className="text-sm text-slate-500 font-medium">Status update received</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                    <p className="text-slate-500 font-medium">No recent activity detected.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <div className="bg-red-50 rounded-[2rem] p-8 border border-red-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group h-full flex flex-col">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
                            <div className="relative z-10 flex-grow">
                                <h3 className="font-extrabold text-2xl mb-3 text-red-700 flex items-center gap-3 tracking-tight">
                                    <div className="w-12 h-12 bg-white text-red-600 rounded-full flex items-center justify-center shadow-sm border border-red-100">
                                        <ShieldCheck size={24} />
                                    </div>
                                    Emergency?
                                </h3>
                                <p className="text-red-900/70 text-base mb-8 font-medium leading-relaxed">Report critical hazards that need immediate high-priority attention from our emergency response teams.</p>
                            </div>
                            <button
                                onClick={() => navigate('/complaint/new', { state: { isEmergency: true } })}
                                className="bg-red-600 text-white w-full py-4 rounded-xl font-bold hover:bg-red-700 transition-all shadow-[0_8px_20px_rgba(220,38,38,0.3)] hover:-translate-y-0.5 mt-auto text-lg flex items-center justify-center gap-2 relative z-10"
                            >
                                <Zap size={20} className="fill-current" />
                                Emergency Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
