import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, CheckCircle, Clock, AlertTriangle,
    ChevronRight, Users, TrendingUp, RefreshCw, Shield
} from 'lucide-react';
import Button from '../components/ui/Button';

const StatCard = ({ label, value, icon: Icon, color, bg, border }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border ${border} border-l-4 ${color}`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
                <h2 className="text-3xl font-black text-gray-900 mt-2">{value}</h2>
            </div>
            <div className={`p-3 ${bg} rounded-xl`}>
                <Icon size={22} className={color.replace('border-l-', 'text-')} />
            </div>
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
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Loading Command Center...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield size={24} className="text-blue-600" />
                        Command Center
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Welcome back, <span className="font-semibold text-gray-700">{user.username}</span>.
                        Here is your live situation report.
                    </p>
                    {lastUpdated && (
                        <p className="text-xs text-gray-400 mt-1">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-sm rounded-xl transition-all disabled:opacity-60"
                >
                    <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Active Operations" value={stats.active}
                    icon={AlertTriangle} color="border-l-blue-500"
                    bg="bg-blue-50" border="border-gray-100" />
                <StatCard label="Pending Verification" value={stats.pending_verification}
                    icon={Clock} color="border-l-purple-500"
                    bg="bg-purple-50" border="border-gray-100" />
                <StatCard label="Missions Accomplished" value={stats.completed}
                    icon={CheckCircle} color="border-l-green-500"
                    bg="bg-green-50" border="border-gray-100" />
                <StatCard label="Total Assigned" value={stats.total}
                    icon={TrendingUp} color="border-l-orange-500"
                    bg="bg-orange-50" border="border-gray-100" />
            </div>

            {/* Secondary row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-xl">
                        <AlertTriangle size={22} className="text-red-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-red-700 uppercase tracking-wider">High Priority Active</p>
                        <p className="text-3xl font-black text-red-900">{stats.high_priority}</p>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                        <Users size={22} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Teams Under Command</p>
                        <p className="text-3xl font-black text-blue-900">{stats.teams_count}</p>
                    </div>
                </div>
            </div>

            {/* High Priority Targets */}
            {highPriority.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="p-5 border-b border-red-50 bg-red-50/40 flex justify-between items-center">
                        <h3 className="font-bold text-red-900 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-red-500" />
                            High Priority Targets ({highPriority.length})
                        </h3>
                        <Button
                            onClick={() => navigate('/supervisor/tasks')}
                            className="text-white text-xs font-bold bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2"
                        >
                            View All <ChevronRight size={14} />
                        </Button>
                    </div>

                    <div className="divide-y divide-red-50/60">
                        {highPriority.slice(0, 4).map(task => (
                            <div key={task._id} className="p-5 hover:bg-red-50/20 transition-colors">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                                            {task.title}
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                                                High
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase">
                                                {task.status}
                                            </span>
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1 truncate">{task.location_address || 'Location not specified'}</p>
                                        {/* Field officers quick preview */}
                                        {task.field_officers?.length > 0 && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <Users size={13} className="text-blue-500 flex-shrink-0" />
                                                <span className="text-xs text-blue-600 font-medium">
                                                    {task.field_officers.map(f => f.username).join(', ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => navigate(`/supervisor/complaints/${task._id}`)}
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 flex-shrink-0"
                                    >
                                        Inspect
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center">
                    <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
                    <h3 className="font-bold text-green-800 text-lg">No High Priority Issues!</h3>
                    <p className="text-green-600 text-sm mt-1">All active assignments are at normal priority.</p>
                </div>
            )}
        </div>
    );
};

export default SupervisorDashboard;
