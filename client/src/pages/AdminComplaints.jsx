import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Search,
    MapPin,
    MoreVertical,
    Eye,
    Download,
    X,
    Filter,
} from 'lucide-react';
import Button from '../components/ui/Button';

const AdminComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [priorityFilter, setPriorityFilter] = useState('All Priorities');
    const [userIdFilter, setUserIdFilter] = useState(location.state?.userId || null);

    // Status Update State
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [adminRemark, setAdminRemark] = useState('');

    useEffect(() => {
        if (location.state?.userId) {
            setUserIdFilter(location.state.userId);
        }
    }, [location.state]);

    useEffect(() => {
        fetchComplaints();
    }, []);

    useEffect(() => {
        filterComplaints();
    }, [complaints, searchTerm, statusFilter, priorityFilter, userIdFilter]);

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/complaints', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const filterComplaints = () => {
        let temp = [...complaints];

        if (userIdFilter) {
            temp = temp.filter(c => c.user_id === userIdFilter || c.created_by === userIdFilter);
        }

        if (searchTerm) {
            temp = temp.filter(c =>
                c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.location_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c._id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'All Statuses') {
            temp = temp.filter(c => c.status === statusFilter);
        }

        if (priorityFilter !== 'All Priorities') {
            temp = temp.filter(c => c.priority === priorityFilter);
        }

        setFilteredComplaints(temp);
    };

    const handleExportCSV = () => {
        const headers = ["ID,Title,Category,Priority,Status,Location,Date"];
        const rows = filteredComplaints.map(c =>
            `${c._id},"${c.title}",${c.category},${c.priority},${c.status},"${c.location_address}",${new Date(c.created_at).toLocaleDateString()}`
        );
        const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "complaints_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const openStatusModal = (complaint) => {
        setSelectedComplaint(complaint);
        setNewStatus(complaint.status);
        setAdminRemark('');
        setShowStatusModal(true);
    };

    const handleUpdateStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/complaints/${selectedComplaint._id}`, {
                status: newStatus,
                remark: adminRemark
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            setComplaints(complaints.map(c =>
                c._id === selectedComplaint._id ? { ...c, status: newStatus } : c
            ));
            setShowStatusModal(false);
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-700 bg-red-50 border-red-200';
            case 'Medium': return 'text-amber-700 bg-amber-50 border-amber-200';
            default: return 'text-emerald-700 bg-emerald-50 border-emerald-200';
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500 font-outfit font-medium">Loading complaints...</div>;

    return (
        <div className="font-outfit pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Complaints Handling</h1>
                    <p className="text-slate-500 font-medium mt-1">Track, update and resolve citizen reported issues.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_rgba(37,99,235,0.2)] font-bold rounded-xl"
                    >
                        <Download size={18} /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Active Filters Display */}
            {userIdFilter && (
                <div className="mb-6 flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <span className="text-sm font-bold text-blue-900 flex items-center gap-2">
                        <Filter size={16} /> Filtering by User:
                    </span>
                    <span className="bg-white text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 border border-blue-200 shadow-sm">
                        {location.state?.username ? `${location.state.username} ` : ''}({userIdFilter.substring(0, 8)}...)
                        <button onClick={() => setUserIdFilter(null)} className="hover:text-red-500 transition-colors bg-blue-50 p-0.5 rounded"><X size={12} /></button>
                    </span>
                    <button
                        onClick={() => setUserIdFilter(null)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 ml-auto bg-white px-3 py-1.5 rounded-lg shadow-sm border border-red-100"
                    >
                        Clear Filter
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-1 rounded-xl border border-slate-200 flex items-center gap-2 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all shadow-sm">
                    <div className="pl-3">
                        <Search size={18} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search title, ID, location..."
                        className="w-full outline-none text-sm bg-transparent py-2.5 text-slate-900 placeholder-slate-400 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="bg-white p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option>All Statuses</option>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option>Rejected</option>
                </select>
                <select
                    className="bg-white p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm cursor-pointer"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                >
                    <option>All Priorities</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                </select>
            </div>

            {/* Complaints List */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-5 pl-8 text-xs font-bold text-slate-500 uppercase tracking-widest">ID & Title</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Location</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredComplaints.length > 0 ? filteredComplaints.map((complaint) => (
                                <tr key={complaint._id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-5 pl-8">
                                        <div>
                                            <p className="font-bold text-slate-900 truncate max-w-[250px] group-hover:text-blue-600 transition-colors" title={complaint.title}>{complaint.title}</p>
                                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wide">#{complaint._id.substring(0, 8)} • {complaint.category}</p>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 truncate max-w-[180px]" title={complaint.location_address}>
                                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                                <MapPin size={12} />
                                            </div>
                                            {complaint.location_address || 'No Location'}
                                        </div>
                                    </td>
                                    <td className="p-5 text-sm font-semibold text-slate-600">
                                        {new Date(complaint.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-sm ${getPriorityColor(complaint.priority)}`}>
                                            {complaint.priority}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border shadow-sm ${getStatusColor(complaint.status)}`}>
                                            {complaint.status}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right pr-8">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => navigate(`/admin/complaints/${complaint._id}`)}
                                                className="w-8 h-8 flex items-center justify-center text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => openStatusModal(complaint)}
                                                className="w-8 h-8 flex items-center justify-center text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm"
                                                title="Update Status"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
                                            <Search size={24} />
                                        </div>
                                        <p className="text-slate-500 font-medium">No complaints found matching your filters.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Status Update Modal */}
            {showStatusModal && selectedComplaint && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl border border-slate-100 animate-fade-in">
                        <button
                            onClick={() => setShowStatusModal(false)}
                            className="absolute top-6 right-6 w-8 h-8 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <X size={16} />
                        </button>

                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Update Complaint</h2>
                        <p className="text-sm font-medium text-slate-500 mb-8 bg-slate-50 inline-block px-3 py-1 rounded-md border border-slate-100">ID: #{selectedComplaint._id.substring(0, 8)}</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                                <select
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm cursor-pointer"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Admin Remark</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm resize-none"
                                    rows="4"
                                    placeholder="Add internal notes or feedback..."
                                    value={adminRemark}
                                    onChange={(e) => setAdminRemark(e.target.value)}
                                ></textarea>
                            </div>

                            <Button onClick={handleUpdateStatus} className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.2)]">
                                Save Updates
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminComplaints;
