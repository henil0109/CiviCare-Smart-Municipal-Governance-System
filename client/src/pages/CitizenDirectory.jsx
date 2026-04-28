import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Phone, Mail, User, X, Shield, Trophy, Calendar, Grid, List, AlertTriangle, ExternalLink, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CitizenDirectory = () => {
    const [citizens, setCitizens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCitizen, setSelectedCitizen] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCitizens();
    }, []);

    const fetchCitizens = async () => {
        try {
            const token = localStorage.getItem('token');
            // Fetch all users, filtering will happen client side or via query param if backend supported it
            const res = await axios.get('/api/admin/users?role=citizen', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCitizens(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedCitizen) return;

        if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE ${selectedCitizen.username}? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/admin/users/${selectedCitizen._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Success: Remove from state
            setCitizens(citizens.filter(c => c._id !== selectedCitizen._id));
            setSelectedCitizen(null);
            alert("User deleted successfully.");
        } catch (err) {
            console.error("Error deleting user:", err);
            alert("Failed to delete user. Please check console for details.");
        }
    };

    const filteredCitizens = citizens.filter(c =>
        c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm))
    );

    if (loading) return <div className="p-10 text-center text-slate-500 font-outfit font-medium">Loading directory...</div>;

    return (
        <div className="font-outfit pb-10">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                        <User size={20} />
                    </div>
                    Citizen Directory
                </h1>
                <p className="text-slate-500 font-medium mt-3 text-lg">View and manage registered public users.</p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="bg-white p-2 rounded-2xl border border-slate-200 flex items-center gap-3 w-full md:max-w-md focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all shadow-sm">
                    <div className="pl-3">
                        <Search size={18} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search citizens by name, email, or phone..."
                        className="w-full outline-none text-sm bg-transparent py-1.5 text-slate-900 placeholder-slate-400 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-slate-50 p-1.5 rounded-xl flex gap-1 border border-slate-200 shadow-inner">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600 border border-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                        title="Grid View"
                    >
                        <Grid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600 border border-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                        title="List View"
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCitizens.map(citizen => (
                        <div
                            key={citizen._id}
                            onClick={() => setSelectedCitizen(citizen)}
                            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-200 transition-all cursor-pointer relative group overflow-hidden"
                        >
                            <div className="absolute top-6 right-6 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-extrabold uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">View &rarr;</div>
                            <div className="flex flex-col items-center text-center gap-4 mb-6">
                                <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
                                    {citizen.profile_photo ? (
                                        <img src={citizen.profile_photo} alt={citizen.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-extrabold text-slate-300">{citizen.username?.[0]?.toUpperCase()}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 text-xl group-hover:text-blue-600 transition-colors tracking-tight">{citizen.username}</h3>
                                    <div className="flex justify-center gap-2 mt-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md border shadow-sm ${citizen.is_verified ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-amber-700 bg-amber-50 border-amber-100'}`}>
                                            {citizen.is_verified ? 'Verified' : 'Unverified'}
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-md border border-purple-100 shadow-sm">
                                            Lvl {citizen.level || 1}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm font-medium text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <Mail size={16} className="text-slate-400 shrink-0" /> <span className="truncate">{citizen.email}</span>
                                </div>
                                {citizen.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone size={16} className="text-slate-400 shrink-0" /> <span>{citizen.phone}</span>
                                    </div>
                                )}
                                {citizen.ward && (
                                    <div className="flex items-center gap-3">
                                        <MapPin size={16} className="text-slate-400 shrink-0" /> <span>Ward: {citizen.ward}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-between items-center">
                                <div className="text-xs text-slate-500">
                                    <span className="block font-black text-slate-900 text-base">{citizen.xp || 0} XP</span>
                                    <span className="uppercase tracking-widest text-[9px] font-bold">Contribution</span>
                                </div>
                                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                    <Calendar size={12} />
                                    {new Date(citizen.created_at || Date.now()).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="p-5 pl-8 text-xs font-bold text-slate-500 uppercase tracking-widest">Profile</th>
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Stats</th>
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCitizens.map(citizen => (
                                    <tr key={citizen._id} onClick={() => setSelectedCitizen(citizen)} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                                        <td className="p-5 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-[1rem] overflow-hidden bg-white flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
                                                    {citizen.profile_photo ? (
                                                        <img src={citizen.profile_photo} alt={citizen.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-lg font-extrabold text-slate-300">{citizen.username?.[0]?.toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base tracking-tight">{citizen.username}</div>
                                                    <div className="flex gap-2 mt-1.5">
                                                        {citizen.is_verified && <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-black uppercase tracking-widest shadow-sm">Verified</span>}
                                                        <span className="text-[9px] bg-purple-50 border border-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-black uppercase tracking-widest shadow-sm">Lvl {citizen.level || 1}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-sm font-medium text-slate-600 space-y-1.5">
                                                <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {citizen.email}</div>
                                                <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {citizen.phone || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center border border-yellow-100 shadow-sm shrink-0">
                                                    <Trophy size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-base font-extrabold text-slate-900 tracking-tight">{citizen.xp || 0}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">XP</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(citizen.created_at || Date.now()).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detailed View Modal */}
            {selectedCitizen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in border border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative h-32 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-slate-100 overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                            <button
                                onClick={() => setSelectedCitizen(null)}
                                className="absolute top-6 right-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm z-10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-8 md:px-10 pb-10">
                            <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                                <div className="w-32 h-32 rounded-[2rem] bg-white p-2 shadow-lg border border-slate-100">
                                    <div className="w-full h-full rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center text-slate-300 border border-slate-100">
                                        {selectedCitizen.profile_photo ? (
                                            <img src={selectedCitizen.profile_photo} alt={selectedCitizen.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-5xl font-extrabold">{selectedCitizen.username?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {selectedCitizen.is_verified && (
                                        <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                                            <Shield size={14} /> Verified ID
                                        </span>
                                    )}
                                    <span className="bg-purple-50 border border-purple-100 text-purple-700 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                                        <Trophy size={14} /> Lvl {selectedCitizen.level || 1}
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">{selectedCitizen.username}</h2>
                            <p className="text-slate-500 font-medium flex items-center gap-3 mb-8">
                                <Mail size={18} className="text-slate-400" /> {selectedCitizen.email}
                                {selectedCitizen.id_number && (
                                    <>
                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                                        <span className="flex items-center gap-2 text-slate-500 font-medium bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                            <Shield size={14} className="text-slate-400" /> ID: {selectedCitizen.id_number}
                                        </span>
                                    </>
                                )}
                            </p>

                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100">
                                            <User size={12} />
                                        </div>
                                        Contact Information
                                    </h3>

                                    <div className="space-y-5">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100 shadow-sm">
                                                <Phone size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Phone</p>
                                                <p className="text-slate-900 font-bold">{selectedCitizen.phone || 'Not Provided'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100 shadow-sm">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Address</p>
                                                <p className="text-slate-900 font-bold">{selectedCitizen.address || 'Not Provided'}</p>
                                                <p className="text-sm text-slate-500 font-medium mt-1.5 bg-slate-50 inline-block px-2 py-0.5 rounded border border-slate-100">Ward: {selectedCitizen.ward || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100">
                                            <Trophy size={12} />
                                        </div>
                                        Civic Impact
                                    </h3>

                                    <div className="space-y-5">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100 shadow-sm">
                                                <Trophy size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Total XP</p>
                                                <p className="text-slate-900 font-extrabold text-2xl tracking-tight">{selectedCitizen.xp || 0}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100 shadow-sm">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Member Since</p>
                                                <p className="text-slate-900 font-bold">
                                                    {new Date(selectedCitizen.created_at || Date.now()).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => {
                                        navigate('/admin/complaints', { state: { userId: selectedCitizen._id, username: selectedCitizen.username } });
                                    }}
                                    className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <ExternalLink size={18} /> View Complaints
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm(`Are you sure you want to flag ${selectedCitizen.username} for suspicious activity? This will notify other admins.`)) {
                                            alert("Account Flagged (Placeholder for future implementation)");
                                        }
                                    }}
                                    className="flex-1 py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm font-bold hover:bg-amber-100 transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <AlertTriangle size={18} /> Flag Account
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    className="flex-1 py-3 rounded-xl border border-red-600 bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(220,38,38,0.2)]"
                                >
                                    <Trash2 size={18} /> Delete User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CitizenDirectory;
