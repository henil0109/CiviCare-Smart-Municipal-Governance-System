import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Search, Filter, Printer, Eye } from 'lucide-react';
import Button from '../components/ui/Button';

const Reports = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Determine base path based on which panel is rendering this component
    const basePath = location.pathname.startsWith('/supervisor') ? '/supervisor' : '/admin';
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchResolvedComplaints();
    }, []);

    const fetchResolvedComplaints = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/complaints', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter strictly for Resolved only
            const resolved = res.data.filter(c => c.status === 'Resolved');
            setReports(resolved);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Archive...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Official Reports Archive</h1>
                    <p className="text-gray-500">Repository of closed and resolved incidents.</p>
                </div>
                <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                    <FileText size={20} />
                    {reports.length} Records Filed
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex gap-4">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ID or Title..."
                        className="bg-transparent outline-none w-full text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Could add date filters here later */}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="p-4 pl-6 text-sm font-semibold text-gray-600">Case ID</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Incident</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Resolved Date</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Resolved By</th>
                            <th className="p-4 text-sm font-semibold text-gray-600 text-right pr-6">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredReports.length > 0 ? filteredReports.map((r) => (
                            <tr key={r._id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="p-4 pl-6 font-mono text-xs text-gray-500">
                                    {r._id.toUpperCase().substring(0, 10)}...
                                </td>
                                <td className="p-4">
                                    <p className="font-semibold text-gray-900 truncate max-w-[250px]">{r.title}</p>
                                    <p className="text-xs text-gray-500">{r.category}</p>
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                    {r.resolution_report?.generated_at ? new Date(r.resolution_report.generated_at).toLocaleDateString() : '-'}
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                    {r.resolution_report?.resolved_by || 'Unknown'}
                                </td>
                                <td className="p-4 text-right pr-6">
                                    <Button
                                        onClick={() => navigate(`${basePath}/reports/${r._id}`)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md text-xs py-1.5 px-3 border border-transparent"
                                    >
                                        <Printer size={14} className="mr-2" /> Open Case File
                                    </Button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-gray-500">
                                    No resolved reports found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;
