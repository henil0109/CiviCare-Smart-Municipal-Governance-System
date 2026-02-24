import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, MapPin, Calendar, AlertTriangle, CheckCircle, Clock, Zap, Users, FileText, Send, Truck, Clock3, Shield, Search, Hammer, Trophy, Filter, CheckSquare, TrendingUp, Activity
} from 'lucide-react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

const ComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);

    // Team Builder State
    const [staffMembers, setStaffMembers] = useState([]);
    const [supervisors, setSupervisors] = useState([]);
    const [builderMode, setBuilderMode] = useState(false);
    const [selectedSupervisor, setSelectedSupervisor] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [filterDomain, setFilterDomain] = useState('All');
    const [filterWard, setFilterWard] = useState('');
    const [aiRec, setAiRec] = useState(null); // AI recommendation for team

    const toggleMember = (id) => {
        if (selectedMembers.includes(id)) {
            setSelectedMembers(selectedMembers.filter(m => m !== id));
        } else {
            setSelectedMembers([...selectedMembers, id]);
        }
    };

    // --- Admin/Staff Mock Logic for brevity in resizing ---
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isRealAdmin = user.role === 'admin';
    const canSubmitProof = ['supervisor', 'staff', 'field_officer'].includes(user.role);

    useEffect(() => {
        const fetchComplaint = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`/api/complaints/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setComplaint(res.data);

                // Fetch Staff Data if Admin or Supervisor (both use Smart Team Builder)
                // The 'user' variable here refers to the one defined outside the useEffect,
                // which is correct for checking roles.
                if (user.role === 'admin' || user.role === 'supervisor') {
                    const usersRes = await axios.get('/api/admin/users?limit=1000', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const allUsers = usersRes.data;
                    const staffList = allUsers.filter(u => ['staff', 'field_officer'].includes(u.role));
                    const supList = allUsers.filter(u => ['supervisor', 'admin'].includes(u.role));
                    setStaffMembers(staffList);
                    setSupervisors(supList);

                    // Compute AI recommendation using keyword-based matching
                    // This handles rich specialization names like "Roads & Infrastructure" matching "Roads" category
                    const cat = (res.data.category || '').toLowerCase();
                    const keywordMatch = (spec) => {
                        const s = (spec || '').toLowerCase();
                        return s.includes(cat) || cat.split(' ').some(word => word.length > 3 && s.includes(word));
                    };
                    const recSup = supList.find(s => keywordMatch(s.specialization)) || supList[0];
                    const recMembers = staffList
                        .filter(m => keywordMatch(m.specialization))
                        .slice(0, 3);
                    if (recSup || recMembers.length > 0) {
                        setAiRec({ supervisor: recSup, members: recMembers });
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchComplaint();
    }, [id]);

    // Helper for Image URLs
    // Helper for Image URLs
    const getImgUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return path; // Rely on proxy for /static
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!complaint) return <div className="min-h-screen flex items-center justify-center text-red-500">Complaint Not Found</div>;

    // --- Timeline Logic ---
    const isRejected = complaint.status === 'Rejected';

    const steps = [
        { id: 'Pending', label: 'Submitted', icon: FileText, date: complaint.created_at },
        {
            id: isRejected ? 'Rejected' : 'Pending Verification',
            label: isRejected ? 'Rejected' : 'Scrutiny',
            icon: isRejected ? AlertTriangle : Search,
            date: null
        },
        { id: 'In Progress', label: 'In Progress', icon: Hammer, date: null },
        { id: 'Resolved', label: 'Resolved', icon: Trophy, date: null }
    ];

    // Determine current step index
    let currentStep = 0;
    if (complaint.status === 'Pending Verification') currentStep = 1;
    else if (complaint.status === 'In Progress') currentStep = 2;
    else if (complaint.status === 'Resolved') currentStep = 3;
    else if (complaint.status === 'Rejected') currentStep = 1;

    const isResolved = complaint.status === 'Resolved';

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header — self-contained dark hero so text is visible regardless of admin/user layout bg */}
            <div className="mb-8 rounded-3xl overflow-hidden relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                {/* subtle noise layer */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />

                <div className="relative z-10 p-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 font-medium transition-colors">
                        <ArrowLeft size={18} /> Back to Dashboard
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-white/10 text-slate-200 border border-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                                    ID: {complaint._id.slice(-6)}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${complaint.priority === 'High'
                                    ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                                    : complaint.priority === 'Medium'
                                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                        : 'bg-green-500/30 text-green-300 border border-green-500/40'
                                    }`}>
                                    {complaint.priority} Priority
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${complaint.status === 'Resolved' ? 'bg-green-500/30 text-green-300 border border-green-500/40'
                                    : complaint.status === 'Rejected' ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                                        : complaint.status === 'In Progress' ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40'
                                            : 'bg-slate-500/30 text-slate-300 border border-slate-500/40'
                                    }`}>
                                    {complaint.status}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">{complaint.title}</h1>
                            <p className="text-slate-300 text-base flex items-center gap-2">
                                <MapPin size={16} className="text-blue-400 shrink-0" />
                                {complaint.location_address}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* TRACKER / TIMELINE */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-200 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${isRejected ? 'from-red-500 via-orange-500 to-red-500' : 'from-blue-500 via-purple-500 to-pink-500'}`} />

                <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                    <Clock size={24} className={`text-${isRejected ? 'red' : 'blue'}-600`} /> Live Tracker
                </h2>

                <div className="relative">
                    {/* Progress Bar Background */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full" />

                    {/* Active Progress Bar */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`absolute top-1/2 left-0 h-1 bg-gradient-to-r ${isRejected ? 'from-red-400 to-red-600' : 'from-blue-500 to-green-500'} -translate-y-1/2 rounded-full`}
                    />


                    <div className="relative flex justify-between">
                        {steps.map((step, index) => {
                            const isActive = index <= currentStep;
                            const isCurrent = index === currentStep;

                            return (
                                <div key={index} className="flex flex-col items-center relative z-10 group">
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            scale: isCurrent ? 1.2 : 1,
                                            backgroundColor: isActive
                                                ? (index === 1 && isRejected ? '#EF4444' : index === 3 ? '#10B981' : '#3B82F6')
                                                : '#F3F4F6',
                                            color: isActive ? '#fff' : '#9CA3AF'
                                        }}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-colors duration-300`}
                                    >
                                        <step.icon size={20} />
                                    </motion.div>
                                    <div className="mt-4 text-center">
                                        <p className={`text-sm font-bold ${isActive ? (index === 1 && isRejected ? 'text-red-600' : 'text-gray-900') : 'text-gray-600'}`}>{step.label}</p>
                                        {isActive && index === 0 && (
                                            <p className="text-xs text-gray-600 mt-1">{complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : ''}</p>
                                        )}
                                        {/* Show resolved date if resolved */}
                                        {isActive && index === 3 && isResolved && complaint.resolution_report && (
                                            <p className="text-xs text-green-600 font-bold mt-1">
                                                {complaint.resolution_report.resolved_at ? new Date(complaint.resolution_report.resolved_at).toLocaleDateString() : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status Message */}
                <div className="mt-10 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                    <div className="bg-blue-50 p-2 rounded-full text-blue-600 shrink-0">
                        <Zap size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-blue-900">Current Status: {complaint.status}</p>
                        <p className="text-sm text-blue-700 mt-1">
                            {complaint.status === 'Pending' && "Your complaint has been logged and is awaiting scrutiny by the admin."}
                            {complaint.status === 'Pending Verification' && "Evidence submitted. Admin is verifying the resolution."}
                            {complaint.status === 'In Progress' && "A team is actively working on your issue."}
                            {complaint.status === 'Resolved' && "Success! Your complaint has been officially resolved."}
                            {complaint.status === 'Rejected' && "This complaint was rejected. Please contact support for info."}
                        </p>
                    </div>
                </div>
            </div>

            {/* RESOLUTION CERTIFICATE (Only when Resolved) */}
            {isResolved && complaint.resolution_report && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-white rounded-3xl shadow-2xl border-4 border-green-500/20 p-8 md:p-12 mb-8 overflow-hidden"
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-300 via-transparent to-transparent" />
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                        <CheckCircle size={200} className="text-green-600" />
                    </div>

                    <div className="relative z-10 text-center mb-10">
                        <div className="inline-block bg-green-100 text-green-800 px-6 py-2 rounded-full font-bold text-sm tracking-widest mb-4 border border-green-200">
                            OFFICIAL RESOLUTION REPORT
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 font-serif">
                            Problem Solved
                        </h2>
                        <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                            The issue has been successfully resolved and verified by the Municipal Corporation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200">
                            <p className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-2">Complainant</p>
                            <p className="text-lg font-bold text-gray-900 line-clamp-1">
                                {complaint.resolution_report.citizen_snapshot?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-blue-600">{complaint.resolution_report.citizen_snapshot?.phone || ''}</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200">
                            <p className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-2">Resolved By</p>
                            <p className="text-lg font-bold text-gray-900 line-clamp-1">{complaint.resolution_report.resolved_by}</p>
                            <p className="text-xs text-gray-600">Authority</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200">
                            <p className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-2">Time Taken</p>
                            <p className="text-3xl font-extrabold text-gray-900">{complaint.resolution_report.metrics?.days_taken || '2'} Days</p>
                            <p className="text-xs text-gray-600">{complaint.resolution_report.metrics?.status_note || ''}</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200">
                            <p className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-2">Est. Cost</p>
                            <p className="text-xl font-bold text-gray-700">
                                {complaint.resolution_report.cost_snapshot || 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-green-50 rounded-2xl p-8 border border-green-100 relative mb-6">
                        <h3 className="text-green-900 font-bold mb-3 flex items-center gap-2">
                            <FileText size={20} /> Work Log & Final Remarks
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-green-700 uppercase mb-1">Supervisor's Report</p>
                                <p className="text-green-800 text-sm italic">
                                    "{complaint.resolution_report.proof_summary?.remarks || 'Work completed as per standard operating procedure.'}"
                                </p>
                            </div>
                            <div className="border-t border-green-200 pt-3">
                                <p className="text-xs font-bold text-green-700 uppercase mb-1">Admin's Closing Note</p>
                                <p className="text-green-900 font-medium">
                                    "{complaint.resolution_report.final_remarks}"
                                </p>
                            </div>
                        </div>

                        {/* Stamp */}
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 border-4 border-green-600 rounded-full flex items-center justify-center opacity-20 -rotate-12 pointer-events-none">
                            <span className="text-green-600 font-black text-xl uppercase">Verified</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Original Details (Collapsed/Secondary) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Issue Details</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{complaint.description}</p>

                    {complaint.photo_url && (
                        <div className="mt-6 rounded-xl overflow-hidden shadow-md group relative">
                            <img
                                src={getImgUrl(complaint.photo_url)}
                                alt="Problem"
                                className="w-full h-auto object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <a href={getImgUrl(complaint.photo_url)} target="_blank" rel="noreferrer" className="absolute bottom-2 right-2 bg-black/50 text-gray-900 px-3 py-1 rounded-full text-xs backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                                View Full Size
                            </a>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Proof Card */}
                    {complaint.resolution_proof && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Work Evidence</h3>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <p className="text-sm font-semibold text-gray-700 mb-1">submitted by {complaint.resolution_proof.submitted_by}</p>
                                <p className="text-gray-700 italic text-sm mb-3">"{complaint.resolution_proof.remarks}"</p>
                                {complaint.resolution_proof.image_url && (
                                    <div className="rounded-lg overflow-hidden bg-gray-200 h-48 flex items-center justify-center">
                                        {/* Using a placeholder for demo if real image fails */}
                                        <img
                                            src={complaint.resolution_proof.image_url}
                                            alt="Proof of work"
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                        <span className="text-xs text-gray-500 absolute">Image Preview</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* ADMIN VERIFICATION PANEL (For Admin when Pending Verification) */}
            {isRealAdmin && complaint.status === 'Pending Verification' && complaint.resolution_proof && (
                <div className="bg-yellow-50 rounded-2xl shadow-sm border border-yellow-200 p-6 mt-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Shield size={100} className="text-yellow-600" />
                    </div>

                    <h3 className="font-bold text-yellow-900 mb-4 flex items-center gap-2 relative z-10">
                        <CheckSquare size={24} /> Resolution Verification Needed
                    </h3>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-100 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* LEFT: Original Context */}
                        <div className="border-r border-yellow-200 pr-6">
                            <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Original Complaint</h4>
                            <p className="text-gray-900 font-bold text-sm mb-1">{complaint.title}</p>
                            <p className="text-gray-700 text-sm mb-4 line-clamp-4 hover:line-clamp-none transition-all">{complaint.description}</p>

                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div>
                                    <span className="font-bold block text-gray-700">Reported By</span>
                                    <span>{complaint.citizen_details?.username || 'Unknown'}</span>
                                </div>
                                <div>
                                    <span className="font-bold block text-gray-700">Contact</span>
                                    <span>{complaint.citizen_details?.phone || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Resolution Proof */}
                        <div>
                            <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Supervisor Resolution</h4>
                            <div className="flex items-start gap-4">
                                {complaint.resolution_proof.image_url && (
                                    <a href={complaint.resolution_proof.image_url} target="_blank" rel="noopener noreferrer" className="shrink-0 block w-24 h-24 bg-slate-800 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity shadow-sm">
                                        {complaint.resolution_proof.type === 'video' ? (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-900">
                                                <span className="text-2xl">▶</span>
                                            </div>
                                        ) : (
                                            <img src={complaint.resolution_proof.image_url} alt="Proof" className="w-full h-full object-cover" />
                                        )}
                                    </a>
                                )}
                                <div>
                                    <p className="text-gray-900 font-medium italic mb-2">"{complaint.resolution_proof.remarks}"</p>
                                    <div className="text-xs bg-slate-800 p-2 rounded-lg border border-gray-200 inline-block">
                                        <p>
                                            <span className="font-bold text-gray-700">Executed By:</span> <br />
                                            <span className="text-gray-900 font-mono text-sm">{complaint.supervisor_details?.username || complaint.resolution_proof.submitted_by}</span>
                                        </p>
                                        <p className="mt-1 text-gray-600">{complaint.resolution_proof.submitted_at ? new Date(complaint.resolution_proof.submitted_at).toLocaleString() : 'Just now'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 relative z-10">
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-gray-900 shadow-lg shadow-green-500/20 py-3"
                            onClick={async () => {
                                try {
                                    const token = localStorage.getItem('token');
                                    await axios.put(`/api/complaints/${id}`, {
                                        status: 'Resolved' // Triggers AI Report
                                    }, {
                                        headers: { Authorization: `Bearer ${token}` }
                                    });
                                    window.location.reload();
                                } catch (e) { alert("Verification Failed"); }
                            }}
                        >
                            Verify & Approve Resolution
                        </Button>

                        <Button
                            className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-200"
                            onClick={async () => {
                                // Reject logic
                                const reason = prompt("Enter rejection reason:");
                                if (!reason) return;
                                try {
                                    const token = localStorage.getItem('token');
                                    await axios.put(`/api/complaints/${id}`, {
                                        status: 'In Progress',
                                        remarks: `Verification Rejected: ${reason}`
                                    }, {
                                        headers: { Authorization: `Bearer ${token}` }
                                    });
                                    window.location.reload();
                                } catch (e) { alert("Action Failed"); }
                            }}
                        >
                            Reject
                        </Button>
                    </div>
                </div>
            )}

            {/* FIELD RESOLUTION PANEL (For Supervisors Only) */}
            {user.role === 'supervisor' && complaint.status === 'In Progress' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-8">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="text-green-600" size={20} /> Supervisor Resolution Report
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                            <AlertTriangle className="text-blue-600 shrink-0" size={20} />
                            <p className="text-sm text-blue-800">
                                Please ensure you upload clear visual evidence of the completed work.
                                Once submitted, the status will change to <strong>"Pending Verification"</strong> for Admin review.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Evidence Type</label>
                                <select
                                    id="proof-type"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                                >
                                    <option value="image">📸 Photo Evidence (Before/After)</option>
                                    <option value="video">🎥 Video Walkthrough</option>
                                    <option value="document">📄 Official Report (PDF)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Evidence File</label>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        id="proof-file"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            const formData = new FormData();
                                            formData.append('file', file);

                                            try {
                                                const btn = document.getElementById('upload-btn-text');
                                                if (btn) btn.innerText = "Uploading...";

                                                const res = await axios.post('/api/upload', formData);

                                                document.getElementById('proof-url').value = res.data.url;
                                                if (btn) btn.innerText = "Upload Complete ✅";
                                                alert("File Uploaded Successfully!");
                                            } catch (err) {
                                                console.error(err);
                                                const btn = document.getElementById('upload-btn-text');
                                                if (btn) btn.innerText = "Upload Failed ❌";
                                                alert("Upload Failed");
                                            }
                                        }}
                                    />
                                </div>
                                <input type="hidden" id="proof-url" />
                                <p id="upload-btn-text" className="text-xs text-gray-500 mt-1 pl-1">Select a file to auto-upload.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Final Remarks</label>
                            <textarea
                                id="proof-remarks"
                                placeholder="Describe the resolution technicalities and impact..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                rows="3"
                            />
                        </div>

                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-gray-900 font-bold py-3 shadow-lg shadow-green-500/20"
                            onClick={async () => {
                                const proofType = document.getElementById('proof-type').value;
                                const proofUrl = document.getElementById('proof-url').value;
                                const remarks = document.getElementById('proof-remarks').value;

                                if (!proofUrl || !remarks) return alert("Please provide both proof and remarks.");

                                try {
                                    const token = localStorage.getItem('token');
                                    await axios.put(`/api/complaints/${id}`, {
                                        status: 'Pending Verification',
                                        resolution_proof: {
                                            type: proofType,
                                            image_url: proofUrl,
                                            remarks: remarks,
                                            submitted_by: user.username,
                                            submitted_at: new Date()
                                        }
                                    }, {
                                        headers: { Authorization: `Bearer ${token}` }
                                    });
                                    window.location.reload();
                                } catch (err) { alert("Submission Failed"); }
                            }}
                        >
                            Mark as Complete & Submit
                        </Button>
                    </div>
                </div>
            )}

            {/* ADMIN CONTROL CENTER */}
            {isRealAdmin && (
                <div className="space-y-6 mt-8">

                    {/* 1. AI Analysis Panel */}
                    <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <div className="flex justify-between items-start mb-6 z-10 relative">
                            <div>
                                <h3 className="text-2xl font-bold flex items-center gap-2">
                                    <Zap className="text-yellow-400" fill="currentColor" /> AI Impact Analysis
                                </h3>
                                <p className="text-blue-200 text-sm mt-1">Automated urgency and resource assessment</p>
                            </div>

                            {!complaint.ai_analysis ? (
                                <button
                                    onClick={async () => {
                                        try {
                                            const token = localStorage.getItem('token');
                                            await axios.post(`/api/complaints/${id}/ai-predict`, {}, {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            window.location.reload();
                                        } catch (e) { alert('AI Analysis Failed'); }
                                    }}
                                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-md transition-all border border-white/10"
                                >
                                    Run Diagnosis
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-mono border border-green-500/30">
                                        Analysis Complete
                                    </span>
                                    <button
                                        onClick={async () => {
                                            if (!confirm("Regenerate Analysis? This simply refreshes the insights.")) return;
                                            try {
                                                const token = localStorage.getItem('token');
                                                await axios.post(`/api/complaints/${id}/ai-predict`, {}, {
                                                    headers: { Authorization: `Bearer ${token}` }
                                                });
                                                window.location.reload();
                                            } catch (e) { alert('AI Analysis Failed'); }
                                        }}
                                        className="text-white/50 hover:text-white text-xs underline"
                                    >
                                        Regenerate
                                    </button>
                                </div>
                            )}
                        </div>

                        {complaint.ai_analysis && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                                {/* Deadline & Confidence */}
                                <div className="bg-white/10 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                                    <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Clock size={12} /> Target Completion
                                    </p>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {complaint.deadline ? new Date(complaint.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                                        </p>
                                        <p className="text-xs text-blue-200">({complaint.ai_analysis.predicted_days || '?'} Days)</p>
                                    </div>
                                    <div className="mt-3 w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                                        <div className="h-full bg-green-400" style={{ width: `${complaint.ai_analysis.confidence || 0}%` }}></div>
                                    </div>
                                    <p className="text-[10px] text-right mt-1 text-blue-300/80">{complaint.ai_analysis.confidence || 0}% Conf.</p>
                                </div>

                                {/* Risk Assessment */}
                                <div className="bg-white/10 rounded-2xl p-4 border border-white/5 backdrop-blur-sm relative overflow-hidden group">
                                    <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <AlertTriangle size={12} /> Domain & Risk
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xl font-bold ${(complaint.ai_analysis.risk?.level || 'Low') === 'Critical' ? 'text-red-400' : 'text-green-400'}`}>
                                            {complaint.ai_analysis.risk?.level || 'Low'} Risk
                                        </span>
                                    </div>
                                    {complaint.ai_analysis.predicted_category && (
                                        <div className="mt-2 pt-2 border-t border-white/10">
                                            <p className="text-[10px] text-blue-200">AI Suggested Domain:</p>
                                            <p className="text-sm font-bold text-yellow-300">{complaint.ai_analysis.predicted_category}</p>
                                        </div>
                                    )}
                                    <div className="mt-2 space-y-1">
                                        {complaint.ai_analysis.risk?.factors && complaint.ai_analysis.risk.factors.length > 0 ? (
                                            complaint.ai_analysis.risk.factors.map((factor, i) => (
                                                <p key={i} className="text-[10px] text-white/70 flex items-center gap-1">
                                                    <span className="w-1 h-1 rounded-full bg-red-400"></span> {factor}
                                                </p>
                                            ))
                                        ) : (
                                            <p className="text-[10px] text-white/50">No major risks detected.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Resources & Cost */}
                                <div className="bg-white/10 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                                    <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Hammer size={12} /> Est. Cost & Team
                                    </p>
                                    <div className="mb-2">
                                        <p className="text-xl font-bold">
                                            ₹{(complaint.ai_analysis.cost?.min || 0).toLocaleString()} - {(complaint.ai_analysis.cost?.max || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        <span className="bg-yellow-500/20 text-yellow-200 px-1.5 py-0.5 rounded text-[10px] border border-yellow-500/20">
                                            {complaint.ai_analysis.resources?.min_team_size || 1} Staff
                                        </span>
                                        {complaint.ai_analysis.resources?.equipment && complaint.ai_analysis.resources.equipment.length > 0 && complaint.ai_analysis.resources.equipment.slice(0, 2).map(eq => (
                                            <span key={eq} className="bg-blue-500/20 text-blue-100 px-1.5 py-0.5 rounded text-[10px] border border-blue-500/20">
                                                {eq}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* steps Summary (Compact) */}
                                <div className="bg-white/10 rounded-2xl p-4 border border-white/5 backdrop-blur-sm overflow-y-auto max-h-32 scrollbar-hide">
                                    <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-2">Protocol</p>
                                    <div className="space-y-2">
                                        {complaint.ai_analysis.steps && complaint.ai_analysis.steps.length > 0 ? complaint.ai_analysis.steps.map((step, i) => (
                                            <div key={i} className="flex gap-2 text-xs text-blue-50 leading-tight">
                                                <span className="text-blue-400 font-mono">{i + 1}.</span>
                                                <span>{step}</span>
                                            </div>
                                        )) : <p className="text-xs text-white/50">No steps generated.</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* NEW: Extended Impact Analysis Row */}
                        {complaint.ai_analysis && complaint.ai_analysis.impact_metrics && (
                            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/20 rounded-xl">
                                        <Users size={20} className="text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Affected Population</p>
                                        <p className="text-lg font-bold">~{complaint.ai_analysis.impact_metrics.affected_population?.toLocaleString()} <span className="text-xs font-normal text-blue-200">Citizens</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-500/20 rounded-xl">
                                        <TrendingUp size={20} className="text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-green-300 font-bold uppercase tracking-wider">Economic Priority</p>
                                        <div className="flex gap-1 mt-1">
                                            {[...Array(10)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1.5 w-3 rounded-full ${i < (complaint.ai_analysis.impact_metrics.economic_priority || 0) ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-white/10'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/20 rounded-xl">
                                        <Activity size={20} className="text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Env. Impact Severity</p>
                                        <div className="flex gap-1 mt-1">
                                            {[...Array(10)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1.5 w-3 rounded-full ${i < (complaint.ai_analysis.impact_metrics.environmental_impact || 0) ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]' : 'bg-white/10'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. Assignment & Status Panel */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-blue-600" /> Operational Controls
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Team Assignment */}
                            <div className="md:col-span-2 border-b border-gray-100 pb-8 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-lg font-bold text-gray-900">
                                        Resolution Task Force
                                    </label>
                                    <button
                                        onClick={() => setBuilderMode(!builderMode)}
                                        className="text-blue-600 text-sm font-semibold hover:underline"
                                    >
                                        {builderMode ? "Switch to Quick Assign" : "Open Smart Team Builder"}
                                    </button>
                                </div>

                                {!builderMode && (complaint.assigned_supervisor || complaint.assigned_team) ? (
                                    /* ASSIGNED STATE */
                                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-bold text-blue-600 uppercase mb-1">Active Deployment</p>
                                            <p className="text-lg font-bold text-blue-900">
                                                {complaint.assigned_team_details?.username || 'Custom Task Force'}
                                            </p>
                                            <p className="text-sm text-blue-700">
                                                Supervisor: {complaint.supervisor_details ? complaint.supervisor_details.username : (complaint.assigned_supervisor ? 'Assigned (ID Hidden)' : 'Pending')}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => setBuilderMode(true)}
                                            className="bg-blue-600 text-gray-900 border border-transparent hover:bg-blue-700 shadow-md"
                                        >
                                            Re-Assign / Edit
                                        </Button>
                                    </div>
                                ) : !builderMode ? (
                                    /* Quick Assign (Existing Logic mostly) */
                                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                        <p className="text-sm text-gray-600 mb-2">Select an existing operational unit:</p>
                                        <div className="flex gap-2">
                                            <select
                                                id="team-assign-select"
                                                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none"
                                            >
                                                <option value="">Select Response Team</option>
                                                <option value="team_alpha">Alpha Squad (Roads)</option>
                                                <option value="team_beta">Beta Unit (Water)</option>
                                            </select>
                                            <Button onClick={() => alert("Quick assign logic placeholder")} className="bg-gray-900 text-gray-900">Assign</Button>
                                        </div>
                                    </div>
                                ) : (
                                    /* SMART TEAM BUILDER */
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">

                                        {/* AI Recommendation Card */}
                                        {aiRec && (
                                            <div className="mb-5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="bg-indigo-100 p-1.5 rounded-lg">
                                                        <Zap size={16} className="text-indigo-600" />
                                                    </div>
                                                    <p className="text-sm font-bold text-indigo-800">AI Recommendation</p>
                                                    <span className="ml-auto text-[10px] font-semibold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-200">Based on {complaint.category}</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {/* Recommended Supervisor */}
                                                    {aiRec.supervisor && (
                                                        <div className="bg-white rounded-xl border border-indigo-100 p-3">
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1.5">Recommended Supervisor</p>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-900">{aiRec.supervisor.username}</p>
                                                                    <p className="text-[10px] text-indigo-600">{aiRec.supervisor.specialization || 'General'}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => setSelectedSupervisor(aiRec.supervisor._id)}
                                                                    className="shrink-0 text-[11px] font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-lg hover:bg-indigo-700 transition"
                                                                >
                                                                    Apply
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Recommended Field Officers */}
                                                    {aiRec.members.length > 0 && (
                                                        <div className="bg-white rounded-xl border border-indigo-100 p-3">
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1.5">Recommended Field Officers ({aiRec.members.length})</p>
                                                            <div className="space-y-1 mb-2">
                                                                {aiRec.members.map(m => (
                                                                    <div key={m._id} className="flex items-center gap-1.5">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                                        <span className="text-xs text-gray-800 font-medium">{m.username}</span>
                                                                        <span className="text-[10px] text-gray-400">({m.specialization})</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <button
                                                                onClick={() => setSelectedMembers(prev => {
                                                                    const newIds = aiRec.members.map(m => m._id);
                                                                    return [...new Set([...prev, ...newIds])];
                                                                })}
                                                                className="text-[11px] font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-lg hover:bg-indigo-700 transition"
                                                            >
                                                                Apply All
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                                                <Filter size={16} className="text-gray-400" />
                                                <select
                                                    className="outline-none text-sm bg-transparent font-medium text-gray-700"
                                                    value={filterDomain}
                                                    onChange={(e) => setFilterDomain(e.target.value)}
                                                >
                                                    <option value="All">All Domains</option>
                                                    {/* Dynamically built from actual officer specializations */}
                                                    {[...new Set(staffMembers.map(m => m.specialization).filter(Boolean))].sort().map(spec => (
                                                        <option key={spec} value={spec}>{spec}</option>
                                                    ))}
                                                </select>
                                            </div>

                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Available Staff */}
                                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-64 flex flex-col">
                                                <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 font-bold text-xs text-gray-500 uppercase">
                                                    Available Field Officers
                                                </div>
                                                <div className="overflow-y-auto p-2 space-y-1">
                                                    {staffMembers
                                                        .filter(m => filterDomain === 'All' || m.specialization === filterDomain)
                                                        .map(member => {
                                                            // keyword-based expert highlight
                                                            const specLower = (member.specialization || '').toLowerCase();
                                                            const catLower = (complaint.category || '').toLowerCase();
                                                            const isExpert = specLower.includes(catLower) || catLower.split(' ').some(w => w.length > 3 && specLower.includes(w));
                                                            return (
                                                                <div
                                                                    key={member._id}
                                                                    onClick={() => toggleMember(member._id)}
                                                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${selectedMembers.includes(member._id)
                                                                        ? 'bg-blue-50 border-blue-500 shadow-sm'
                                                                        : isExpert
                                                                            ? 'bg-green-50 border-green-200 hover:bg-green-100' // Highlight expert
                                                                            : 'hover:bg-gray-50 border-transparent'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-2 h-2 rounded-full ${isExpert ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                                                {member.username}
                                                                                {isExpert && (
                                                                                    <span className="text-[10px] font-bold bg-green-200 text-green-800 px-1.5 py-0.5 rounded border border-green-300">
                                                                                        EXPERT
                                                                                    </span>
                                                                                )}
                                                                            </p>
                                                                            <p className="text-[10px] text-gray-500">{member.specialization}</p>
                                                                        </div>
                                                                    </div>
                                                                    {selectedMembers.includes(member._id) && <CheckCircle size={16} className="text-blue-600" />}
                                                                </div>
                                                            );
                                                        })}
                                                    {staffMembers.length === 0 && <p className="text-xs text-center text-gray-400 mt-4">No staff found.</p>}
                                                </div>
                                            </div>

                                            {/* Configuration */}
                                            <div className="flex flex-col gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Supervisor</label>
                                                    <select
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500"
                                                        value={selectedSupervisor}
                                                        onChange={(e) => setSelectedSupervisor(e.target.value)}
                                                    >
                                                        <option value="">Select Supervisor...</option>
                                                        {supervisors.sort((a, b) => {
                                                            const aMatch = a.specialization === complaint.category;
                                                            const bMatch = b.specialization === complaint.category;
                                                            return bMatch - aMatch; // Sort true (1) before false (0)
                                                        }).map(s => (
                                                            <option key={s._id} value={s._id} className={s.specialization === complaint.category ? 'font-bold text-green-700' : ''}>
                                                                {s.username} {s.specialization === complaint.category ? '⭐ (Recommended)' : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4">
                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Team Summary</p>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm text-gray-600">Selected Members:</span>
                                                        <span className="font-bold text-gray-900">{selectedMembers.length} / {complaint.ai_analysis?.resources?.min_team_size || 2} Rec.</span>
                                                    </div>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-sm text-gray-600">Supervisor:</span>
                                                        <span className={`font-bold ${selectedSupervisor ? 'text-green-600' : 'text-red-500'}`}>
                                                            {selectedSupervisor ? "Assigned" : "Missing"}
                                                        </span>
                                                    </div>

                                                    <Button
                                                        onClick={async () => {
                                                            if (!selectedSupervisor || selectedMembers.length === 0) {
                                                                alert("Please select a supervisor and at least one member.");
                                                                return;
                                                            }
                                                            try {
                                                                const token = localStorage.getItem('token');
                                                                await axios.post(`/api/complaints/${id}/assign-custom`, {
                                                                    supervisor_id: selectedSupervisor,
                                                                    member_ids: selectedMembers
                                                                }, {
                                                                    headers: { Authorization: `Bearer ${token}` }
                                                                });
                                                                window.location.reload();
                                                            } catch (err) { alert("Assignment Failed"); }
                                                        }}
                                                        className="w-full bg-green-600 hover:bg-green-700 text-gray-900 shadow-lg shadow-green-500/30"
                                                    >
                                                        Deploy Task Force
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status Manual Override */}
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-900">Manual Status Override</label>
                                <div className="flex gap-2">
                                    <select
                                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        defaultValue={complaint.status}
                                        id="admin-status-select"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Verification Pending">Verification Pending</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                    <button
                                        onClick={async () => {
                                            const newStatus = document.getElementById('admin-status-select').value;
                                            const remarks = document.querySelector('#admin-remarks-input')?.value || "Manual Update";
                                            try {
                                                const token = localStorage.getItem('token');
                                                await axios.put(`/api/complaints/${id}`, {
                                                    status: newStatus,
                                                    remarks: remarks
                                                }, {
                                                    headers: { Authorization: `Bearer ${token}` }
                                                });
                                                window.location.reload();
                                            } catch (err) {
                                                alert('Update Failed');
                                            }
                                        }}
                                        className="bg-blue-600 text-white px-4 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Admin Remarks */}
                        <div className="mt-6">
                            <label className="block text-sm font-bold text-gray-900 mb-2">Internal Remarks</label>
                            <textarea
                                id="admin-remarks-input"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                rows="2"
                                placeholder="Add notes for the team or record changes..."
                            />
                        </div>
                    </div>

                    {/* 3. DANGER ZONE: Rejection Panel */}
                    {!isResolved && complaint.status !== 'Rejected' && (
                        <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 p-6 flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-100 p-3 rounded-full text-red-600">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-900 text-lg">Reject Complaint</h3>
                                    <p className="text-sm text-red-700">
                                        Mark this complaint as invalid or duplicate. This will permanently close the issue.
                                    </p>
                                </div>
                            </div>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 px-6 py-3 whitespace-nowrap"
                                onClick={async () => {
                                    const reason = prompt("Please enter the reason for rejection (e.g., Duplicate, Invalid, Out of Jurisdiction):");
                                    if (!reason) return;

                                    if (!confirm("Are you sure you want to REJECT this complaint? This cannot be easily undone.")) return;

                                    try {
                                        const token = localStorage.getItem('token');
                                        await axios.put(`/api/complaints/${id}`, {
                                            status: 'Rejected',
                                            remarks: reason
                                        }, {
                                            headers: { Authorization: `Bearer ${token}` }
                                        });
                                        window.location.reload();
                                    } catch (e) { alert("Rejection Failed"); }
                                }}
                            >
                                Reject Complaint
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ComplaintDetail;
