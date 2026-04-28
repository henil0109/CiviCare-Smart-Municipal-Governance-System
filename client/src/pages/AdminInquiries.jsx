import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Mail, CheckCircle, Clock, Send, X, Inbox } from 'lucide-react';

const AdminInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [filteredInquiries, setFilteredInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [filter, setFilter] = useState('All'); // All, Pending, Replied
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchInquiries();
    }, []);

    useEffect(() => {
        let result = inquiries;

        if (filter !== 'All') {
            result = result.filter(i => i.status === filter);
        }

        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(i =>
                i.subject.toLowerCase().includes(lowerSearch) ||
                i.name.toLowerCase().includes(lowerSearch) ||
                i.email.toLowerCase().includes(lowerSearch)
            );
        }

        setFilteredInquiries(result);
    }, [inquiries, filter, search]);

    const fetchInquiries = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/inquiries', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInquiries(res.data);
            setFilteredInquiries(res.data);
        } catch (error) {
            console.error("Error fetching inquiries:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!replyMessage.trim()) return;
        setSendingReply(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/admin/inquiries/${selectedInquiry._id}/reply`, {
                reply: replyMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            const updatedInquiries = inquiries.map(i =>
                i._id === selectedInquiry._id
                    ? { ...i, status: 'Replied', reply: replyMessage, replied_at: new Date().toISOString() }
                    : i
            );
            setInquiries(updatedInquiries);
            setSelectedInquiry(null); // Close modal
            setReplyMessage('');
            alert("Reply sent successfully!");
        } catch (error) {
            console.error("Failed to send reply:", error);
            alert("Failed to send reply.");
        } finally {
            setSendingReply(false);
        }
    };

    return (
        <div className="font-outfit pb-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                            <Inbox size={20} />
                        </div>
                        Inquiries & Support
                    </h1>
                    <p className="text-slate-500 font-medium mt-3 text-lg">Manage user inquiries and support requests.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-auto group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 w-full bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium text-slate-900 shadow-sm transition-all"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2.5 w-full sm:w-auto bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium text-slate-700 shadow-sm transition-all cursor-pointer"
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Replied">Replied</option>
                    </select>
                </div>
            </header>

            {loading ? (
                <div className="text-center py-24 text-slate-500 font-medium text-lg">Loading inquiries...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredInquiries.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-300">
                                <Mail size={32} />
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-900 mb-2">No Inquiries Found</h3>
                            <p className="text-slate-500 font-medium">Your inbox is currently empty.</p>
                        </div>
                    ) : (
                        filteredInquiries.map((inquiry) => (
                            <motion.div
                                key={inquiry._id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-200 transition-all cursor-pointer group"
                                onClick={() => setSelectedInquiry(inquiry)}
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                    <div>
                                        <h3 className="font-extrabold text-xl text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">{inquiry.subject}</h3>
                                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">
                                            <span className="text-slate-600">{inquiry.name}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span className="truncate max-w-[150px] sm:max-w-none text-slate-500">{inquiry.email}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span className="text-slate-500">{new Date(inquiry.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm shrink-0 ${inquiry.status === 'Replied'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                        {inquiry.status === 'Replied' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                        {inquiry.status}
                                    </div>
                                </div>
                                <p className="text-slate-600 font-medium line-clamp-2 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">{inquiry.message}</p>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Reply Modal */}
            <AnimatePresence>
                {selectedInquiry && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 z-10 shrink-0">
                                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm text-slate-400">
                                        <Mail size={14} />
                                    </div>
                                    Inquiry Details
                                </h2>
                                <button
                                    onClick={() => setSelectedInquiry(null)}
                                    className="w-10 h-10 bg-white hover:bg-red-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                                {/* Sender Info */}
                                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">From</p>
                                            <p className="font-extrabold text-slate-900 text-lg">{selectedInquiry.name}</p>
                                            <p className="text-slate-500 font-medium">{selectedInquiry.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Date Received</p>
                                            <p className="font-extrabold text-slate-900">{new Date(selectedInquiry.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Subject</p>
                                            <p className="font-extrabold text-slate-900 text-xl">{selectedInquiry.subject}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Message Body */}
                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 pl-2">Message</h3>
                                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-slate-700 whitespace-pre-wrap font-medium leading-relaxed">
                                        {selectedInquiry.message}
                                    </div>
                                </div>

                                {/* Reply Section */}
                                {selectedInquiry.status === 'Replied' ? (
                                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
                                        <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <CheckCircle size={14} /> Replied by Admin
                                        </h3>
                                        <p className="text-emerald-900 whitespace-pre-wrap font-medium">{selectedInquiry.reply}</p>
                                        {selectedInquiry.replied_at && (
                                            <p className="text-xs font-bold text-emerald-600/70 mt-4 flex items-center gap-1.5">
                                                <Send size={10} /> Sent on {new Date(selectedInquiry.replied_at).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-white">
                                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3 pl-2 flex items-center gap-2">
                                            <Send size={14} /> Admin Reply
                                        </h3>
                                        <textarea
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            rows="6"
                                            className="w-full bg-white border border-slate-200 rounded-2xl p-5 font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm resize-none"
                                            placeholder="Type your official response here..."
                                        ></textarea>
                                        <div className="mt-6 flex justify-end gap-4">
                                            <button
                                                onClick={() => setSelectedInquiry(null)}
                                                className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleReply}
                                                disabled={!replyMessage.trim() || sendingReply}
                                                className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.2)]"
                                            >
                                                {sendingReply ? 'Sending...' : <><Send size={18} /> Send Reply</>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminInquiries;
