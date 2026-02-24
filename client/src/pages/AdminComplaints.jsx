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
            case 'Resolved': return 'bg-green-100 text-green-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Pending': return 'bg-orange-100 text-orange-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-600 bg-red-50 border-red-100';
            case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-100';
            default: return 'text-green-600 bg-green-50 border-green-100';
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading complaints...</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Complaints Handling</h1>
                    <p className="text-gray-500">Track, update and resolve citizen reported issues.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                    >
                        <Download size={18} /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Active Filters Display */}
            {userIdFilter && (
                <div className="mb-4 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Filtering by User ID:</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        {location.state?.username ? `${location.state.username} ` : ''}({userIdFilter.substring(0, 8)}...)
                        <button onClick={() => setUserIdFilter(null)} className="hover:text-blue-900"><X size={12} /></button>
                    </span>
                    <button
                        onClick={() => setUserIdFilter(null)}
                        className="text-xs text-red-500 hover:underline"
                    >
                        Clear Filter
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-100">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search title, ID, location..."
                        className="w-full outline-none text-sm bg-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="bg-white p-3 rounded-xl border border-gray-200 text-sm text-gray-600 outline-none"
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
                    className="bg-white p-3 rounded-xl border border-gray-200 text-sm text-gray-600 outline-none"
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="p-4 pl-6 text-sm font-semibold text-gray-600">ID & Title</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Location</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Priority</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="p-4 text-sm font-semibold text-gray-600 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredComplaints.length > 0 ? filteredComplaints.map((complaint) => (
                            <tr key={complaint._id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="p-4 pl-6">
                                    <div>
                                        <p className="font-semibold text-gray-900 truncate max-w-[200px]" title={complaint.title}>{complaint.title}</p>
                                        <p className="text-xs text-gray-500">#{complaint._id.substring(0, 8)}... • {complaint.category}</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 truncate max-w-[150px]" title={complaint.location_address}>
                                        <MapPin size={14} className="text-gray-400 shrink-0" />
                                        {complaint.location_address || 'No Location'}
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                    {new Date(complaint.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                                        {complaint.priority}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                                        {complaint.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right pr-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/complaints/${complaint._id}`)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => openStatusModal(complaint)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Update Status"
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    No complaints found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Status Update Modal */}
            {showStatusModal && selectedComplaint && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShowStatusModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-xl font-bold text-gray-900 mb-2">Update Complaint</h2>
                        <p className="text-sm text-gray-500 mb-6">Changing status for complaint #{selectedComplaint._id.substring(0, 8)}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Remark</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Add internal notes or feedback..."
                                    value={adminRemark}
                                    onChange={(e) => setAdminRemark(e.target.value)}
                                ></textarea>
                            </div>

                            <Button onClick={handleUpdateStatus} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white">
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
