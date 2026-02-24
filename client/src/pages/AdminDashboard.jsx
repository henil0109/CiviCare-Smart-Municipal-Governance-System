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
        className={`relative overflow-hidden p-5 rounded-2xl shadow-lg border border-white/20 ${gradient} text-white group`}
    >
        <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon size={100} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md shadow-inner">
                    <Icon size={20} className="text-white" />
                </div>
                {trend && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center backdrop-blur-sm border border-white/10 ${trendUp ? 'bg-emerald-400/30 text-emerald-50' : 'bg-red-400/30 text-red-50'
                        }`}>
                        <TrendingUp size={10} className="mr-1" /> {trend}
                    </span>
                )}
            </div>
            <p className="text-blue-50 text-xs font-bold tracking-wider uppercase opacity-80">{label}</p>
            <h3 className="text-3xl font-bold mt-1 tracking-tight drop-shadow-sm">{value}</h3>
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
        className={`flex items-center p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all gap-3 text-left group w-full`}
    >
        <div className={`w-10 h-10 rounded-xl ${colorClass} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300`}>
            <Icon size={20} />
        </div>
        <div>
            <h4 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{label}</h4>
            <p className="text-[10px] text-gray-500 font-medium">{desc}</p>
        </div>
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 transform translate-x-[-5px] group-hover:translate-x-0 transition-transform">
            <ChevronRight size={16} />
        </div>
    </motion.button>
);

const HallOfFameCard = ({ rank, user, metric, label, icon: Icon, color }) => (
    <motion.div
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-xl hover:bg-white/10 transition-colors"
    >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md text-xs ${rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-yellow-900' :
            rank === 2 ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-800' :
                rank === 3 ? 'bg-gradient-to-br from-orange-300 to-amber-700 text-orange-900' :
                    'bg-gray-700'
            }`}>
            {rank}
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-bold text-white truncate text-sm">{user.username}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{user.role || 'Leader'}</p>
        </div>
        <div className="text-right px-2 py-1 rounded-lg bg-black/20 backdrop-blur-sm border border-white/5">
            <div className="flex items-center justify-end gap-1 text-white font-bold text-sm">
                <Icon size={12} className={color} /> {typeof metric === 'number' && metric % 1 !== 0 ? metric.toFixed(1) : metric}
            </div>
            <p className="text-[9px] text-gray-400 font-medium uppercase">{label}</p>
        </div>
    </motion.div>
);

const DepartmentCard = ({ dept }) => {
    // Load = Pending/Total. High Load = Bad.
    const load = Math.round(dept.load_percentage) || 0;
    let statusColor = "bg-emerald-500";
    let statusText = "Healthy";

    if (load > 40) { statusColor = "bg-amber-500"; statusText = "Moderate"; }
    if (load > 75) { statusColor = "bg-red-500"; statusText = "Critical"; }

    return (
        <div className="flex items-center justify-between p-3 bg-white/50 border border-gray-100 rounded-xl">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-10 rounded-full ${statusColor}`}></div>
                <div>
                    <h4 className="font-bold text-gray-800 text-sm">{dept.category}</h4>
                    <p className="text-[10px] text-gray-500">{dept.pending} pending / {dept.total} total</p>
                </div>
            </div>
            <div className="text-right">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${statusColor}`}>
                    {statusText}
                </span>
                <p className="text-[10px] font-bold text-gray-400 mt-1">{load}% Load</p>
            </div>
        </div>
    );
};

