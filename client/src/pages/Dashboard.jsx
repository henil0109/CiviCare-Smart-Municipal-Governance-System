import { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import { Filter, RefreshCw } from 'lucide-react';

const Dashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/complaints', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/complaints/${id}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Optimistic update
            setComplaints(complaints.map(c =>
                c._id === id ? { ...c, status: newStatus } : c
            ));
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const filteredComplaints = filter === 'All'
        ? complaints
        : complaints.filter(c => c.priority === filter || c.status === filter);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
                    <p className="text-gray-500">Overview of municipal issues</p>
                </div>
                <button
                    onClick={fetchComplaints}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary transition"
                >
                    <RefreshCw size={18} /> Refresh
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm">Total</h3>
                    <p className="text-2xl font-bold">{complaints.length}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-100">
                    <h3 className="text-red-600 text-sm">High Priority</h3>
                    <p className="text-2xl font-bold text-red-800">
                        {complaints.filter(c => c.priority === 'High').length}
                    </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-100">
                    <h3 className="text-yellow-600 text-sm">Pending</h3>
                    <p className="text-2xl font-bold text-yellow-800">
                        {complaints.filter(c => c.status === 'Pending').length}
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
                    <h3 className="text-green-600 text-sm">Resolved</h3>
                    <p className="text-2xl font-bold text-green-800">
                        {complaints.filter(c => c.status === 'Resolved').length}
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['All', 'High', 'Medium', 'Low', 'Pending', 'Resolved'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                    ${filter === f
                                ? 'bg-primary text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Complaints Grid */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading complaints...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredComplaints.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-white rounded-xl text-gray-500">
                            No complaints found.
                        </div>
                    )}

                    {filteredComplaints.map(complaint => (
                        <div key={complaint._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                            {/* High Priority Indicator Strip */}
                            {complaint.priority === 'High' && (
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <StatusBadge priority={complaint.priority} />
                                <span className="text-xs text-gray-400">
                                    {new Date(complaint.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-800 mb-2">{complaint.category}</h3>
                            <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                                {complaint.description}
                            </p>

                            <div className="flex justify-between items-center border-t pt-4">
                                <div className="text-xs text-gray-500">
                                    Status: <StatusBadge status={complaint.status} />
                                </div>

                                <div className="flex gap-2">
                                    {/* Simple Status Actions */}
                                    {complaint.status !== 'Resolved' && (
                                        <button
                                            onClick={() => handleStatusUpdate(complaint._id, 'Resolved')}
                                            className="text-xs font-bold text-green-600 hover:bg-green-50 px-2 py-1 rounded transition"
                                        >
                                            Resolve
                                        </button>
                                    )}
                                    {complaint.status === 'Pending' && (
                                        <button
                                            onClick={() => handleStatusUpdate(complaint._id, 'In Progress')}
                                            className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition"
                                        >
                                            Accept
                                        </button>
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

export default Dashboard;
