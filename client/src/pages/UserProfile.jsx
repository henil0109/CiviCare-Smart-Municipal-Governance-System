import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, MapPin, Phone, Shield, Camera, Edit2, Save, X,
    Trophy, Lock, Eye, EyeOff, CheckCircle, AlertCircle, KeyRound
} from 'lucide-react';

const UserProfile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [stats, setStats] = useState({ level: 1, xp: 0, nextLevelXp: 1000, complaintsSolved: 0, rank: 'Novice Citizen', badges: [] });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveMsg, setSaveMsg] = useState({ type: '', text: '' });

    // Change Password state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const fileInputRef = useRef(null);

    // ✅ Fixed: useEffect (not useState) for data fetch
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/auth/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setUser(prev => ({ ...prev, ...data }));
                    if (data.stats) setStats(data.stats);
                    // Update localStorage with fresh data
                    const stored = JSON.parse(localStorage.getItem('user') || '{}');
                    localStorage.setItem('user', JSON.stringify({ ...stored, ...data }));
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handlePhotoClick = () => fileInputRef.current.click();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post('/api/upload', formData);
            const photoUrl = res.data.url;
            setUser(prev => ({ ...prev, profile_photo: photoUrl }));
            const token = localStorage.getItem('token');
            await axios.put('/api/auth/profile', { profile_photo: photoUrl }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, profile_photo: photoUrl }));
            setSaveMsg({ type: 'success', text: 'Profile photo updated!' });
            setTimeout(() => setSaveMsg({ type: '', text: '' }), 3000);
        } catch {
            setSaveMsg({ type: 'error', text: 'Failed to upload photo.' });
        }
    };

    const handleSave = async () => {
        if (user.phone && !/^\d{10}$/.test(user.phone)) {
            setSaveMsg({ type: 'error', text: 'Phone must be exactly 10 digits.' });
            return;
        }
        setSaveLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/auth/profile', {
                username: user.username,
                phone: user.phone,
                address: user.address,
                profile_photo: user.profile_photo
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            setIsEditing(false);
            localStorage.setItem('user', JSON.stringify(user));
            setSaveMsg({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setSaveMsg({ type: '', text: '' }), 3000);
        } catch {
            setSaveMsg({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaveLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setPwMsg({ type: '', text: '' });
        if (!pwForm.current_password || !pwForm.new_password || !pwForm.confirm_password) {
            setPwMsg({ type: 'error', text: 'All fields are required.' }); return;
        }
        if (pwForm.new_password.length < 6) {
            setPwMsg({ type: 'error', text: 'New password must be at least 6 characters.' }); return;
        }
        if (pwForm.new_password !== pwForm.confirm_password) {
            setPwMsg({ type: 'error', text: 'New passwords do not match.' }); return;
        }
        setPwLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/auth/change-password', {
                current_password: pwForm.current_password,
                new_password: pwForm.new_password
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            setPwMsg({ type: 'success', text: res.data.message });
            setPwForm({ current_password: '', new_password: '', confirm_password: '' });
            setTimeout(() => { setShowPasswordModal(false); setPwMsg({ type: '', text: '' }); }, 2000);
        } catch (err) {
            setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
        } finally {
            setPwLoading(false);
        }
    };

    const inputClass = (editable = true) =>
        `w-full pl-10 pr-4 py-3 rounded-xl border text-gray-800 font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${editable && isEditing
            ? 'bg-white border-blue-300 shadow-sm'
            : 'bg-gray-50 border-gray-200 cursor-not-allowed text-gray-600'
        }`;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Banner */}
            <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] opacity-20 bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-6 left-8 text-white">
                    <h1 className="text-3xl font-bold drop-shadow">My Profile</h1>
                    <p className="text-blue-200 text-sm mt-1">Manage your account &amp; personal information</p>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-6 relative z-10 max-w-5xl">
                {/* Toast Message */}
                <AnimatePresence>
                    {saveMsg.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`mb-4 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-md font-medium text-sm ${saveMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                        >
                            {saveMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {saveMsg.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Left: Profile Card */}
                    <div className="w-full lg:w-1/3 space-y-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl shadow-xl p-6 text-center border border-gray-100">

                            {/* Avatar */}
                            <div className="relative w-28 h-28 mx-auto mb-4">
                                <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-1 shadow-lg">
                                    <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                                        {user.profile_photo ? (
                                            <img src={user.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl font-bold text-blue-600">
                                                {user.username?.[0]?.toUpperCase() || '?'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button onClick={handlePhotoClick}
                                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition ring-2 ring-white">
                                    <Camera size={14} />
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            </div>

                            <h2 className="text-xl font-bold text-gray-900">{user.username || '—'}</h2>
                            <p className="text-blue-600 font-semibold text-sm mb-1">{stats.rank}</p>
                            <p className="text-gray-500 text-xs mb-4">{user.email || '—'}</p>

                            {/* XP Bar */}
                            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((stats.xp / stats.nextLevelXp) * 100, 100)}%` }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mb-5">{stats.xp} / {stats.nextLevelXp} XP • Level {stats.level}</p>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-5">
                                <div className="bg-blue-50 rounded-2xl p-3">
                                    <p className="text-2xl font-bold text-blue-700">{stats.complaintsSolved}</p>
                                    <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">Resolved</p>
                                </div>
                                <div className="bg-purple-50 rounded-2xl p-3">
                                    <p className="text-2xl font-bold text-purple-700">{stats.level}</p>
                                    <p className="text-xs text-purple-500 font-medium uppercase tracking-wide">Level</p>
                                </div>
                            </div>

                            {/* Badges */}
                            {stats.badges.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-2 mt-4">
                                    {stats.badges.map((badge, i) => (
                                        <span key={i} className="text-xl" title={badge}>🏅</span>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Change Password Card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-white rounded-3xl shadow-lg p-5 border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <KeyRound size={18} className="text-indigo-600" /> Security
                            </h3>
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full py-3 px-4 bg-indigo-50 text-indigo-700 rounded-2xl font-semibold text-sm hover:bg-indigo-100 transition flex items-center justify-center gap-2 border border-indigo-100"
                            >
                                <Lock size={16} /> Change Password
                            </button>
                        </motion.div>

                        {/* Verification */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="bg-white rounded-3xl shadow-lg p-5 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-green-800 text-sm">Verified Citizen</p>
                                    <p className="text-xs text-green-600">ID: {user.id_number || 'XXXX-XXXX-XXXX'}</p>
                                </div>
                                <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">✓</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Account Settings */}
                    <div className="w-full lg:w-2/3">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">

                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
                                    <p className="text-gray-400 text-sm mt-0.5">Update your personal information</p>
                                </div>
                                <div className="flex gap-2">
                                    {isEditing && (
                                        <button onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 rounded-xl flex items-center gap-2 font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition text-sm">
                                            <X size={16} /> Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                        disabled={saveLoading}
                                        className={`px-5 py-2 rounded-xl flex items-center gap-2 font-medium transition text-sm ${isEditing ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                            }`}
                                    >
                                        {isEditing
                                            ? (saveLoading ? 'Saving...' : <><Save size={16} /> Save Changes</>)
                                            : <><Edit2 size={16} /> Edit Profile</>
                                        }
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center h-40 text-gray-400">
                                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Full Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-600">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={user.username || ''}
                                                disabled={!isEditing}
                                                onChange={(e) => setUser({ ...user, username: e.target.value })}
                                                className={inputClass()}
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-600">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                            <input
                                                type="email"
                                                value={user.email || ''}
                                                disabled={true}
                                                className={inputClass(false)}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 ml-1">Email cannot be changed</p>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-600">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={user.phone || ''}
                                                disabled={!isEditing}
                                                maxLength={10}
                                                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                                                placeholder="10-digit mobile number"
                                                className={inputClass()}
                                            />
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-600">Account Role</label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                                                disabled={true}
                                                className={inputClass(false)}
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-600">Residential Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3.5 text-gray-400 z-10" size={18} />
                                            <textarea
                                                rows={3}
                                                value={user.address || ''}
                                                disabled={!isEditing}
                                                onChange={(e) => setUser({ ...user, address: e.target.value })}
                                                placeholder="Your full residential address"
                                                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-gray-800 font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${isEditing ? 'bg-white border-blue-300 shadow-sm' : 'bg-gray-50 border-gray-200 cursor-not-allowed text-gray-600'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Reward System */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-white rounded-3xl shadow-lg p-7 mt-5 border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 text-lg">
                                <Trophy size={20} className="text-yellow-500" /> Reward System
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { label: 'Report Issue', xp: '+10 XP', color: 'blue' },
                                    { label: 'Issue Resolved', xp: '+100 XP', color: 'green' },
                                    { label: 'Badge Earned', xp: 'Special', color: 'purple' },
                                    { label: 'False Report', xp: 'Penalty', color: 'red' },
                                ].map(({ label, xp, color }) => (
                                    <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-2xl p-4 text-center`}>
                                        <p className={`text-lg font-bold text-${color}-700`}>{xp}</p>
                                        <p className={`text-xs text-${color}-500 font-medium mt-1`}>{label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.target === e.currentTarget && setShowPasswordModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                                    <p className="text-gray-400 text-sm mt-0.5">Enter your current and new password</p>
                                </div>
                                <button onClick={() => setShowPasswordModal(false)}
                                    className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition">
                                    <X size={18} className="text-gray-600" />
                                </button>
                            </div>

                            {pwMsg.text && (
                                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm font-medium ${pwMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                    {pwMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    {pwMsg.text}
                                </div>
                            )}

                            <div className="space-y-4">
                                {[
                                    { label: 'Current Password', key: 'current_password', show: showCurrent, toggle: setShowCurrent },
                                    { label: 'New Password', key: 'new_password', show: showNew, toggle: setShowNew },
                                    { label: 'Confirm New Password', key: 'confirm_password', show: showConfirm, toggle: setShowConfirm },
                                ].map(({ label, key, show, toggle }) => (
                                    <div key={key} className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-600">{label}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={17} />
                                            <input
                                                type={show ? 'text' : 'password'}
                                                value={pwForm[key]}
                                                onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                                                placeholder="••••••••"
                                                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 focus:bg-white transition"
                                            />
                                            <button type="button" onClick={() => toggle(!show)}
                                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                                                {show ? <EyeOff size={17} /> : <Eye size={17} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleChangePassword}
                                disabled={pwLoading}
                                className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {pwLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <><KeyRound size={18} /> Update Password</>
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserProfile;
