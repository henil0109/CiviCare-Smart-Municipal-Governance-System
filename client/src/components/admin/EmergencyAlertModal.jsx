import React from 'react';
import axios from 'axios';
import { AlertTriangle, XCircle, Camera, Users, Shield } from 'lucide-react';
import Button from '../ui/Button';

const EmergencyAlertModal = ({ complaint, onClose, onVerify }) => {
    if (!complaint) return null;

    const riskLevel = complaint.ai_analysis?.risk_level || (complaint.priority === 'High' ? 'Critical' : 'High');

    const [allTeams, setAllTeams] = React.useState([]);
    const [selectedTeamId, setSelectedTeamId] = React.useState('');

    React.useEffect(() => {
        if (complaint) {
            const fetchTeams = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get('/api/admin/teams', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const teams = res.data || [];
                    setAllTeams(teams);
                    // Auto-select the AI-recommended emergency team for this category
                    const recommended = teams.find(t => t.specialization === `Emergency - ${complaint.category}`);
                    if (recommended) setSelectedTeamId(recommended._id);
                    else if (teams.length > 0) setSelectedTeamId(teams[0]._id);
                } catch (e) {
                    console.error("Failed to fetch teams", e);
                }
            };
            fetchTeams();
        }
    }, [complaint]);

    const handleVerify = async () => {
        try {
            await onVerify(complaint._id, selectedTeamId);
        } catch (err) {
            console.error(err);
            alert("Failed to verify emergency");
        }
    };

    const handleReject = async () => {
        if (!confirm("Are you sure you want to dismiss this as a False Alarm? This will REJECT the complaint.")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/complaints/${complaint._id}`,
                { status: 'Rejected', remarks: 'False Alarm - Dismissed via Emergency Alert' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onClose();
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Failed to reject complaint");
        }
    };

    return (
        <div className="fixed inset-0 bg-red-900/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-red-500 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-red-600 p-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full animate-pulse">
                            <AlertTriangle size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">EMERGENCY ALERT</h2>
                            <p className="text-red-100 text-xs uppercase tracking-wider font-semibold">Immediate Action Required</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Issue Summary */}
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <h3 className="text-gray-500 text-xs uppercase font-semibold mb-1">Issue</h3>
                            <p className="text-gray-900 font-bold text-lg leading-tight">{complaint.title}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-gray-500 text-xs uppercase font-semibold mb-1">AI Risk</h3>
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold border border-red-200">
                                {riskLevel} Risk
                            </span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500 block text-xs">Category</span>
                                <span className="font-medium text-gray-900">{complaint.category}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">Location</span>
                                <span className="font-medium text-gray-900 truncate block" title={complaint.location_address}>
                                    {complaint.location_address || "N/A"}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-500 block text-xs">Description</span>
                                <p className="text-gray-700 italic text-xs line-clamp-2">"{complaint.description}"</p>
                            </div>
                        </div>
                    </div>

                    {/* Visual Evidence */}
                    {complaint.photo_url && (
                        <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 relative h-28">
                            <img src={complaint.photo_url} alt="Emergency Evidence" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                <p className="text-white font-medium text-xs flex items-center gap-1">
                                    <Camera size={12} /> On-Site Evidence
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Emergency Team Selection */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield size={16} className="text-blue-600" />
                            <p className="font-bold text-blue-800 text-sm">Select Emergency Response Team</p>
                        </div>

                        {allTeams.length === 0 ? (
                            <p className="text-xs text-blue-600 italic">Loading teams...</p>
                        ) : (
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                {allTeams.map(team => {
                                    const isRecommended = team.specialization === `Emergency - ${complaint.category}`;
                                    return (
                                        <label
                                            key={team._id}
                                            className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer border transition-all ${selectedTeamId === team._id
                                                    ? 'bg-blue-100 border-blue-400 shadow-sm'
                                                    : 'bg-white border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="emergencyTeam"
                                                value={team._id}
                                                checked={selectedTeamId === team._id}
                                                onChange={() => setSelectedTeamId(team._id)}
                                                className="mt-0.5 accent-blue-600"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-xs font-bold text-gray-900">{team.name}</span>
                                                    {isRecommended && (
                                                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200">
                                                            ⭐ AI Recommended
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-500">{team.specialization}</p>
                                                <p className="text-[10px] text-gray-600 flex items-center gap-1">
                                                    <Users size={9} />
                                                    {team.supervisor_details?.username || 'No Supervisor'} &bull; {team.member_count || (team.members?.length ?? 0)} members
                                                </p>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
                            onClick={handleReject}
                        >
                            Dismiss (False Alarm)
                        </Button>
                        <Button
                            onClick={handleVerify}
                            disabled={!selectedTeamId}
                            className="flex-[2] bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <AlertTriangle size={18} />
                            Verify &amp; Deploy Team
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyAlertModal;