const ActivityItem = ({ item }) => (
    <div className="flex gap-3 relative pb-4 last:pb-0">
        <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
            <div className="w-0.5 h-full bg-gray-100 absolute top-2.5"></div>
        </div>
        <div className="pb-2">
            <p className="text-xs font-bold text-gray-800">
                {item.by} <span className="font-medium text-gray-500">{item.action.toLowerCase()}</span>
            </p>
            <p className="text-[10px] text-gray-500 line-clamp-1">{item.note}</p>
            <p className="text-[9px] text-gray-300 mt-0.5">
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
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <Loader className="animate-spin text-indigo-600" size={40} />
        </div>
    );

    if (!stats) return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-400">
            <AlertTriangle size={48} className="mb-4 text-red-400" />
            <p className="font-bold">Failed to load dashboard data.</p>
            <button onClick={fetchDashboardData} className="mt-4 text-blue-500 hover:underline text-sm">
                Retry
            </button>
        </div>
    );

    const hallOfFame = stats?.gamification?.hall_of_fame || {};
    const expanded = stats?.expanded_stats || { department_health: [], recent_activity: [] };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12 animate-fade-in space-y-6">
            {/* Header with AI Pill */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">
                        Command<span className="text-blue-600">Center</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-sm">
                        Overview of city operations and staff performance.
                    </p>
                </div>

                {analytics?.alerts?.length > 0 && (
                    <div className="lg:w-auto bg-white border border-gray-200 rounded-xl p-1 flex items-center shadow-sm max-w-xl">
                        <div className="bg-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white flex items-center gap-2 uppercase tracking-wide shrink-0 animate-pulse">
                            <Zap size={12} fill="currentColor" /> AI Insight
                        </div>
                        <div className="px-3 py-1 overflow-hidden">
                            <p className="text-gray-700 text-xs font-medium truncate">
                                {analytics.alerts[0].msg}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={AlertTriangle}
                    label="Critical Issues"
                    value={stats.pending}
                    gradient="bg-gradient-to-br from-orange-400 to-red-500"
                    trend="+12%"
                    trendUp={false}
                />
                <StatCard
                    icon={Clock}
                    label="In Progress"
                    value={stats.in_progress}
                    gradient="bg-gradient-to-br from-blue-400 to-blue-600"
                    trend="+5 Active"
                    trendUp={true}
                />
                <StatCard
                    icon={CheckCircle}
                    label="Resolved (YTD)"
                    value={stats.resolved}
                    gradient="bg-gradient-to-br from-emerald-400 to-green-600"
                    trend="+24%"
                    trendUp={true}
                />
                <StatCard
                    icon={Award}
                    label="Efficiency Score"
                    value="94%"
                    gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
                    trend="Top Tier"
                    trendUp={true}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column: Charts & New Features */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Main Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Ticket Volume & Forecast</h3>
                                <p className="text-gray-400 text-xs mt-0.5">AI-driven workload prediction vs actuals</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm"></span> Actual</div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500"><span className="w-2 h-2 rounded-full bg-purple-500 shadow-sm animate-pulse"></span> AI Predicted</div>
                            </div>
                        </div>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="3 3" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                                        labelStyle={{ fontWeight: 700, color: '#111827', marginBottom: '4px', fontSize: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} fill="url(#colorActual)" />
                                    <Area type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={3} strokeDasharray="4 4" fill="url(#colorPred)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* NEW: Operational Status & Activity Split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Department Health */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Activity size={16} className="text-rose-500" /> Dept. Load Analysis
                            </h3>
                            <div className="space-y-2 h-[200px] overflow-y-auto pr-1">
                                {expanded.department_health?.map((dept) => (
                                    <DepartmentCard key={dept._id} dept={dept} />
                                ))}
                                {expanded.department_health?.length === 0 && <p className="text-xs text-gray-400">No data available.</p>}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Bell size={16} className="text-blue-500" /> Live Feed
                            </h3>
                            <div className="h-[200px] overflow-y-auto pr-1">
                                {expanded.recent_activity?.map((item, i) => (
                                    <ActivityItem key={i} item={item} />
                                ))}
                                {expanded.recent_activity?.length === 0 && <p className="text-xs text-gray-400">No recent activity.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <ActionWidget
                            icon={Megaphone}
                            label="Broadcast"
                            desc="Send alerts"
                            colorClass="bg-gradient-to-br from-blue-500 to-cyan-500"
                            onClick={() => alert('Broadcast Panel Opening...')}
                            delay={1}
                        />
                        <ActionWidget
                            icon={FileText}
                            label="Reports"
                            desc="PDF Summaries"
                            colorClass="bg-gradient-to-br from-violet-500 to-purple-500"
                            onClick={() => navigate('/admin/reports')}
                            delay={2}
                        />
                        <ActionWidget
                            icon={Users}
                            label="Manage Team"
                            desc="Staff & Roles"
                            colorClass="bg-gradient-to-br from-emerald-500 to-green-500"
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
                <div className="bg-[#1e293b] rounded-3xl p-6 text-white relative overflow-hidden shadow-xl ring-4 ring-gray-900/5">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-lg shadow-lg shadow-orange-500/20">
                                <Trophy size={20} className="text-white" fill="currentColor" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight">Hall of Fame</h2>
                                <p className="text-gray-400 font-medium text-xs">Top Performers & Speedsters</p>
                            </div>
                        </div>

                        {/* Top Solvers Section */}
                        <div className="mb-6">
                            <h3 className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-3 flex items-center gap-1.5 opacity-80">
                                <Flame size={10} fill="currentColor" /> Top Solvers
                            </h3>
                            <div className="space-y-2">
                                {hallOfFame.top_solvers?.length > 0 ? (
                                    hallOfFame.top_solvers.map((solver, i) => (
                                        <HallOfFameCard
                                            key={solver._id}
                                            rank={i + 1}
                                            user={{ username: solver._id, role: solver.role }}
                                            metric={solver.count}
                                            label="Solved"
                                            icon={CheckCircle}
                                            color="text-emerald-400"
                                        />
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-xs italic">No data yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Efficiency Kings Section */}
                        <div className="mb-6">
                            <h3 className="text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-3 flex items-center gap-1.5 opacity-80">
                                <Zap size={10} fill="currentColor" /> Speedsters (Avg Days)
                            </h3>
                            <div className="space-y-2">
                                {hallOfFame.efficiency_kings?.length > 0 ? (
                                    hallOfFame.efficiency_kings.map((king, i) => (
                                        <HallOfFameCard
                                            key={king._id}
                                            rank={i + 1}
                                            user={{ username: king._id, role: king.role }}
                                            metric={king.avg_days}
                                            label="Days/Tkt"
                                            icon={Clock}
                                            color="text-amber-400"
                                        />
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-xs italic">No data yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Top Citizens */}
                        <div>
                            <h3 className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-3 flex items-center gap-1.5 opacity-80">
                                <Star size={10} fill="currentColor" /> Top Citizens
                            </h3>
                            <div className="space-y-2">
                                {stats.gamification?.top_citizens?.map((c, i) => (
                                    <HallOfFameCard
                                        key={c._id}
                                        rank={i + 1}
                                        user={c}
                                        metric={c.xp}
                                        label="Total XP"
                                        icon={Award}
                                        color="text-yellow-400"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
