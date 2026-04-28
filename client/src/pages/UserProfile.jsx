import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, MapPin, Phone, Shield, Camera, Edit2, Save, X,
    Trophy, Lock, Eye, EyeOff, CheckCircle, AlertCircle, KeyRound, Image as ImageIcon
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
        `w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 ${editable && isEditing
            ? 'bg-white border-slate-200 shadow-sm text-slate-900'
            : 'bg-slate-50 border-slate-100 cursor-not-allowed text-slate-500'
        }`;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-outfit">
            {/* Banner */}
            <div className="h-56 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                <div className="container mx-auto px-4 h-full relative">
                    <div className="absolute bottom-8 left-4 md:left-8 text-white">
                        <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-md tracking-tight">My Profile</h1>
                        <p className="text-blue-100 font-medium mt-2 text-sm md:text-base opacity-90">Manage your account &amp; personal information</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 relative z-10 max-w-6xl">
                {/* Toast Message */}
                <AnimatePresence>
                    {saveMsg.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`mb-6 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] font-bold text-sm ${saveMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                        >
                            {saveMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            {saveMsg.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left: Profile Card */}
                    <div className="w-full lg:w-1/3 space-y-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 text-center border border-slate-100 relative overflow-hidden">
                            
                            {/* Background pattern */}
                            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-blue-50 to-white"></div>

                            {/* Avatar */}
                            <div className="relative w-32 h-32 mx-auto mb-6 z-10">
                                <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-1 shadow-lg">
                                    <div className="w-full h-full rounded-[1.4rem] bg-white overflow-hidden flex items-center justify-center border-2 border-white">
                                        {user.profile_photo ? (
                                            <img src={user.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-5xl font-extrabold text-blue-600">
                                                {user.username?.[0]?.toUpperCase() || '?'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button onClick={handlePhotoClick}
                                    className="absolute -bottom-2 -right-2 bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors border-4 border-white z-20">
                                    <Camera size={16} />
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            </div>

                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight relative z-10">{user.username || '—'}</h2>
                            <p className="text-blue-600 font-bold text-sm mb-2 uppercase tracking-widest relative z-10">{stats.rank}</p>
                            <p className="text-slate-500 font-medium text-sm mb-6 relative z-10 flex items-center justify-center gap-2">
                                <Mail size={14} className="text-slate-400" /> {user.email || '—'}
                            </p>

                            {/* XP Bar */}
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6 text-left relative z-10">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Progress</span>
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Lvl {stats.level}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((stats.xp / stats.nextLevelXp) * 100, 100)}%` }}
                                        transition={{ duration: 1, delay: 0.3 }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                    />
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 text-right">{stats.xp} / {stats.nextLevelXp} XP</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 relative z-10">
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
                                    <p className="text-3xl font-black text-blue-700 tracking-tight">{stats.complaintsSolved}</p>
                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Resolved</p>
                                </div>
                                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 shadow-sm">
                                    <p className="text-3xl font-black text-purple-700 tracking-tight">{stats.level}</p>
                                    <p className="text-[10px] text-purple-600 font-bold uppercase tracking-widest mt-1">Level</p>
                                </div>
                            </div>

                            {/* Badges */}
                            {stats.badges.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-2 mt-6 pt-6 border-t border-slate-100 relative z-10">
                                    {stats.badges.map((badge, i) => (
                                        <div key={i} className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center shadow-sm text-xl" title={badge}>
                                            🏅
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Verification */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100 shadow-sm">
                                    <Shield size={22} />
                                </div>
                                <div>
                                    <p className="font-extrabold text-slate-900 text-base">Verified Citizen</p>
                                    <p className="text-[11px] font-bold text-slate-500 mt-0.5 tracking-wider">ID: {user.id_number || 'XXXX-XXXX-XXXX'}</p>
                                </div>
                                <span className="ml-auto bg-emerald-100 text-emerald-700 w-6 h-6 flex items-center justify-center rounded-full text-xs shadow-sm"><CheckCircle size={14} /></span>
                            </div>
                        </motion.div>
                        
                        {/* Change Password Card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-slate-100">
                            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2 text-lg">
                                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                    <KeyRound size={14} />
                                </div>
                                Security Settings
                            </h3>
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Lock size={16} className="text-slate-400" /> Change Password
                            </button>
                        </motion.div>
                    </div>

                    {/* Right: Account Settings */}
                    <div className="w-full lg:w-2/3 space-y-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-slate-100">

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Information</h2>
                                    <p className="text-slate-500 font-medium text-sm mt-1">Update your personal details</p>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    {isEditing && (
                                        <button onClick={() => setIsEditing(false)}
                                            className="px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors text-sm w-full sm:w-auto">
                                            <X size={16} /> Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                        disabled={saveLoading}
                                        className={`px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all text-sm w-full sm:w-auto shadow-sm ${isEditing ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_8px_20px_rgba(5,150,105,0.2)]' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_8px_20px_rgba(37,99,235,0.2)]'
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
                                <div className="flex items-center justify-center h-40 text-slate-400">
                                    <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
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
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                            <input
                                                type="email"
                                                value={user.email || ''}
                                                disabled={true}
                                                className={inputClass(false)}
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-1">Cannot be changed</p>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
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
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Account Role</label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                value={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                                                disabled={true}
                                                className={inputClass(false)}
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="md:col-span-2 space-y-2 mt-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Residential Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 text-slate-400 z-10" size={18} />
                                            <textarea
                                                rows={3}
                                                value={user.address || ''}
                                                disabled={!isEditing}
                                                onChange={(e) => setUser({ ...user, address: e.target.value })}
                                                placeholder="Your full residential address"
                                                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 resize-none ${isEditing ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-50 border-slate-100 cursor-not-allowed text-slate-500'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Reward System */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-slate-100">
                            <h3 className="font-extrabold text-slate-900 mb-6 flex items-center gap-3 text-xl tracking-tight">
                                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-500 shadow-sm">
                                    <Trophy size={18} />
                                </div>
                                Reward System Logic
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Report Issue', xp: '+10 XP', color: 'blue' },
                                    { label: 'Issue Resolved', xp: '+100 XP', color: 'emerald' },
                                    { label: 'Badge Earned', xp: 'Special', color: 'purple' },
                                    { label: 'False Report', xp: 'Penalty', color: 'red' },
                                ].map(({ label, xp, color }) => (
                                    <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-2xl p-5 text-center shadow-sm`}>
                                        <p className={`text-xl font-black text-${color}-700 tracking-tight`}>{xp}</p>
                                        <p className={`text-[10px] text-${color}-600 font-bold uppercase tracking-widest mt-2`}>{label}</p>
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
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.target === e.currentTarget && setShowPasswordModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 border border-slate-100 relative"
                        >
                            <button onClick={() => setShowPasswordModal(false)}
                                className="absolute top-6 right-6 w-8 h-8 bg-slate-50 hover:bg-red-50 hover:text-red-500 border border-slate-100 rounded-full flex items-center justify-center transition-colors shadow-sm text-slate-400">
                                <X size={16} />
                            </button>

                            <div className="mb-8">
                                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-4">
                                    <KeyRound size={20} />
                                </div>
                                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Change Password</h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">Enter your current and new password</p>
                            </div>

                            {pwMsg.text && (
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm font-bold shadow-sm ${pwMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                    {pwMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                    {pwMsg.text}
                                </div>
                            )}

                            <div className="space-y-5">
                                {[
                                    { label: 'Current Password', key: 'current_password', show: showCurrent, toggle: setShowCurrent },
                                    { label: 'New Password', key: 'new_password', show: showNew, toggle: setShowNew },
                                    { label: 'Confirm New Password', key: 'confirm_password', show: showConfirm, toggle: setShowConfirm },
                                ].map(({ label, key, show, toggle }) => (
                                    <div key={key} className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">{label}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                            <input
                                                type={show ? 'text' : 'password'}
                                                value={pwForm[key]}
                                                onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                                                placeholder="••••••••"
                                                className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                                            />
                                            <button type="button" onClick={() => toggle(!show)}
                                                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                                                {show ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleChangePassword}
                                disabled={pwLoading}
                                className="w-full mt-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-[0_8px_20px_rgba(79,70,229,0.2)] flex items-center justify-center gap-2 disabled:opacity-60"
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
