import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ArrowRight, Mail, Lock, Eye, EyeOff, AlertCircle, LayoutDashboard, Shield, CheckCircle } from 'lucide-react';

const Login = ({ setUser }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // If already logged in, redirect based on role
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            if (u.role === 'admin') navigate('/admin/dashboard');
            else if (u.role === 'supervisor') navigate('/supervisor/dashboard');
            else navigate('/dashboard');
        } else {
            // If on login page and not logged in, ensure state is clear
            localStorage.removeItem('user'); // Clear potential stale data
            if (setUser) setUser(null);
        }
    }, [navigate, setUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.password) newErrors.password = "Password is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setResendSuccess('');
        if (!validate()) return;

        setLoading(true);
        try {
            const res = await axios.post('/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            if (res.data.user.role === 'admin') navigate('/admin/dashboard');
            else if (res.data.user.role === 'supervisor') navigate('/supervisor/dashboard');
            else navigate('/dashboard');
        } catch (err) {
            setServerError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!formData.email) {
            setServerError('Please enter your email first.');
            return;
        }
        setResendLoading(true);
        try {
            await axios.post('/api/auth/resend-verification', { email: formData.email });
            setResendSuccess('Verification email resent! Please check your inbox.');
            setServerError('');
        } catch (err) {
            setServerError(err.response?.data?.message || 'Failed to resend email.');
            setResendSuccess('');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl bg-slate-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col md:flex-row relative z-10"
            >
                {/* Visual Side */}
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-900 to-slate-900 relative overflow-hidden items-center justify-center p-12">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2613&auto=format&fit=crop')] mix-blend-overlay opacity-30 bg-cover bg-center"></div>

                    <div className="relative z-10 text-white max-w-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="w-16 h-16 bg-blue-500/30 rounded-2xl flex items-center justify-center backdrop-blur-md mb-8 ring-1 ring-white/30">
                                <LayoutDashboard size={32} className="text-white" />
                            </div>
                            <h1 className="text-4xl font-bold mb-6">Welcome Back</h1>
                            <p className="text-blue-200 text-lg leading-relaxed mb-8">
                                Sign in to access your dashboard, track complaints, and manage your city services efficiently.
                            </p>

                            <div className="flex items-center gap-3 text-sm text-blue-300 font-medium">
                                <Shield size={16} />
                                <span>Secure citizen portal</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="w-full md:w-1/2 p-10 md:p-14 bg-slate-900/80 border-l border-white/5">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                        <p className="text-slate-400">Welcome back! Please enter your details.</p>
                    </div>

                    {(serverError || resendSuccess) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className={`px-4 py-3 rounded-xl mb-6 text-sm flex flex-col gap-2 border ${resendSuccess
                                ? 'bg-green-50 text-green-600 border-green-100'
                                : 'bg-red-50 text-red-600 border-red-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {resendSuccess ? <CheckCircle size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
                                {resendSuccess ? resendSuccess : serverError}
                            </div>

                            {!resendSuccess && serverError && serverError.includes('verify') && (
                                <button
                                    onClick={handleResendVerification}
                                    type="button"
                                    disabled={resendLoading}
                                    className="text-xs font-semibold underline ml-6 text-left hover:text-red-800 disabled:opacity-50"
                                >
                                    {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                                </button>
                            )}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <Mail className="absolute left-3 top-9 text-slate-500" size={18} />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                className="pl-10 bg-slate-800 border-white/10 focus:bg-slate-900 text-white placeholder-slate-500 transition-all"
                                labelClassName="text-slate-300"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-9 text-slate-500" size={18} />
                            <Input
                                label="Password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="pl-10 pr-10 bg-slate-800 border-white/10 focus:bg-slate-900 text-white placeholder-slate-500 transition-all"
                                labelClassName="text-slate-300"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-slate-500 hover:text-slate-400 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">Forgot password?</Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all bg-gradient-to-r from-blue-600 to-indigo-600 border-none"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Sign In <ArrowRight size={20} />
                                </span>
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors hover:underline">
                            Create Account
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
