import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, CheckCircle, Clock, ShieldCheck, Activity } from 'lucide-react';
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
                        // We act directly on the GamificationCard props by creating a local object
                        // But better to update the 'user' object in state if we can, 
                        // however 'user' is const. Let's create a local 'stats' state.
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
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Dashboard Header - Professional Dark */}
            <div className="bg-slate-900 sticky top-0 z-20 shadow-lg border-b border-white/5">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
                                Welcome back, {user.username}! 👋
                            </h1>
                            <p className="text-blue-200 font-light text-sm">Here's what's happening in your city today.</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            {/* Track Complaint Input - Integrated Style */}
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Track ID (e.g. 65b...)"
                                    className="pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all w-full md:w-64 text-sm"
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
                                <div className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <ShieldCheck size={18} />
                                </div>
                            </div>

                            <Link to="/complaint/new">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-white text-blue-900 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 whitespace-nowrap transition-all text-sm"
                                >
                                    <Zap size={18} className="fill-current" /> Report Issue
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 space-y-8">
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
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        <Link to="/my-complaints" onClick={() => localStorage.setItem('complaint_filter', 'Active')}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-full cursor-pointer hover:shadow-md hover:border-orange-200 transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-orange-50 rounded-xl text-orange-600 group-hover:bg-orange-100 transition-colors">
                                        <Clock size={24} />
                                    </div>
                                    <span className="text-4xl font-mono font-bold text-slate-900 tracking-tighter">{activeComplaints}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 mt-4">Active Reports</p>
                                    <p className="text-sm text-slate-500">Cases currently in progress</p>
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
                                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-full cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                        <CheckCircle size={24} />
                                    </div>
                                    <span className="text-4xl font-mono font-bold text-slate-900 tracking-tighter">{resolvedComplaints}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 mt-4">Resolved Issues</p>
                                    <p className="text-sm text-slate-500">Successfully closed cases</p>
                                </div>
                            </motion.div>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity & Quick Actions */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Activity Feed */}
                    <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Activity className="text-blue-600" size={20} />
                                Recent Activity
                            </h3>
                            <Link to="/my-complaints" className="text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors hover:underline">View All History</Link>
                        </div>

                        <div className="space-y-6">
                            {recentUpdates.length > 0 ? recentUpdates.map((update, i) => (
                                <div key={i} className="flex gap-4 items-start group">
                                    <div className="w-2 h-2 mt-2.5 rounded-full bg-blue-500 shrink-0 group-hover:scale-150 transition-transform shadow-sm" />
                                    <div className="flex-1 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                                        <div className="flex justify-between">
                                            <p className="font-medium text-slate-800">{update.title}</p>
                                            <span className="text-xs text-slate-400 font-mono">{update.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${update.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                                }`}>
                                                {update.status}
                                            </span>
                                            <p className="text-xs text-slate-500">Status update received</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10">
                                    <p className="text-slate-400 italic">No recent activity detected.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-1 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                            <div className="bg-slate-950/20 backdrop-blur-sm p-6 rounded-[22px] h-full relative z-10">
                                <h3 className="font-bold text-lg mb-2 text-white flex items-center gap-2">
                                    <ShieldCheck className="text-purple-400" /> Emergency?
                                </h3>
                                <p className="text-indigo-200 text-sm mb-4 font-light">Report critical hazards that need immediate high-priority attention.</p>
                                <button
                                    onClick={() => navigate('/complaint/new', { state: { isEmergency: true } })}
                                    className="bg-white text-indigo-900 w-full py-3 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg hover:shadow-indigo-500/20"
                                >
                                    Emergency Report
                                </button>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
