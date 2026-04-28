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
    CheckCircle,
    Building2
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

    if (loading) return <div className="p-10 text-center text-slate-500 font-outfit font-medium">Loading organization data...</div>;

    return (
        <div className="font-outfit pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                            <Building2 size={20} />
                        </div>
                        Organization & Teams
                    </h1>
                    <p className="text-slate-500 font-medium mt-3 text-lg">Manage structure, staff, and permissions.</p>
                </div>
                <div className="flex gap-3">
                    {/* Only Admins can add members/teams */}
                    {JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' && (
                        <Button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 shadow-[0_8px_20px_rgba(37,99,235,0.2)] rounded-xl h-11 shrink-0">
                            <Plus size={18} />
                            {activeTab === 'teams' ? 'Create Team' :
                                activeTab === 'supervisors' ? 'Add Supervisor' :
                                    activeTab === 'admins' ? 'Add Admin' : 'Add Staff'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 border-b border-slate-200 mb-8 overflow-x-auto custom-scrollbar">
                {['teams', 'supervisors', 'staff', 'admins'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-sm font-extrabold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'}`}
                    >
                        {tab === 'staff' ? 'Field Staff' : tab}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 mb-8 flex items-center gap-3 w-full md:max-w-md focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all shadow-sm">
                <div className="pl-3">
                    <Search size={18} className="text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    className="w-full outline-none text-sm bg-transparent py-2 text-slate-900 placeholder-slate-400 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* CONTENT: TEAMS TAB */}
            {activeTab === 'teams' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTeams.map(team => (
                        <div key={team._id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-200 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                                    <Shield size={20} />
                                </div>
                                <span className="bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm">{team.specialization}</span>
                            </div>
                            <h3 className="font-extrabold text-slate-900 text-2xl mb-2 tracking-tight group-hover:text-blue-600 transition-colors">{team.name}</h3>
                            <p className="text-sm font-medium text-slate-500 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                                Lead: <span className="font-bold text-slate-700">{team.supervisor_details?.username}</span>
                            </p>

                            <div className="flex items-center justify-between text-sm font-bold text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-auto">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-slate-400" />
                                    <span>{team.member_count} Members</span>
                                </div>

                                {JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' && (
                                    <button
                                        onClick={() => handleDeleteTeam(team._id)}
                                        className="text-red-500 hover:text-white bg-white hover:bg-red-500 border border-red-200 hover:border-red-500 w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm"
                                        title="Disband Team"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredTeams.length === 0 && (
                        <div className="col-span-full text-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-300">
                                <Shield size={32} />
                            </div>
                            <p className="text-xl font-extrabold text-slate-900 mb-2">No teams found.</p>
                            <p className="text-slate-500 font-medium">Create a new team to get started.</p>
                        </div>
                    )}
                </div>
            )}

            {/* CONTENT: MEMBER LISTS (Shared UI for Staff, Supervisors, Admins) */}
            {activeTab !== 'teams' && (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="p-5 pl-8 text-xs font-bold text-slate-500 uppercase tracking-widest">Name & Role</th>
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Ward / Info</th>
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredMembers.map(m => (
                                    <tr key={m._id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-5 pl-8">
                                            <div className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors">{m.username}</div>
                                            <div className="flex gap-2 mt-2">
                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border shadow-sm ${m.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        m.role === 'supervisor' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    }`}>
                                                    {m.role.replace('_', ' ')}
                                                </span>
                                                {m.specialization && m.specialization !== 'General' && (
                                                    <span className="text-[9px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 font-black uppercase tracking-widest shadow-sm">
                                                        {m.specialization} Expert
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5 text-sm font-bold text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-slate-400" />
                                                {m.role === 'field_officer' ? '-' : (m.ward || '-')}
                                            </div>
                                        </td>
                                        <td className="p-5 text-sm font-medium text-slate-600">
                                            <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {m.email}</div>
                                        </td>
                                        <td className="p-5">
                                            {m.role !== 'admin' && JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' ? (
                                                <button
                                                    onClick={() => handleToggleStatus(m)}
                                                    title={m.is_active === false ? 'Activate' : 'Deactivate'}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm ${m.is_active === false
                                                            ? 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                        }`}
                                                >
                                                    <Power size={12} />
                                                    {m.is_active === false ? 'Inactive' : 'Active'}
                                                </button>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">N/A</span>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex gap-3">
                                                <button onClick={() => setViewMember(m)} className="w-8 h-8 flex items-center justify-center text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm" title="View Profile">
                                                    <Eye size={14} />
                                                </button>
                                                {m.role !== 'admin' && JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' && (
                                                    <button onClick={() => handleDelete(m._id)} className="w-8 h-8 flex items-center justify-center text-red-600 bg-red-50 border border-red-100 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm" title="Delete User">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredMembers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
                                                <Search size={24} />
                                            </div>
                                            <p className="text-slate-500 font-medium">No members found in this category.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODALS */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 relative shadow-2xl border border-slate-100 animate-fade-in">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 w-8 h-8 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <X size={16} />
                        </button>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">
                            {activeTab === 'teams' ? 'Create Operational Team' : 'Add New Member'}
                        </h2>

                        {activeTab !== 'teams' ? (
                            <form onSubmit={handleAddMember} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Username *</label>
                                    <Input
                                        value={memberForm.username}
                                        onChange={e => { setMemberForm({ ...memberForm, username: e.target.value }); setFormErrors(p => ({ ...p, username: '' })); }}
                                        className="w-full bg-slate-50"
                                    />
                                    {formErrors.username && <p className="text-red-500 text-xs font-bold mt-1.5">{formErrors.username}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                                    <Input
                                        type="email"
                                        value={memberForm.email}
                                        onChange={e => { setMemberForm({ ...memberForm, email: e.target.value }); setFormErrors(p => ({ ...p, email: '' })); }}
                                        className="w-full bg-slate-50"
                                    />
                                    {formErrors.email && <p className="text-red-500 text-xs font-bold mt-1.5">{formErrors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Password * <span className="text-slate-400 font-normal">(min 8 chars)</span></label>
                                    <Input
                                        type="password"
                                        value={memberForm.password}
                                        onChange={e => { setMemberForm({ ...memberForm, password: e.target.value }); setFormErrors(p => ({ ...p, password: '' })); }}
                                        className="w-full bg-slate-50"
                                    />
                                    {formErrors.password && <p className="text-red-500 text-xs font-bold mt-1.5">{formErrors.password}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                                        <select className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm" value={memberForm.role} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}>
                                            <option value="staff">Staff</option>
                                            <option value="field_officer">Field Officer</option>
                                            <option value="supervisor">Supervisor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Ward</label>
                                        <Input value={memberForm.ward} onChange={e => setMemberForm({ ...memberForm, ward: e.target.value })} className="w-full bg-slate-50" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Expertise / Domain</label>
                                    <select className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm" value={memberForm.specialization} onChange={e => setMemberForm({ ...memberForm, specialization: e.target.value })}>
                                        <option value="General">General</option>
                                        <option value="Roads">Roads</option>
                                        <option value="Water">Water</option>
                                        <option value="Electricity">Electricity</option>
                                        <option value="Sanitation">Sanitation</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone <span className="text-slate-400 font-normal">(10 digits)</span></label>
                                    <Input
                                        value={memberForm.phone}
                                        onChange={e => { setMemberForm({ ...memberForm, phone: e.target.value }); setFormErrors(p => ({ ...p, phone: '' })); }}
                                        className="w-full bg-slate-50"
                                    />
                                    {formErrors.phone && <p className="text-red-500 text-xs font-bold mt-1.5">{formErrors.phone}</p>}
                                </div>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.2)] mt-4">Add Member</Button>
                            </form>
                        ) : (
                            <form onSubmit={handleCreateTeam} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Team Name *</label>
                                    <Input value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} required className="w-full bg-slate-50" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Supervisor *</label>
                                    <select className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm" value={teamForm.supervisor_id} onChange={e => setTeamForm({ ...teamForm, supervisor_id: e.target.value })} required>
                                        <option value="">Select Supervisor</option>
                                        {getSupervisorOptions().map(s => <option key={s._id} value={s._id}>{s.username}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Specialization</label>
                                    <select className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm" value={teamForm.specialization} onChange={e => setTeamForm({ ...teamForm, specialization: e.target.value })}>
                                        <option value="General">General</option>
                                        <option value="Roads">Roads</option>
                                        <option value="Water">Water</option>
                                        <option value="Electricity">Electricity</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Assign Members</label>
                                    <div className="border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 bg-slate-50 custom-scrollbar shadow-inner">
                                        {members.filter(m => m.role === 'staff' || m.role === 'field_officer').map(member => (
                                            <label key={member._id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 cursor-pointer hover:border-blue-300 transition-colors shadow-sm">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
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
                                                    <div className="font-bold text-sm text-slate-900">{member.username}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{member.specialization || 'General'}{member.role !== 'field_officer' && member.ward ? ` • ${member.ward}` : ''}</div>
                                                </div>
                                            </label>
                                        ))}
                                        {members.filter(m => m.role === 'staff' || m.role === 'field_officer').length === 0 && (
                                            <div className="text-center text-slate-400 font-medium text-sm py-6">No available staff members.</div>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-3 text-right">{teamForm.members.length} members selected</p>
                                </div>

                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.2)] mt-2">Create Team</Button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* VIEW MEMBER PROFILE MODAL */}
            {viewMember && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-0 relative overflow-hidden shadow-2xl border border-slate-100 animate-fade-in">
                        <button onClick={() => setViewMember(null)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 bg-white/80 backdrop-blur w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10 shadow-sm"><X size={16} /></button>

                        {/* Header Banner */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-10 text-center pt-12 border-b border-slate-100 relative">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                            <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-3xl font-extrabold text-blue-600 mb-4 shadow-lg border border-slate-100 relative z-10">
                                {viewMember.username.substring(0, 2).toUpperCase()}
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight relative z-10">{viewMember.username}</h2>
                            <span className="bg-white border border-blue-100 text-blue-700 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm relative z-10 inline-block">
                                {viewMember.role.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Details */}
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4 text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm shrink-0"><Mail size={18} /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email</p>
                                    <p className="font-bold text-sm text-slate-900">{viewMember.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm shrink-0"><Phone size={18} /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone</p>
                                    <p className="font-bold text-sm text-slate-900">{viewMember.phone || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm shrink-0"><MapPin size={18} /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Assigned Ward</p>
                                    <p className="font-bold text-sm text-slate-900">{viewMember.ward || 'Central HQ'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shadow-sm shrink-0"><Shield size={18} /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Expertise</p>
                                    <p className="font-extrabold text-sm text-blue-600">{viewMember.specialization || 'General'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 text-center">
                            {viewMember.is_active === false ? (
                                <span className="text-xs text-red-600 font-bold flex items-center justify-center gap-2 bg-red-50 border border-red-100 py-2 rounded-xl shadow-sm uppercase tracking-widest">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    Inactive Account
                                </span>
                            ) : (
                                <span className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-100 py-2 rounded-xl shadow-sm uppercase tracking-widest">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
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
