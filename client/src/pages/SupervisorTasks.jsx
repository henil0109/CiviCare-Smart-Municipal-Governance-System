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
        High: 'bg-red-50 text-red-700 border-red-200',
        Medium: 'bg-amber-50 text-amber-700 border-amber-200',
        Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
        'Pending Verification': 'bg-purple-50 text-purple-700 border-purple-200',
        Pending: 'bg-slate-50 text-slate-700 border-slate-200',
        Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        Rejected: 'bg-red-50 text-red-700 border-red-200',
        default: 'bg-slate-50 text-slate-600 border-slate-200'
    };
    return (
        <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-sm ${styles[label] || styles.default}`}>
            {label}
        </span>
    );
};

// ── Field Officer Card ─────────────────────────────────────────────────────
const FieldOfficerCard = ({ officer }) => {
    if (!officer) return null;
    const initials = officer.username?.slice(0, 2).toUpperCase() || 'FO';
    return (
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-slate-200 transition-colors">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-extrabold text-sm flex-shrink-0 shadow-sm">
                {officer.profile_photo
                    ? <img src={officer.profile_photo} alt={officer.username}
                        className="w-full h-full rounded-xl object-cover" />
                    : initials
                }
            </div>
            {/* Details */}
            <div className="flex-1 min-w-0">
                <p className="font-extrabold text-slate-900 text-sm truncate">{officer.username}</p>
                <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wide mt-0.5">{officer.specialization || 'Field Officer'}</p>
            </div>
            {/* Contact icons */}
            <div className="flex flex-col gap-2">
                {officer.phone && officer.phone !== 'N/A' && (
                    <a href={`tel:${officer.phone}`}
                        className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 transition-colors"
                        title={`Call ${officer.username}`}>
                        <Phone size={12} />
                        <span className="hidden sm:inline">{officer.phone}</span>
                    </a>
                )}
                {officer.email && (
                    <a href={`mailto:${officer.email}`}
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold bg-blue-50 px-2 py-1 rounded-md border border-blue-100 transition-colors"
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
        <div className="flex items-center gap-2 mt-4 text-xs text-amber-700 font-bold bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 shadow-sm uppercase tracking-wide">
            <AlertTriangle size={16} className="text-amber-500" />
            <span>No team assigned yet</span>
        </div>
    );

    const officers = task.field_officers || [];
    const team = task.team_details;

    return (
        <div className="mt-4 pt-4 border-t border-slate-100">
            <button
                onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-2 text-sm font-extrabold text-blue-600 hover:text-blue-700 transition-colors group bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 w-full sm:w-auto shadow-sm"
            >
                <Users size={16} />
                <span>
                    {team ? `${team.name} ` : ''}
                    ({officers.length} Field Officer{officers.length !== 1 ? 's' : ''})
                </span>
                <ChevronRight size={16} className={`transition-transform ml-auto sm:ml-2 ${expanded ? 'rotate-90' : ''}`} />
            </button>

            {expanded && (
                <div className="mt-4 space-y-3">
                    {team && (
                        <div className="flex items-center gap-2 mb-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 inline-flex">
                            <Briefcase size={14} className="text-slate-400" />
                            <span className="text-xs text-slate-600 font-bold uppercase tracking-wide">
                                {team.specialization} Team
                            </span>
                        </div>
                    )}
                    {officers.length > 0
                        ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{officers.map((o, i) => <FieldOfficerCard key={o.id || i} officer={o} />)}</div>
                        : <p className="text-sm font-medium text-slate-400 italic p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">Team has no members assigned.</p>
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
        <div className="flex items-center justify-center h-64 font-outfit">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Loading Field Ops...</p>
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
        { key: 'all', label: 'All Operations', count: tasks.length },
        { key: 'high', label: '🔴 High Priority', count: tasks.filter(t => t.priority === 'High').length },
        { key: 'In Progress', label: 'In Progress', count: tasks.filter(t => t.status === 'In Progress').length },
        { key: 'Pending Verification', label: 'Needs Verification', count: tasks.filter(t => t.status === 'Pending Verification').length },
    ];

    return (
        <div className="font-outfit pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                            <ClipboardList size={20} />
                        </div>
                        Active Operations
                    </h1>
                    <p className="text-slate-500 text-lg font-medium mt-3 flex items-center flex-wrap gap-2">
                        Live missions with field officer assignments.
                        {lastUpdated && <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md text-slate-400">Updated {lastUpdated.toLocaleTimeString()}</span>}
                    </p>
                </div>
                <button
                    onClick={() => fetchTasks(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all disabled:opacity-60 shadow-sm shrink-0"
                >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin text-blue-600' : 'text-slate-400'} />
                    {refreshing ? 'Refreshing...' : 'Refresh Feed'}
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                {filterBtns.map(fb => (
                    <button
                        key={fb.key}
                        onClick={() => setFilter(fb.key)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center gap-3 whitespace-nowrap shadow-sm border
                            ${filter === fb.key
                                ? 'bg-blue-600 border-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.2)]'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        {fb.label}
                        <span className={`text-[10px] rounded-lg px-2 py-1 font-black
                            ${filter === fb.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                            {fb.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tasks */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 text-emerald-500">
                        <CheckCircle size={32} />
                    </div>
                    <p className="text-xl font-extrabold text-slate-900 mb-2">No active missions in this filter.</p>
                    <p className="text-slate-500 font-medium">All clear — check other filters or check back later.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filtered.map(task => (
                        <div key={task._id}
                            className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-200 transition-all p-6 md:p-8">
                            {/* Top row */}
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                <div className="flex-1 min-w-0 space-y-4">
                                    {/* Badges */}
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <Badge label={task.priority} />
                                        <Badge label={task.status} />
                                        <span className="px-3 py-1 rounded-md text-[10px] font-black bg-slate-50 border border-slate-200 text-slate-500 uppercase tracking-widest shadow-sm">
                                            {task.category}
                                        </span>
                                        {task.is_emergency && (
                                            <span className="px-3 py-1 rounded-md text-[10px] font-black bg-red-600 text-white uppercase tracking-widest shadow-[0_4px_10px_rgba(220,38,38,0.3)] animate-pulse">
                                                🚨 Emergency
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{task.title}</h3>

                                    {/* Meta */}
                                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium flex-wrap">
                                        <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            <MapPin size={16} className="text-slate-400" />
                                            {task.location_address || 'Geotagged Location'}
                                        </span>
                                        <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            <Calendar size={16} className="text-slate-400" />
                                            {new Date(task.created_at).toLocaleDateString('en-IN', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </span>
                                        {task.status === 'Pending Verification' && (
                                            <span className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 text-purple-700 font-bold">
                                                <Clock size={16} className="text-purple-500" />
                                                Awaiting Verification
                                            </span>
                                        )}
                                    </div>

                                    {/* Field Officers Section */}
                                    <TeamSection task={task} />
                                </div>

                                {/* Action */}
                                <div className="flex flex-col items-start lg:items-end gap-3 flex-shrink-0 mt-2 lg:mt-0">
                                    <Button
                                        onClick={() => navigate(`/supervisor/complaints/${task._id}`)}
                                        className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-[0_8px_20px_rgba(37,99,235,0.2)] px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm"
                                    >
                                        Execute Mission <ChevronRight size={18} />
                                    </Button>
                                    {task.status === 'In Progress' && (
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-full lg:text-right">Open to Submit Proof</span>
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
