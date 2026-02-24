import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Calendar, MapPin, AlertCircle } from 'lucide-react';

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
        <div className="min-h-screen bg-slate-50 pb-20 relative">
            {/* Header Background - Professional Dark Blue */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-slate-900 z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10">
                {/* Hero Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 bg-blue-900/50 border border-blue-500/30 px-3 py-1 rounded-full mb-4"
                        >
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                            <span className="text-xs font-bold text-blue-200 uppercase tracking-wide">Citizen Dashboard</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
                        >
                            My Complaints
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-blue-200 text-lg mt-2 font-light"
                        >
                            Track, Manage, and Resolve your civic reports.
                        </motion.p>
                    </div>

                    <Link to="/complaint/new">
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(37, 99, 235, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg shadow-xl flex items-center gap-2 transition-all"
                        >
                            <Plus size={20} />
                            <span>New Complaint</span>
                        </motion.button>
                    </Link>
                </div>

                {/* Stats Command Center - Professional Light Bento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { label: 'Total Reports', value: stats.total, color: 'text-blue-600', icon: 'bg-blue-50', border: 'border-blue-100' },
                        { label: 'Active Issues', value: stats.active, color: 'text-orange-600', icon: 'bg-orange-50', border: 'border-orange-100' },
                        { label: 'Resolved', value: stats.resolved, color: 'text-emerald-600', icon: 'bg-emerald-50', border: 'border-emerald-100' }
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-8 rounded-3xl bg-white border ${stat.border} shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.icon} rounded-bl-full opacity-50 transition-transform group-hover:scale-110`}></div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">{stat.label}</p>
                            <p className={`text-5xl font-black ${stat.color} tracking-tighter relative z-10`}>{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Control Panel: Search & Filters */}
                <div className="bg-white p-2 rounded-2xl border border-gray-200 mb-10 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
                    <div className="flex bg-gray-100 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto scroller-hide border border-gray-200">
                        {['All', 'Active', 'Resolved', 'Rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === status
                                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search ID, Category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none text-gray-900 placeholder-gray-400 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Grid Content */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 font-medium">Retrieving records...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredComplaints.length > 0 ? (
                                filteredComplaints.map((c, i) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                        key={c._id}
                                    >
                                        <Link to={`/complaints/${c._id}`} className="block h-full cursor-pointer">
                                            <motion.div
                                                whileHover={{ y: -5 }}
                                                className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all h-full flex flex-col relative group overflow-hidden"
                                            >
                                                {c.priority === 'High' && (
                                                    <div className="absolute top-0 right-0 bg-red-50 text-red-600 border border-red-100 text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl">High Priority</div>
                                                )}

                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 uppercase tracking-wide">
                                                        {c.category}
                                                    </div>
                                                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        c.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                            'bg-blue-50 text-blue-600 border-blue-100'
                                                        }`}>
                                                        {c.status}
                                                    </div>
                                                </div>

                                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                    {c.title}
                                                </h3>
                                                <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">
                                                    {c.description}
                                                </p>

                                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        {new Date(c.created_at).toLocaleDateString()}
                                                    </div>

                                                </div>
                                            </motion.div>
                                        </Link>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-200 border-dashed">
                                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <AlertCircle size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Records Found</h3>
                                    <p className="text-gray-500 text-sm">Try adjusting your filters to find what you're looking for.</p>
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
