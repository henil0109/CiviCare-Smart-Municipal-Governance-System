import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { KeyRound, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Password strength
    const checks = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };
    const passScore = Object.values(checks).filter(Boolean).length;
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passScore];
    const strengthColor = ['', 'text-red-500', 'text-amber-500', 'text-blue-500', 'text-emerald-600'][passScore];
    const barColor = ['', 'bg-red-500', 'bg-amber-400', 'bg-blue-500', 'bg-emerald-500'][passScore];

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!checks.length || !checks.upper || !checks.number || !checks.special) {
            setError('Password does not meet all requirements.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/auth/reset-password', { token, password });
            setSuccess(true);
            // Auto redirect after 3 seconds
            setTimeout(() => navigate('/login'), 3000);
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
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-blue-100 shadow-sm">
                        <KeyRound className="text-blue-600" size={32} />
                    </div>

                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <ShieldCheck className="text-emerald-500 mx-auto mb-4" size={56} />
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">Password Reset!</h2>
                            <p className="text-slate-500 mb-2 font-medium">Your password has been updated successfully.</p>
                            <p className="text-slate-400 text-sm mb-6">Redirecting you to login in a moment…</p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)]"
                            >
                                Go to Login
                            </Link>
                        </motion.div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Set New Password</h2>
                                <p className="text-slate-500 text-sm">Choose a strong password for your account.</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 font-medium">
                                    <AlertCircle size={18} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                            placeholder="Min. 8 characters"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 pr-10 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    {/* Strength Meter */}
                                    {password && (
                                        <div className="mt-3">
                                            <div className="flex gap-1 h-1.5 mb-2">
                                                {[...Array(4)].map((_, i) => (
                                                    <div key={i} className={`h-full flex-1 rounded-full transition-all duration-300 ${i < passScore ? barColor : 'bg-slate-200'}`} />
                                                ))}
                                            </div>
                                            <p className={`text-xs font-bold mb-2 ${strengthColor}`}>{strengthLabel}</p>
                                            <ul className="space-y-1">
                                                {[
                                                    { label: 'At least 8 characters', met: checks.length },
                                                    { label: 'One uppercase letter (A–Z)', met: checks.upper },
                                                    { label: 'One number (0–9)', met: checks.number },
                                                    { label: 'One special character (!@#$…)', met: checks.special },
                                                ].map(req => (
                                                    <li key={req.label} className={`flex items-center gap-1.5 text-xs font-medium ${req.met ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${req.met ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                            {req.met ? '✓' : '·'}
                                                        </span>
                                                        {req.label}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                            placeholder="Re-enter your password"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 pr-10 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {confirmPassword && (
                                        <p className={`text-xs mt-2 font-bold ${password === confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <><CheckCircle size={18} /> Reset Password</>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-sm font-bold transition-colors">
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

export default ResetPassword;
