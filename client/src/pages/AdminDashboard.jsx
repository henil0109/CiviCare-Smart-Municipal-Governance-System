import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Users,
    CheckCircle,
    Clock,
    AlertTriangle,
    TrendingUp,
    MoreVertical,
    Loader,
    Activity,
    Bell,
    ChevronRight,
    Zap,
    Trophy,
    Star,
    Shield,
    Megaphone,
    Calendar,
    FileText,
    Award,
    Flame
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- Components ---

const StatCard = ({ icon: Icon, label, value, gradient, trend, trendUp }) => (
    <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        className={`relative overflow-hidden p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/20 ${gradient} text-white group`}
    >
        <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon size={120} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
                    <Icon size={24} className="text-white" />
                </div>
                {trend && (
                    <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center backdrop-blur-sm border border-white/10 shadow-sm ${trendUp ? 'bg-emerald-400/30 text-emerald-50' : 'bg-red-400/30 text-red-50'
                        }`}>
                        <TrendingUp size={12} className="mr-1" /> {trend}
                    </span>
                )}
            </div>
            <p className="text-white/80 text-xs font-bold tracking-widest uppercase mb-1">{label}</p>
            <h3 className="text-4xl font-extrabold tracking-tight drop-shadow-sm">{value}</h3>
        </div>
    </motion.div>
);

const ActionWidget = ({ icon: Icon, label, desc, onClick, colorClass, delay }) => (
    <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.05 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`flex items-center p-4 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-[0_8px_20px_rgb(0,0,0,0.04)] hover:border-slate-200 transition-all gap-4 text-left group w-full`}
    >
        <div className={`w-12 h-12 rounded-2xl ${colorClass} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300`}>
            <Icon size={20} />
        </div>
        <div>
            <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{label}</h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{desc}</p>
        </div>
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 transform translate-x-[-5px] group-hover:translate-x-0">
            <ChevronRight size={18} />
        </div>
    </motion.button>
);

const HallOfFameCard = ({ rank, user, metric, label, icon: Icon, color }) => (
    <motion.div
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex items-center gap-4 bg-white border border-slate-100 p-3 rounded-2xl hover:bg-slate-50 hover:shadow-sm transition-all group"
    >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm text-sm ${rank === 1 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-900' :
            rank === 2 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800' :
                rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-900' :
                    'bg-slate-700'
            }`}>
            {rank}
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 truncate text-sm group-hover:text-blue-600 transition-colors">{user.username}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">{user.role || 'Leader'}</p>
        </div>
        <div className="text-right px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-blue-100 transition-colors">
            <div className={`flex items-center justify-end gap-1.5 font-bold text-sm ${color}`}>
                <Icon size={14} /> {typeof metric === 'number' && metric % 1 !== 0 ? metric.toFixed(1) : metric}
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{label}</p>
        </div>
    </motion.div>
);

const DepartmentCard = ({ dept }) => {
    const load = Math.round(dept.load_percentage) || 0;
    let statusColor = "bg-emerald-500";
    let statusBg = "bg-emerald-50";
    let statusText = "Healthy";

    if (load > 40) { statusColor = "bg-amber-500"; statusBg = "bg-amber-50"; statusText = "Moderate"; }
    if (load > 75) { statusColor = "bg-red-500"; statusBg = "bg-red-50"; statusText = "Critical"; }

    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-sm transition-all">
            <div className="flex items-center gap-4">
                <div className={`w-2 h-10 rounded-full ${statusColor} shadow-sm`}></div>
                <div>
                    <h4 className="font-extrabold text-slate-900 text-sm mb-0.5">{dept.category}</h4>
                    <p className="text-xs text-slate-500 font-medium">{dept.pending} pending / {dept.total} total</p>
                </div>
            </div>
            <div className="text-right">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${statusBg} text-slate-700 border border-slate-200/50 shadow-sm inline-block mb-1`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusColor} inline-block mr-1.5 align-middle`}></span>
                    {statusText}
                </span>
                <p className="text-[10px] font-bold text-slate-400">{load}% Load</p>
            </div>
        </div>
    );
};

