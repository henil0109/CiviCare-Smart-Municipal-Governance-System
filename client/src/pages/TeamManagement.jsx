import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    Shield,
    Trash2,
    X,
    Loader,
    Users,
    Eye,
    Power,
    CheckCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const TeamManagement = () => {
    const [activeTab, setActiveTab] = useState('teams'); // 'teams', 'supervisors', 'staff', 'admins'
    const [members, setMembers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewMember, setViewMember] = useState(null); // For Profile Modal
    const [formErrors, setFormErrors] = useState({});

    // New Member Form State
    const [memberForm, setMemberForm] = useState({
        username: '', email: '', password: '', role: 'staff', phone: '', ward: '', specialization: 'General'
    });

    // New Team Form State
    const [teamForm, setTeamForm] = useState({
        name: '', supervisor_id: '', members: [], specialization: 'General'
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Always fetch both for simplicity in this demo
            const [usersRes, teamsRes] = await Promise.all([
                axios.get('/api/admin/users', { headers }),
                axios.get('/api/admin/teams', { headers })
            ]);

            setMembers(usersRes.data);
            setTeams(teamsRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const handleToggleStatus = async (member) => {
        const action = member.is_active === false ? 'activate' : 'deactivate';
        if (!window.confirm(`Are you sure you want to ${action} ${member.username}?`)) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.patch(`/api/admin/users/${member._id}/toggle-status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update in local state without full refetch
            setMembers(prev => prev.map(m =>
                m._id === member._id ? { ...m, is_active: res.data.is_active } : m
            ));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDeleteTeam = async (id) => {
        if (!window.confirm('Are you sure you want to disband this team?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/admin/teams/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert('Failed to delete team');
        }
    };

    const validateMemberForm = () => {
        const errors = {};
        if (!memberForm.username.trim()) errors.username = 'Username is required';
        else if (memberForm.username.trim().length < 3) errors.username = 'Username must be at least 3 characters';

        if (!memberForm.email.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberForm.email)) errors.email = 'Enter a valid email address';

        if (!memberForm.password) errors.password = 'Password is required';
        else if (memberForm.password.length < 8) errors.password = 'Password must be at least 8 characters';

        if (memberForm.phone && !/^\d{10}$/.test(memberForm.phone)) errors.phone = 'Phone must be exactly 10 digits';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!validateMemberForm()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/admin/users', memberForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowAddModal(false);
            setMemberForm({ username: '', email: '', password: '', role: 'staff', phone: '', ward: '', specialization: 'General' });
            setFormErrors({});
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/admin/teams', teamForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowAddModal(false);
            setTeamForm({ name: '', supervisor_id: '', members: [], specialization: 'General' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create team');
        }
    };

    // Filter Logic
    const filteredMembers = members.filter(m => {
        // Base Search
        const matchesSearch = m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Role Filter based on Tab
        if (activeTab === 'supervisors') return m.role === 'supervisor';
        if (activeTab === 'staff') return m.role === 'staff' || m.role === 'field_officer';
        if (activeTab === 'admins') return m.role === 'admin';
        return false;
    });

    const filteredTeams = teams.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helpers
    const getSupervisorOptions = () => members.filter(m => m.role === 'supervisor' || m.role === 'admin');

    const openAddModal = () => {
        // Pre-select role based on tab
        if (activeTab === 'supervisors') setMemberForm(prev => ({ ...prev, role: 'supervisor' }));
        if (activeTab === 'staff') setMemberForm(prev => ({ ...prev, role: 'staff' }));
        if (activeTab === 'admins') setMemberForm(prev => ({ ...prev, role: 'admin' }));
        setShowAddModal(true);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Organization & Teams</h1>
                    <p className="text-gray-500">Manage structure, staff, and permissions.</p>
                </div>
                <div className="flex gap-3">
                    {/* Only Admins can add members/teams */}
                    {JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' && (
                        <Button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                            <Plus size={18} />
                            {activeTab === 'teams' ? 'Create Team' :
                                activeTab === 'supervisors' ? 'Add Supervisor' :
                                    activeTab === 'admins' ? 'Add Admin' : 'Add Staff'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 mb-6 overflow-x-auto">
                {['teams', 'supervisors', 'staff', 'admins'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-medium transition-colors border-b-2 capitalize whitespace-nowrap ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab === 'staff' ? 'Field Staff' : tab}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex items-center gap-2 max-w-md">
                <Search size={18} className="text-gray-400" />
                <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    className="w-full outline-none text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* CONTENT: TEAMS TAB */}
            {activeTab === 'teams' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeams.map(team => (
                        <div key={team._id} className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                    <Shield size={20} />
                                </div>
                                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">{team.specialization}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{team.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">Lead: {team.supervisor_details?.username}</p>

                            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-gray-400" />
                                    <span>{team.member_count} Members</span>
                                </div>

                                {JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' && (
                                    <button
                                        onClick={() => handleDeleteTeam(team._id)}
                                        className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                                        title="Disband Team"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredTeams.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-400">No teams found. Create one!</div>
                    )}
                </div>
            )}

            {/* CONTENT: MEMBER LISTS (Shared UI for Staff, Supervisors, Admins) */}
            {activeTab !== 'teams' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th className="p-4 pl-6">Name</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Ward / Info</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredMembers.map(m => (
                                <tr key={m._id} className="hover:bg-gray-50">
                                    <td className="p-4 pl-6">
                                        <div className="font-semibold text-gray-900">{m.username}</div>
                                        {m.specialization && m.specialization !== 'General' && (
                                            <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 font-medium">
                                                {m.specialization} Expert
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${m.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                            m.role === 'supervisor' ? 'bg-blue-100 text-blue-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            {m.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {m.role === 'field_officer' ? '-' : (m.ward || '-')}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">{m.email}</td>
                                    <td className="p-4">
                                        {m.role !== 'admin' && JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' ? (
                                            <button
                                                onClick={() => handleToggleStatus(m)}
                                                title={m.is_active === false ? 'Activate' : 'Deactivate'}
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${m.is_active === false
                                                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                                    }`}
                                            >
                                                <Power size={12} />
                                                {m.is_active === false ? 'Inactive' : 'Active'}
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => setViewMember(m)} className="text-blue-400 hover:text-blue-600" title="View Profile">
                                            <Eye size={18} />
                                        </button>
                                        {m.role !== 'admin' && JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' && (
                                            <button onClick={() => handleDelete(m._id)} className="text-red-400 hover:text-red-600" title="Delete User">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredMembers.length === 0 && (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400">No members found in this category.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODALS */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400"><X size={24} /></button>
                        <h2 className="text-xl font-bold mb-6">
                            {activeTab === 'teams' ? 'Create Operational Team' : 'Add New Member'}
                        </h2>

                        {activeTab !== 'teams' ? (
                            <form onSubmit={handleAddMember} className="space-y-4">
                                <div>
                                    <Input
                                        label="Username *"
                                        value={memberForm.username}
                                        onChange={e => { setMemberForm({ ...memberForm, username: e.target.value }); setFormErrors(p => ({ ...p, username: '' })); }}
                                    />
                                    {formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
                                </div>
                                <div>
                                    <Input
                                        label="Email *"
                                        type="email"
                                        value={memberForm.email}
                                        onChange={e => { setMemberForm({ ...memberForm, email: e.target.value }); setFormErrors(p => ({ ...p, email: '' })); }}
                                    />
                                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                                </div>
                                <div>
                                    <Input
                                        label="Password * (min 8 chars)"
                                        type="password"
                                        value={memberForm.password}
                                        onChange={e => { setMemberForm({ ...memberForm, password: e.target.value }); setFormErrors(p => ({ ...p, password: '' })); }}
                                    />
                                    {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Role</label>
                                        <select className="w-full p-2 border rounded-lg" value={memberForm.role} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}>
                                            <option value="staff">Staff</option>
                                            <option value="field_officer">Field Officer</option>
                                            <option value="supervisor">Supervisor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <Input label="Ward" value={memberForm.ward} onChange={e => setMemberForm({ ...memberForm, ward: e.target.value })} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Expertise / Domain</label>
                                    <select className="w-full p-2 border rounded-lg" value={memberForm.specialization} onChange={e => setMemberForm({ ...memberForm, specialization: e.target.value })}>
                                        <option value="General">General</option>
                                        <option value="Roads">Roads</option>
                                        <option value="Water">Water</option>
                                        <option value="Electricity">Electricity</option>
                                        <option value="Sanitation">Sanitation</option>
                                    </select>
                                </div>

                                <div>
                                    <Input
                                        label="Phone (10 digits)"
                                        value={memberForm.phone}
                                        onChange={e => { setMemberForm({ ...memberForm, phone: e.target.value }); setFormErrors(p => ({ ...p, phone: '' })); }}
                                    />
                                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                                </div>
                                <Button type="submit" className="w-full bg-blue-600 text-white">Add Member</Button>
                            </form>
                        ) : (
                            <form onSubmit={handleCreateTeam} className="space-y-4">
                                <Input label="Team Name" value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} required />

                                <div>
                                    <label className="block text-sm font-medium mb-1">Supervisor</label>
                                    <select className="w-full p-2 border rounded-lg" value={teamForm.supervisor_id} onChange={e => setTeamForm({ ...teamForm, supervisor_id: e.target.value })} required>
                                        <option value="">Select Supervisor</option>
                                        {getSupervisorOptions().map(s => <option key={s._id} value={s._id}>{s.username}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Specialization</label>
                                    <select className="w-full p-2 border rounded-lg" value={teamForm.specialization} onChange={e => setTeamForm({ ...teamForm, specialization: e.target.value })}>
                                        <option value="General">General</option>
                                        <option value="Roads">Roads</option>
                                        <option value="Water">Water</option>
                                        <option value="Electricity">Electricity</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Assign Members</label>
                                    <div className="border rounded-lg p-2 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
                                        {members.filter(m => m.role === 'staff' || m.role === 'field_officer').map(member => (
                                            <label key={member._id} className="flex items-center gap-3 p-2 bg-white rounded border border-gray-100 cursor-pointer hover:border-blue-300 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-blue-600 rounded"
                                                    checked={teamForm.members.includes(member._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setTeamForm(prev => ({ ...prev, members: [...prev.members, member._id] }));
                                                        } else {
                                                            setTeamForm(prev => ({ ...prev, members: prev.members.filter(id => id !== member._id) }));
                                                        }
                                                    }}
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">{member.username}</div>
                                                    <div className="text-xs text-gray-500">{member.specialization || 'General'}{member.role !== 'field_officer' && member.ward ? ` • ${member.ward}` : ''}</div>
                                                </div>
                                            </label>
                                        ))}
                                        {members.filter(m => m.role === 'staff' || m.role === 'field_officer').length === 0 && (
                                            <div className="text-center text-gray-400 text-sm py-4">No available staff members.</div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{teamForm.members.length} members selected</p>
                                </div>

                                <Button type="submit" className="w-full bg-blue-600 text-white">Create Team</Button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* VIEW MEMBER PROFILE MODAL */}
            {viewMember && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-0 relative overflow-hidden shadow-2xl">
                        <button onClick={() => setViewMember(null)} className="absolute top-4 right-4 text-white hover:text-gray-200 z-10"><X size={24} /></button>

                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center pt-10">
                            <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-blue-600 mb-3 shadow-lg">
                                {viewMember.username.substring(0, 2).toUpperCase()}
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">{viewMember.username}</h2>
                            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                                {viewMember.role.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>

                        {/* Details */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><Mail size={16} /></div>
                                <div>
                                    <p className="text-xs text-gray-400">Email</p>
                                    <p className="font-medium text-sm">{viewMember.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><Phone size={16} /></div>
                                <div>
                                    <p className="text-xs text-gray-400">Phone</p>
                                    <p className="font-medium text-sm">{viewMember.phone || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><MapPin size={16} /></div>
                                <div>
                                    <p className="text-xs text-gray-400">Assigned Ward</p>
                                    <p className="font-medium text-sm">{viewMember.ward || 'Central HQ'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><Shield size={16} /></div>
                                <div>
                                    <p className="text-xs text-gray-400">Expertise</p>
                                    <p className="font-medium text-sm text-blue-600">{viewMember.specialization || 'General'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                            {viewMember.is_active === false ? (
                                <span className="text-xs text-red-500 font-bold flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    Inactive / Deactivated
                                </span>
                            ) : (
                                <span className="text-xs text-green-600 font-bold flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    Active &amp; Available
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManagement;
