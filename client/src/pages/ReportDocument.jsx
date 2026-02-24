import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Printer, ArrowLeft, Shield, FileText, CheckCircle, MapPin, Calendar, User } from 'lucide-react';
import Button from '../components/ui/Button';

const ReportDocument = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    // Navigate back to the correct panel's history/reports page
    const backPath = location.pathname.startsWith('/supervisor') ? '/supervisor/history' : '/admin/reports';
    const componentRef = useRef();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        const fetchComplaint = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`/api/complaints/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setComplaint(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchComplaint();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading Report Data...</div>;
    if (!complaint) return <div className="p-8 text-center text-red-500">Report unavailable.</div>;

    const resolution = complaint.resolution_report || {};

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {/* Toolbar - Hidden in Print */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden">
                <Button onClick={() => navigate(backPath)} className="bg-gray-900 text-white hover:bg-gray-800 shadow-sm border border-transparent">
                    <ArrowLeft size={16} className="mr-2" /> Back to Archives
                </Button>
                <Button onClick={handlePrint} className="bg-blue-900 text-white hover:bg-blue-800 shadow-lg">
                    <Printer size={16} className="mr-2" /> Print Official Record
                </Button>
            </div>

            {/* A4 Paper Container */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:w-[210mm] min-h-[297mm] relative overflow-hidden">

                {/* Printable Content */}
                <div ref={componentRef} className="p-12 h-full relative">
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
                        <Shield size={600} />
                    </div>

                    {/* Header */}
                    <header className="border-b-4 border-black pb-2 mb-8 flex justify-between items-end relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Shield size={40} className="text-black" />
                                <div>
                                    <h1 className="text-2xl font-black uppercase tracking-widest text-black">CivicCare Municipal</h1>
                                    <p className="text-xs font-bold tracking-widest uppercase text-gray-500">Official Incident Report</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-mono">CASE ID</p>
                            <p className="text-xl font-mono font-bold">{complaint._id}</p>
                        </div>
                    </header>

                    {/* Status Stamp */}
                    <div className="absolute top-12 right-12 border-4 border-green-700 text-green-700 opacity-20 transform rotate-12 p-2 rounded-lg pointer-events-none">
                        <span className="text-4xl font-black uppercase tracking-widest">RESOLVED</span>
                    </div>

                    {/* Section 1: Case Meta */}
                    <div className="bg-gray-50 border border-gray-200 p-4 mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm relative z-10">
                        <div>
                            <p className="font-bold text-gray-500 text-xs">DATE FILED</p>
                            <p className="font-mono">{new Date(complaint.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-500 text-xs">CATEGORY</p>
                            <p className="uppercase">{complaint.category}</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-500 text-xs">PRIORITY</p>
                            <p className="uppercase">{complaint.priority}</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-500 text-xs">LOCATION</p>
                            <p className="truncate">{complaint.location_address || 'Geotagged'}</p>
                        </div>
                    </div>

                    {/* Section 2: Details */}
                    <section className="mb-8 relative z-10">
                        <h3 className="text-sm font-black uppercase border-b border-gray-300 pb-1 mb-3 flex items-center gap-2">
                            <FileText size={16} /> Incident Description
                        </h3>
                        <div className="text-sm text-gray-800 leading-relaxed text-justify">
                            {complaint.description}
                        </div>
                    </section>

                    {/* Section 3: Operational Data */}
                    <section className="mb-8 relative z-10">
                        <h3 className="text-sm font-black uppercase border-b border-gray-300 pb-1 mb-3 flex items-center gap-2">
                            <User size={16} /> Investigation & Response
                        </h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 mb-2">ASSIGNED UNITS</h4>
                                <ul className="text-sm space-y-1">
                                    <li className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                                        <span>Operational Team:</span>
                                        <span className="font-mono">{complaint.assigned_team_details ? complaint.assigned_team_details.name : 'N/A'}</span>
                                    </li>
                                    <li className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                                        <span>Supervisor:</span>
                                        <span className="font-mono">{complaint.supervisor_details ? complaint.supervisor_details.username : (complaint.assigned_supervisor || 'Not Assigned')}</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 mb-2">RESOURCE UTILIZATION (EST.)</h4>
                                <ul className="text-sm space-y-1">
                                    <li className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                                        <span>Personnel Count:</span>
                                        <span className="font-mono">{complaint.ai_analysis?.resources?.min_team_size || '-'}</span>
                                    </li>
                                    <li className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                                        <span>Est. Man-hours:</span>
                                        <span className="font-mono">{complaint.ai_analysis?.resources?.est_hours || '-'}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Resolution */}
                    <section className="mb-12 relative z-10">
                        <h3 className="text-sm font-black uppercase border-b border-gray-300 pb-1 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} /> Resolution Report
                        </h3>
                        <div className="bg-gray-50 p-4 border border-gray-200">
                            <div className="mb-4">
                                <p className="text-xs font-bold text-gray-500 mb-1">FINAL REMARKS</p>
                                <p className="text-sm italic">"{resolution.final_remarks || 'No remarks recorded.'}"</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-xs">
                                <div>
                                    <p className="font-bold text-gray-500">RESOLVED BY</p>
                                    <p>{resolution.resolved_by || 'Unknown'}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-500">DATE CLOSED</p>
                                    <p>{resolution.generated_at ? new Date(resolution.generated_at).toLocaleString() : '-'}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-500">TIME TO CLOSE</p>
                                    <p>{resolution.metrics?.days_taken || '-'} Days</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Timeline */}
                    <section className="mb-8 relative z-10">
                        <h3 className="text-sm font-black uppercase border-b border-gray-300 pb-1 mb-3 flex items-center gap-2">
                            <Calendar size={16} /> Event Log
                        </h3>
                        <table className="w-full text-xs text-left">
                            <thead>
                                <tr className="border-b border-black">
                                    <th className="py-1 w-32">Timestamp</th>
                                    <th className="py-1 w-32">Status</th>
                                    <th className="py-1">Note</th>
                                    <th className="py-1 text-right">Actor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {complaint.timeline && complaint.timeline.map((t, i) => (
                                    <tr key={i}>
                                        <td className="py-1 font-mono">{new Date(t.date).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'numeric', day: 'numeric' })}</td>
                                        <td className="py-1 uppercase font-bold">{t.status}</td>
                                        <td className="py-1 text-gray-600">{t.note}</td>
                                        <td className="py-1 text-right font-mono">{t.by}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* Footer */}
                    <footer className="absolute bottom-12 left-12 right-12 border-t border-black pt-4 flex justify-between items-end">
                        <div className="text-xs text-gray-500">
                            <p>CONFIDENTIAL DOCUMENT - FOR INTERNAL USE ONLY.</p>
                            <p>Generated via CivicCare AI System | <span className="font-mono">{new Date().toISOString()}</span></p>
                        </div>
                        <div className="text-center">
                            <div className="h-12 w-32 mb-1 border-b border-gray-400"></div>
                            <p className="text-xs uppercase font-bold">Authorized Signature</p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default ReportDocument;
