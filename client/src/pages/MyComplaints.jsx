import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Calendar, MapPin, AlertCircle, Eye } from 'lucide-react';

const MyComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchMyComplaints = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/complaints', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setComplaints(res.data);

                // Check if directed from dashboard with a filter
                const savedFilter = localStorage.getItem('complaint_filter');
                if (savedFilter) {
                    setFilter(savedFilter);
                    localStorage.removeItem('complaint_filter'); // Clear it
                } else {
                    setFilteredComplaints(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyComplaints();
    }, []);

    useEffect(() => {
        let result = complaints;

        // Filter by Status
        if (filter !== 'All') {
            if (filter === 'Active') {
                result = result.filter(c => c.status !== 'Resolved' && c.status !== 'Rejected');
            } else {
                result = result.filter(c => c.status === filter);
            }
        }

        // Search by Title, ID, or Category
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(c =>
                c.title.toLowerCase().includes(lowerSearch) ||
                c.category.toLowerCase().includes(lowerSearch) ||
                c._id.toLowerCase().includes(lowerSearch)
            );
        }

        setFilteredComplaints(result);
    }, [filter, search, complaints]);

    const stats = {
        total: complaints.length,
        active: complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Rejected').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 relative font-outfit">
            {/* Header Background - Premium Light */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-blue-50 to-slate-50 z-0">
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                {/* Hero Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 bg-white border border-blue-100 px-4 py-1.5 rounded-full mb-6 shadow-sm"
                        >
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Citizen Dashboard</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight"
                        >
                            My Complaints
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-500 text-lg mt-3 font-medium"
                        >
                            Track, Manage, and Resolve your civic reports.
                        </motion.p>
                    </div>

                    <Link to="/complaint/new">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgba(37,99,235,0.2)] flex items-center gap-3 transition-all h-full"
                        >
                            <Plus size={20} className="fill-current" />
                            <span>New Complaint</span>
                        </motion.button>
                    </Link>
                </div>

                {/* Stats Command Center - Premium Light Bento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { label: 'Total Reports', value: stats.total, color: 'text-blue-600', icon: 'bg-blue-50', border: 'border-blue-100' },
                        { label: 'Active Issues', value: stats.active, color: 'text-amber-600', icon: 'bg-amber-50', border: 'border-amber-100' },
                        { label: 'Resolved', value: stats.resolved, color: 'text-emerald-600', icon: 'bg-emerald-50', border: 'border-emerald-100' }
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-8 rounded-[2.5rem] bg-white border ${stat.border} shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all relative overflow-hidden group`}
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.icon} rounded-bl-full transition-transform group-hover:scale-125`}></div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3 relative z-10">{stat.label}</p>
                            <p className={`text-6xl font-black ${stat.color} tracking-tighter relative z-10`}>{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Control Panel: Search & Filters */}
                <div className="bg-white p-3 rounded-2xl border border-slate-100 mb-10 flex flex-col md:flex-row gap-4 justify-between items-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex bg-slate-50 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto custom-scrollbar border border-slate-100">
                        {['All', 'Active', 'Resolved', 'Rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === status
                                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search ID, Category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none text-slate-900 placeholder-slate-400 transition-all font-medium shadow-sm"
                        />
                    </div>
                </div>

                {/* Grid Content */}
                {loading ? (
                    <div className="text-center py-24">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-slate-500 font-medium">Retrieving your records...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {filteredComplaints.length > 0 ? (
                                filteredComplaints.map((c, i) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                        key={c._id}
                                        className="h-full"
                                    >
                                        <Link to={`/complaints/${c._id}`} className="block h-full cursor-pointer group">
                                            <motion.div
                                                whileHover={{ y: -5 }}
                                                className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-hover:border-slate-200 transition-all h-full flex flex-col relative overflow-hidden"
                                            >
                                                {c.priority === 'High' && (
                                                    <div className="absolute top-0 right-0 bg-red-50 text-red-600 border border-red-100 text-[9px] uppercase font-black px-4 py-1.5 rounded-bl-2xl tracking-widest shadow-sm">High Priority</div>
                                                )}

                                                <div className="flex justify-between items-start mb-6 mt-2">
                                                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 shadow-sm">
                                                        {c.category}
                                                    </div>
                                                    <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        c.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}>
                                                        {c.status}
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-extrabold text-slate-900 mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors tracking-tight">
                                                    {c.title}
                                                </h3>
                                                <p className="text-slate-500 text-sm mb-8 line-clamp-2 flex-1 leading-relaxed font-medium">
                                                    {c.description}
                                                </p>

                                                <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                        <Calendar size={14} className="text-slate-400" />
                                                        {new Date(c.created_at).toLocaleDateString()}
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                                                        <Eye size={14} />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                    <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 border border-slate-100">
                                        <AlertCircle size={40} />
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-slate-900 mb-2">No Records Found</h3>
                                    <p className="text-slate-500 font-medium text-lg">Try adjusting your filters to find what you're looking for.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyComplaints;
