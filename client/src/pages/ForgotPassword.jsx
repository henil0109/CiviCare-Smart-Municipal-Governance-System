import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Send } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email.match(/^\S+@\S+\.\S+$/)) {
            setError('Please enter a valid email address.');
            return;
        }
        setLoading(true);
        try {
            await axios.post('/api/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-outfit">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 p-10">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-blue-100 shadow-sm">
                        <Mail className="text-blue-600" size={32} />
                    </div>

                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <CheckCircle className="text-emerald-500 mx-auto mb-4" size={48} />
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">Check Your Email</h2>
                            <p className="text-slate-500 mb-2">
                                If <span className="text-blue-600 font-bold">{email}</span> is registered, we've sent a password reset link.
                            </p>
                            <p className="text-slate-400 text-sm mb-8">The link expires in 1 hour. Check your spam folder if you don't see it.</p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold transition-colors"
                            >
                                <ArrowLeft size={18} /> Back to Login
                            </Link>
                        </motion.div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Forgot Password?</h2>
                                <p className="text-slate-500 text-sm">Enter your email address and we'll send you a reset link.</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 font-medium">
                                    <AlertCircle size={18} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                            placeholder="name@example.com"
                                            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <><Send size={18} /> Send Reset Link</>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 font-bold transition-colors"
                                >
                                    <ArrowLeft size={16} /> Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