const ActivityItem = ({ item }) => (
    <div className="flex gap-4 relative pb-6 last:pb-0 group">
        <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50 group-hover:scale-125 transition-transform z-10"></div>
            <div className="w-px h-full bg-slate-200 absolute top-3"></div>
        </div>
        <div className="pb-2 flex-1">
            <p className="text-sm font-bold text-slate-900 mb-0.5">
                {item.by} <span className="font-medium text-slate-500">{item.action.toLowerCase()}</span>
            </p>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.note}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
                {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, analyticsRes, notifsRes] = await Promise.all([
                axios.get('/api/admin/stats', { headers }),
                axios.get('/api/admin/analytics', { headers }),
                axios.get('/api/notifications', { headers })
            ]);

            setStats(statsRes.data);
            setAnalytics({ ...analyticsRes.data, notifications: notifsRes.data });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <Loader className="animate-spin text-blue-600" size={40} />
        </div>
    );

    if (!stats) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500 font-outfit">
            <AlertTriangle size={48} className="mb-4 text-red-500" />
            <p className="font-bold text-slate-700">Failed to load dashboard data.</p>
            <button onClick={fetchDashboardData} className="mt-4 text-blue-600 font-bold hover:underline text-sm">
                Retry
            </button>
        </div>
    );

    const hallOfFame = stats?.gamification?.hall_of_fame || {};
    const expanded = stats?.expanded_stats || { department_health: [], recent_activity: [] };

    return (
        <div className="min-h-screen bg-slate-50 pb-12 animate-fade-in space-y-8 font-outfit">
            {/* Header with AI Pill */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-6 px-4 md:px-6 xl:px-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                        Command<span className="text-blue-600">Center</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">
                        Overview of city operations and staff performance.
                    </p>
                </div>

                {analytics?.alerts?.length > 0 && (
                    <div className="lg:w-auto bg-white border border-slate-200 rounded-2xl p-1.5 flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-xl">
                        <div className="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-bold text-white flex items-center gap-2 uppercase tracking-wider shrink-0 shadow-sm animate-pulse">
                            <Zap size={14} fill="currentColor" /> AI Insight
                        </div>
                        <div className="px-4 py-1 overflow-hidden">
                            <p className="text-slate-700 text-xs font-semibold truncate">
                                {analytics.alerts[0].msg}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Stats Grid */}
            <div className="px-4 md:px-6 xl:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={AlertTriangle}
                        label="Critical Issues"
                        value={stats.pending}
                        gradient="bg-gradient-to-br from-red-500 to-rose-600"
                        trend="+12%"
                        trendUp={false}
                    />
                    <StatCard
                        icon={Clock}
                        label="In Progress"
                        value={stats.in_progress}
                        gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                        trend="+5 Active"
                        trendUp={true}
                    />
                    <StatCard
                        icon={CheckCircle}
                        label="Resolved (YTD)"
                        value={stats.resolved}
                        gradient="bg-gradient-to-br from-emerald-400 to-emerald-600"
                        trend="+24%"
                        trendUp={true}
                    />
                    <StatCard
                        icon={Award}
                        label="Efficiency Score"
                        value="94%"
                        gradient="bg-gradient-to-br from-purple-500 to-purple-700"
                        trend="Top Tier"
                        trendUp={true}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-4 md:px-6 xl:px-8">
                {/* Left Column: Charts & New Features */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Main Chart */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Ticket Volume & Forecast</h3>
                                <p className="text-slate-500 font-medium text-xs mt-1">AI-driven workload prediction vs actuals</p>
                            </div>
                            <div className="flex gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span> Actual</div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm animate-pulse"></span> Predicted</div>
                            </div>
                        </div>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
                                        labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', fontSize: '14px' }}
                                    />
                                    <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={4} fill="url(#colorActual)" />
                                    <Area type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={4} strokeDasharray="6 6" fill="url(#colorPred)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Operational Status & Activity Split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Department Health */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                            <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 shrink-0">
                                    <Activity size={16} />
                                </div>
                                Dept. Load Analysis
                            </h3>
                            <div className="space-y-3 h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                                {expanded.department_health?.map((dept) => (
                                    <DepartmentCard key={dept._id} dept={dept} />
                                ))}
                                {expanded.department_health?.length === 0 && <p className="text-sm text-slate-400 font-medium text-center py-4">No data available.</p>}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                            <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                                    <Bell size={16} />
                                </div>
                                Live Feed
                            </h3>
                            <div className="h-[240px] overflow-y-auto pr-4 custom-scrollbar">
                                {expanded.recent_activity?.map((item, i) => (
                                    <ActivityItem key={i} item={item} />
                                ))}
                                {expanded.recent_activity?.length === 0 && <p className="text-sm text-slate-400 font-medium text-center py-4">No recent activity.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ActionWidget
                            icon={Megaphone}
                            label="Broadcast"
                            desc="Send alerts"
                            colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
                            onClick={() => alert('Broadcast Panel Opening...')}
                            delay={1}
                        />
                        <ActionWidget
                            icon={FileText}
                            label="Reports"
                            desc="PDF Summaries"
                            colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600"
                            onClick={() => navigate('/admin/reports')}
                            delay={2}
                        />
                        <ActionWidget
                            icon={Users}
                            label="Manage Team"
                            desc="Staff & Roles"
                            colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600"
                            onClick={() => navigate('/admin/settings')}
                            delay={3}
                        />
                        <ActionWidget
                            icon={Calendar}
                            label="Schedule"
                            desc="Maintenance"
                            colorClass="bg-gradient-to-br from-amber-500 to-orange-500"
                            onClick={() => { }}
                            delay={4}
                        />
                    </div>
                </div>

                {/* Right Column: Hall of Fame */}
                <div className="bg-white rounded-[2rem] p-8 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-fit">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-50 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-orange-500/20">
                                <Trophy size={24} className="text-white" fill="currentColor" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hall of Fame</h2>
                                <p className="text-slate-500 font-medium text-sm mt-0.5">Top Performers & Speedsters</p>
                            </div>
                        </div>

                        {/* Top Solvers Section */}
                        <div className="mb-8">
                            <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Flame size={14} fill="currentColor" /> Top Solvers
                            </h3>
                            <div className="space-y-3">
                                {hallOfFame.top_solvers?.length > 0 ? (
                                    hallOfFame.top_solvers.map((solver, i) => (
                                        <HallOfFameCard
                                            key={solver._id}
                                            rank={i + 1}
                                            user={{ username: solver._id, role: solver.role }}
                                            metric={solver.count}
                                            label="Solved"
                                            icon={CheckCircle}
                                            color="text-emerald-500"
                                        />
                                    ))
                                ) : (
                                    <p className="text-slate-400 text-sm italic">No data yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Efficiency Kings Section */}
                        <div className="mb-8">
                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Zap size={14} fill="currentColor" /> Speedsters <span className="text-[10px] text-slate-400 font-bold ml-auto">(Avg Days)</span>
                            </h3>
                            <div className="space-y-3">
                                {hallOfFame.efficiency_kings?.length > 0 ? (
                                    hallOfFame.efficiency_kings.map((king, i) => (
                                        <HallOfFameCard
                                            key={king._id}
                                            rank={i + 1}
                                            user={{ username: king._id, role: king.role }}
                                            metric={king.avg_days}
                                            label="Days/Tkt"
                                            icon={Clock}
                                            color="text-amber-500"
                                        />
                                    ))
                                ) : (
                                    <p className="text-slate-400 text-sm italic">No data yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Top Citizens */}
                        <div>
                            <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Star size={14} fill="currentColor" /> Top Citizens
                            </h3>
                            <div className="space-y-3">
                                {stats.gamification?.top_citizens?.map((c, i) => (
                                    <HallOfFameCard
                                        key={c._id}
                                        rank={i + 1}
                                        user={c}
                                        metric={c.xp}
                                        label="Total XP"
                                        icon={Award}
                                        color="text-emerald-500"
                                    />
                                ))}
                                {(!stats.gamification?.top_citizens || stats.gamification.top_citizens.length === 0) && (
                                    <p className="text-slate-400 text-sm italic">No data yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
