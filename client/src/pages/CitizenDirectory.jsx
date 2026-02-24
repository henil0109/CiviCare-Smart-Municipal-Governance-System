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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading directory...</div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Citizen Directory</h1>
                <p className="text-gray-500">View and manage registered public users.</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex items-center gap-2 max-w-md">
                <Search size={18} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Search citizens..."
                    className="w-full outline-none text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex justify-end mb-4">
                <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Grid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCitizens.map(citizen => (
                        <div
                            key={citizen._id}
                            onClick={() => setSelectedCitizen(citizen)}
                            className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer relative group"
                        >
                            <div className="absolute top-4 right-4 text-blue-600 opacity-0 group-hover:opacity-100 transition text-xs font-bold">View Details &rarr;</div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                                    {citizen.profile_photo ? (
                                        <img src={citizen.profile_photo} alt={citizen.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-bold">{citizen.username?.[0]?.toUpperCase()}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{citizen.username}</h3>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full inline-block ${citizen.is_verified ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
                                            {citizen.is_verified ? 'Verified Citizen' : 'Unverified'}
                                        </span>
                                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                                            Lvl {citizen.level || 1}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-gray-400" /> {citizen.email}
                                </div>
                                {citizen.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-gray-400" /> {citizen.phone}
                                    </div>
                                )}
                                {citizen.ward && (
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-gray-400" /> Ward: {citizen.ward}
                                    </div>
                                )}
                                {citizen.address && (
                                    <div className="flex items-start gap-2">
                                        <MapPin size={14} className="text-gray-400 mt-1 shrink-0" />
                                        <span className="line-clamp-2">{citizen.address}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                    <span className="block font-semibold text-gray-700">{citizen.xp || 0} XP</span>
                                    <span>Earned Contribution</span>
                                </div>
                                <div className="text-xs text-gray-400">
                                    Joined {new Date(citizen.created_at || Date.now()).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th className="p-4 pl-6">Profile</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Stats</th>
                                <th className="p-4">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCitizens.map(citizen => (
                                <tr key={citizen._id} onClick={() => setSelectedCitizen(citizen)} className="hover:bg-gray-50 transition cursor-pointer">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                                                {citizen.profile_photo ? (
                                                    <img src={citizen.profile_photo} alt={citizen.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-lg font-bold">{citizen.username?.[0]?.toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{citizen.username}</div>
                                                <div className="flex gap-1 mt-0.5">
                                                    {citizen.is_verified && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">Verified</span>}
                                                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">Lvl {citizen.level || 1}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-600 space-y-0.5">
                                            <div className="flex items-center gap-1.5"><Mail size={12} className="text-gray-400" /> {citizen.email}</div>
                                            <div className="flex items-center gap-1.5"><Phone size={12} className="text-gray-400" /> {citizen.phone || 'N/A'}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm font-semibold text-gray-700">{citizen.xp || 0} XP</div>
                                        <div className="text-xs text-gray-400">contribution</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-500">{new Date(citizen.created_at || Date.now()).toLocaleDateString()}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detailed View Modal */}
            {selectedCitizen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div
                        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600">
                            <button
                                onClick={() => setSelectedCitizen(null)}
                                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition backdrop-blur-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-8 pb-8">
                            <div className="relative -mt-16 mb-6 flex justify-between items-end">
                                <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-xl">
                                    <div className="w-full h-full rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400">
                                        {selectedCitizen.profile_photo ? (
                                            <img src={selectedCitizen.profile_photo} alt={selectedCitizen.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} />
                                        )}
                                    </div>
                                </div>
                                <div className="mb-2 flex gap-2">
                                    {selectedCitizen.is_verified && (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                            <Shield size={14} /> Verified ID
                                        </span>
                                    )}
                                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                        <Trophy size={14} /> Lvl {selectedCitizen.level || 1}
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 mb-1">{selectedCitizen.username}</h2>
                            <p className="text-gray-500 flex items-center gap-2 mb-6">
                                <Mail size={16} /> {selectedCitizen.email}
                            </p>
                            {selectedCitizen.id_number && (
                                <p className="text-gray-500 flex items-center gap-2 mb-6 -mt-4">
                                    <Shield size={16} /> ID: {selectedCitizen.id_number}
                                </p>
                            )}

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 border-b pb-2">Contact Information</h3>

                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                <Phone size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Phone</p>
                                                <p className="text-gray-800 font-medium">{selectedCitizen.phone || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                <MapPin size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Address</p>
                                                <p className="text-gray-800 font-medium">{selectedCitizen.address || 'N/A'}</p>
                                                <p className="text-sm text-gray-500 mt-1">Ward: {selectedCitizen.ward || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 border-b pb-2">Civic Impact</h3>

                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
                                                <Trophy size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Total XP</p>
                                                <p className="text-gray-800 font-medium text-lg">{selectedCitizen.xp || 0}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                                <Calendar size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Member Since</p>
                                                <p className="text-gray-800 font-medium">
                                                    {new Date(selectedCitizen.created_at || Date.now()).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-4 flex gap-2">
                                        <button
                                            onClick={() => {
                                                navigate(`/admin/complaints?user_id=${selectedCitizen._id}`);
                                                // Since filtering by user_id isn't fully built in AdminComplaints UI yet, 
                                                // this is a placeholder/intent. 
                                                // Ideally pass state or filter context.
                                                // For MVP, let's just alert if not implemented or console log 
                                                // But actually, we can pass state via navigation
                                                navigate('/admin/complaints', { state: { userId: selectedCitizen._id, username: selectedCitizen.username } });
                                            }}
                                            className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                                        >
                                            <ExternalLink size={16} /> View Complaints
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to flag ${selectedCitizen.username} for suspicious activity? This will notify other admins.`)) {
                                                    alert("Account Flagged (Placeholder for future implementation)");
                                                }
                                            }}
                                            className="flex-1 py-2 rounded-lg border border-red-100 text-red-600 text-sm font-medium hover:bg-red-50 transition flex items-center justify-center gap-2"
                                        >
                                            <AlertTriangle size={16} /> Flag Account
                                        </button>
                                        <button
                                            onClick={handleDeleteUser}
                                            className="flex-1 py-2 rounded-lg border border-red-600 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={16} /> Delete User
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CitizenDirectory;
