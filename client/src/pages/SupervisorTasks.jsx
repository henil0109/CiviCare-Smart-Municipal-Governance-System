import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    MapPin, Calendar, Clock, AlertTriangle, ChevronRight,
    ClipboardList, Users, Phone, Mail, Briefcase, Star,
    RefreshCw, CheckCircle, User
} from 'lucide-react';
import Button from '../components/ui/Button';

// ── Status / Priority badge ────────────────────────────────────────────────
const Badge = ({ label, type = 'default' }) => {
    const styles = {
        High: 'bg-red-100 text-red-700',
        Medium: 'bg-orange-100 text-orange-700',
        Low: 'bg-yellow-100 text-yellow-700',
        'In Progress': 'bg-blue-100 text-blue-700',
        'Pending Verification': 'bg-purple-100 text-purple-700',
        Pending: 'bg-gray-100 text-gray-600',
        Resolved: 'bg-green-100 text-green-700',
        Rejected: 'bg-red-100 text-red-500',
        default: 'bg-gray-100 text-gray-600'
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide ${styles[label] || styles.default}`}>
            {label}
        </span>
    );
};

// ── Field Officer Card ─────────────────────────────────────────────────────
const FieldOfficerCard = ({ officer }) => {
    if (!officer) return null;
    const initials = officer.username?.slice(0, 2).toUpperCase() || 'FO';
    return (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                {officer.profile_photo
                    ? <img src={officer.profile_photo} alt={officer.username}
                        className="w-10 h-10 rounded-full object-cover" />
                    : initials
                }
            </div>
            {/* Details */}
            <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{officer.username}</p>
                <p className="text-xs text-blue-600 font-medium capitalize">{officer.specialization || 'Field Officer'}</p>
            </div>
            {/* Contact icons */}
            <div className="flex flex-col gap-1">
                {officer.phone && officer.phone !== 'N/A' && (
                    <a href={`tel:${officer.phone}`}
                        className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                        title={`Call ${officer.username}`}>
                        <Phone size={12} />
                        <span className="hidden sm:inline">{officer.phone}</span>
                    </a>
                )}
                {officer.email && (
                    <a href={`mailto:${officer.email}`}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        title={`Email ${officer.username}`}>
                        <Mail size={12} />
                        <span className="hidden sm:inline truncate max-w-[120px]">{officer.email}</span>
                    </a>
                )}
            </div>
        </div>
    );
};

// ── Team Section ───────────────────────────────────────────────────────────
const TeamSection = ({ task }) => {
    const [expanded, setExpanded] = useState(false);

    if (!task.field_officers?.length && !task.team_details) return (
        <div className="flex items-center gap-2 mt-3 text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <AlertTriangle size={14} />
            <span className="text-xs font-medium">No team assigned yet</span>
        </div>
    );

    const officers = task.field_officers || [];
    const team = task.team_details;

    return (
        <div className="mt-3">
            <button
                onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors group"
            >
                <Users size={15} />
                <span>
                    {team ? `${team.name} ` : ''}
                    ({officers.length} Field Officer{officers.length !== 1 ? 's' : ''})
                </span>
                <ChevronRight size={14} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>

            {expanded && (
                <div className="mt-3 space-y-2">
                    {team && (
                        <div className="flex items-center gap-2 mb-2">
                            <Briefcase size={13} className="text-gray-400" />
                            <span className="text-xs text-gray-500 font-medium">
                                {team.specialization} Team
                            </span>
                        </div>
                    )}
                    {officers.length > 0
                        ? officers.map((o, i) => <FieldOfficerCard key={o.id || i} officer={o} />)
                        : <p className="text-xs text-gray-400 italic">Team has no members assigned.</p>
                    }
                </div>
            )}
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────
const SupervisorTasks = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchTasks = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('/api/supervisor/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Show only active (non-resolved) tasks in this view
            const active = (data.tasks || []).filter(t => !['Resolved', 'Rejected'].includes(t.status));
            setTasks(active);
            setLastUpdated(new Date());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(() => fetchTasks(), 60000);
        return () => clearInterval(interval);
    }, [fetchTasks]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500">Loading Field Ops...</p>
            </div>
        </div>
    );

    // Apply filter
    const filtered = filter === 'all'
        ? tasks
        : filter === 'high'
            ? tasks.filter(t => t.priority === 'High')
            : tasks.filter(t => t.status === filter);

    const filterBtns = [
        { key: 'all', label: 'All', count: tasks.length },
        { key: 'high', label: '🔴 High Priority', count: tasks.filter(t => t.priority === 'High').length },
        { key: 'In Progress', label: 'In Progress', count: tasks.filter(t => t.status === 'In Progress').length },
        { key: 'Pending Verification', label: 'Needs Verification', count: tasks.filter(t => t.status === 'Pending Verification').length },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ClipboardList size={22} className="text-blue-600" />
                        Active Operations
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Live missions — with field officer assignments.
                        {lastUpdated && <span className="text-gray-400 ml-2">Updated {lastUpdated.toLocaleTimeString()}</span>}
                    </p>
                </div>
                <button
                    onClick={() => fetchTasks(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-sm rounded-xl transition-all disabled:opacity-60"
                >
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {filterBtns.map(fb => (
                    <button
                        key={fb.key}
                        onClick={() => setFilter(fb.key)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 
                            ${filter === fb.key
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                            }`}
                    >
                        {fb.label}
                        <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold
                            ${filter === fb.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {fb.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tasks */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <CheckCircle size={44} className="text-green-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-600">No active missions in this filter.</p>
                    <p className="text-sm text-gray-400 mt-1">All clear — check other filters or check back later.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map(task => (
                        <div key={task._id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all p-5">
                            {/* Top row */}
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1 min-w-0 space-y-2">
                                    {/* Badges */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge label={task.priority} />
                                        <Badge label={task.status} />
                                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600 uppercase">
                                            {task.category}
                                        </span>
                                        {task.is_emergency && (
                                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-600 text-white uppercase animate-pulse">
                                                🚨 Emergency
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>

                                    {/* Meta */}
                                    <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={13} />
                                            {task.location_address || 'Geotagged'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={13} />
                                            {new Date(task.created_at).toLocaleDateString('en-IN', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </span>
                                        {task.status === 'Pending Verification' && (
                                            <span className="flex items-center gap-1 text-purple-600 font-medium">
                                                <Clock size={13} />
                                                Awaiting Verification
                                            </span>
                                        )}
                                    </div>

                                    {/* Field Officers Section */}
                                    <TeamSection task={task} />
                                </div>

                                {/* Action */}
                                <div className="flex flex-col items-start md:items-end gap-1 flex-shrink-0">
                                    <Button
                                        onClick={() => navigate(`/supervisor/complaints/${task._id}`)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100 px-6 flex items-center gap-2"
                                    >
                                        Execute Mission <ChevronRight size={16} />
                                    </Button>
                                    {task.status === 'In Progress' && (
                                        <span className="text-[10px] text-gray-400">Open to Submit Proof</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SupervisorTasks;
