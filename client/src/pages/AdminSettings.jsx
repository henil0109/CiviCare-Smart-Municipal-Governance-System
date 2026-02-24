import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    User,
    Bell,
    Shield,
    Save,
    Loader
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState({
        username: '',
        email: '',
        phone: '',
        bio: '', // optional
        role: ''
    });

    const [security, setSecurity] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (profile.phone && !/^\d{10}$/.test(profile.phone)) {
            alert("Phone number must be exactly 10 digits.");
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/auth/profile', profile, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local storage user object
            const user = JSON.parse(localStorage.getItem('user'));
            user.username = profile.username;
            localStorage.setItem('user', JSON.stringify(user));

            alert('Profile updated successfully');
            setSaving(false);
        } catch (err) {
            alert('Failed to update profile');
            setSaving(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (security.newPassword !== security.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/auth/profile', {
                new_password: security.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Password changed successfully');
            setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setSaving(false);
        } catch (err) {
            alert('Failed to change password');
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-500 mb-8">Manage your account settings and preferences.</p>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Settings Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                            <div className="mb-8 flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400">
                                    {profile.username ? profile.username.substring(0, 2).toUpperCase() : 'AD'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{profile.username}</h3>
                                    <p className="text-gray-500 capitalize">{profile.role}</p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
                                <div className="grid grid-cols-1 gap-6">
                                    <Input
                                        label="Full Name"
                                        value={profile.username}
                                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                    />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={saving}
                                >
                                    {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                    Save Changes
                                </Button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Change Password</h3>
                            <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-lg">
                                <Input
                                    label="Current Password"
                                    type="password"
                                    value={security.currentPassword}
                                    onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                                />
                                <Input
                                    label="New Password"
                                    type="password"
                                    value={security.newPassword}
                                    onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                                />
                                <Input
                                    label="Confirm New Password"
                                    type="password"
                                    value={security.confirmPassword}
                                    onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                                />
                                <Button
                                    type="submit"
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={saving}
                                >
                                    {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                    Update Password
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
