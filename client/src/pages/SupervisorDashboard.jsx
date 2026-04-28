import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, CheckCircle, Clock, AlertTriangle,
    ChevronRight, Users, TrendingUp, RefreshCw, Shield
} from 'lucide-react';
import Button from '../components/ui/Button';

const StatCard = ({ label, value, icon: Icon, color, bg, border }) => (
    <div className={`bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${border} flex flex-col justify-between h-full group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow`}>
        <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center border ${border} shadow-sm group-hover:scale-105 transition-transform`}>
                <Icon size={24} className={color} />
            </div>
        </div>
        <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">{value}</h2>
            <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">{label}</p>
        </div>
    </div>
);

const SupervisorDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0, active: 0, pending: 0,
        pending_verification: 0, completed: 0,
        high_priority: 0, teams_count: 0
    });
    const [highPriority, setHighPriority] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('/api/supervisor/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStats(data.stats);

            // High priority = unresolved High priority tasks
            const hp = (data.tasks || []).filter(t =>
                t.priority === 'High' && !['Resolved', 'Rejected'].includes(t.status)
            );
            setHighPriority(hp);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        // Auto-refresh every 60 seconds
        const interval = setInterval(() => fetchData(), 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading) return (
        <div className="flex items-center justify-center h-64 font-outfit">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Loading Command Center...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 font-outfit pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                            <Shield size={20} />
                        </div>
                        Command Center
                    </h1>
                    <p className="text-slate-500 mt-3 text-lg font-light">
                        Welcome back, <span className="font-bold text-slate-700">{user.username}</span>.
                        Here is your live situation report.
                    </p>
                    {lastUpdated && (
                        <p className="text-xs text-slate-400 mt-2 font-medium">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-all disabled:opacity-60 shadow-sm border border-blue-100 hover:border-blue-200"
                >
                    <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Refreshing...' : 'Refresh Feed'}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Active Operations" value={stats.active}
                    icon={AlertTriangle} color="text-amber-500"
                    bg="bg-amber-50" border="border-amber-100" />
                <StatCard label="Pending Verification" value={stats.pending_verification}
                    icon={Clock} color="text-purple-500"
                    bg="bg-purple-50" border="border-purple-100" />
                <StatCard label="Missions Accomplished" value={stats.completed}
                    icon={CheckCircle} color="text-emerald-500"
                    bg="bg-emerald-50" border="border-emerald-100" />
                <StatCard label="Total Assigned" value={stats.total}
                    icon={TrendingUp} color="text-blue-500"
                    bg="bg-blue-50" border="border-blue-100" />
            </div>

            {/* Secondary row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-red-100 rounded-[2rem] p-8 flex items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100 shadow-sm relative z-10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                        <AlertTriangle size={28} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">High Priority Active</p>
                        <p className="text-5xl font-extrabold text-slate-900 tracking-tight">{stats.high_priority}</p>
                    </div>
                </div>
                <div className="bg-white border border-blue-100 rounded-[2rem] p-8 flex items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm relative z-10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Users size={28} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Teams Under Command</p>
                        <p className="text-5xl font-extrabold text-slate-900 tracking-tight">{stats.teams_count}</p>
                    </div>
                </div>
            </div>

            {/* High Priority Targets */}
            {highPriority.length > 0 ? (
                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-red-100 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-red-50 bg-red-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="font-extrabold text-red-700 flex items-center gap-3 text-xl tracking-tight">
                            <div className="w-10 h-10 rounded-full bg-white text-red-500 flex items-center justify-center border border-red-100 shadow-sm">
                                <AlertTriangle size={20} />
                            </div>
                            High Priority Targets ({highPriority.length})
                        </h3>
                        <Button
                            onClick={() => navigate('/supervisor/tasks')}
                            className="text-white text-sm font-bold bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-xl shadow-[0_4px_15px_rgba(220,38,38,0.2)] transition-all flex items-center gap-2"
                        >
                            View All <ChevronRight size={18} />
                        </Button>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {highPriority.slice(0, 4).map(task => (
                            <div key={task._id} className="p-6 md:p-8 hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-extrabold text-slate-900 flex items-center gap-3 flex-wrap text-lg">
                                            {task.title}
                                            <span className="px-3 py-1 rounded-md text-[10px] font-black bg-red-100 text-red-700 uppercase tracking-widest">
                                                High
                                            </span>
                                            <span className="px-3 py-1 rounded-md text-[10px] font-black bg-slate-100 text-slate-600 uppercase tracking-widest">
                                                {task.status}
                                            </span>
                                        </h4>
                                        <p className="text-sm text-slate-500 mt-2 truncate font-medium flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                            {task.location_address || 'Location not specified'}
                                        </p>
                                        {/* Field officers quick preview */}
                                        {task.field_officers?.length > 0 && (
                                            <div className="flex items-center gap-2 mt-3">
                                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-500">
                                                    <Users size={12} />
                                                </div>
                                                <span className="text-sm text-slate-700 font-bold">
                                                    {task.field_officers.map(f => f.username).join(', ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => navigate(`/supervisor/complaints/${task._id}`)}
                                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-sm px-6 py-3 flex-shrink-0 w-full md:w-auto"
                                    >
                                        Inspect
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-emerald-100 rounded-[2rem] p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mt-32 -z-10" />
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-2xl mb-2 tracking-tight">No High Priority Issues!</h3>
                    <p className="text-slate-500 text-lg font-light">All active assignments are at normal priority.</p>
                </div>
            )}
        </div>
    );
};

export default SupervisorDashboard;
