import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Mail, CheckCircle, Clock, Send, X } from 'lucide-react';

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
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Inquiries & Support</h1>
                    <p className="text-slate-500">Manage user inquiries and support requests.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Replied">Replied</option>
                    </select>
                </div>
            </header>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Loading inquiries...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredInquiries.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                            <Mail className="mx-auto text-slate-300 mb-2" size={48} />
                            <p className="text-slate-500">No inquiries found.</p>
                        </div>
                    ) : (
                        filteredInquiries.map((inquiry) => (
                            <motion.div
                                key={inquiry._id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setSelectedInquiry(inquiry)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">{inquiry.subject}</h3>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                            <span className="font-medium text-slate-700">{inquiry.name}</span>
                                            <span>&bull;</span>
                                            <span>{inquiry.email}</span>
                                            <span>&bull;</span>
                                            <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${inquiry.status === 'Replied'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {inquiry.status === 'Replied' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                        {inquiry.status}
                                    </div>
                                </div>
                                <p className="text-slate-600 line-clamp-2">{inquiry.message}</p>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Reply Modal */}
            <AnimatePresence>
                {selectedInquiry && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-slate-800">Inquiry Details</h2>
                                <button
                                    onClick={() => setSelectedInquiry(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Sender Info */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-500">From</p>
                                            <p className="font-medium text-slate-900">{selectedInquiry.name}</p>
                                            <p className="text-slate-600">{selectedInquiry.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Date</p>
                                            <p className="font-medium text-slate-900">{new Date(selectedInquiry.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-slate-500">Subject</p>
                                            <p className="font-medium text-slate-900">{selectedInquiry.subject}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Message Body */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-2">Message</h3>
                                    <div className="bg-white border border-slate-200 p-4 rounded-xl text-slate-700 whitespace-pre-wrap">
                                        {selectedInquiry.message}
                                    </div>
                                </div>

                                {/* Reply Section */}
                                {selectedInquiry.status === 'Replied' ? (
                                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
                                        <h3 className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                                            <CheckCircle size={16} /> Replied by Admin
                                        </h3>
                                        <p className="text-green-900 whitespace-pre-wrap">{selectedInquiry.reply}</p>
                                        {selectedInquiry.replied_at && (
                                            <p className="text-xs text-green-700 mt-2">
                                                Sent on {new Date(selectedInquiry.replied_at).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-2">Reply</h3>
                                        <textarea
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            rows="6"
                                            className="w-full border border-slate-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                            placeholder="Type your reply here..."
                                        ></textarea>
                                        <div className="mt-4 flex justify-end gap-3">
                                            <button
                                                onClick={() => setSelectedInquiry(null)}
                                                className="px-6 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleReply}
                                                disabled={!replyMessage.trim() || sendingReply}
                                                className="px-6 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
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
