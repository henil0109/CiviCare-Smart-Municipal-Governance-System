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
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            if (u.role === 'admin') navigate('/admin/dashboard');
            else if (u.role === 'supervisor') navigate('/supervisor/dashboard');
            else navigate('/dashboard');
        } else {
            localStorage.removeItem('user');
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-outfit">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-slate-100 flex flex-col md:flex-row relative z-10"
            >
                {/* Visual Side */}
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden items-center justify-center p-12">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2613&auto=format&fit=crop')] mix-blend-overlay opacity-20 bg-cover bg-center"></div>

                    <div className="relative z-10 text-white max-w-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-8 ring-1 ring-white/30 shadow-lg">
                                <LayoutDashboard size={32} className="text-white" />
                            </div>
                            <h1 className="text-4xl font-extrabold mb-6 tracking-tight">Welcome Back</h1>
                            <p className="text-blue-100 text-lg leading-relaxed mb-8 font-light">
                                Sign in to access your secure dashboard, track complaints, and manage city services efficiently.
                            </p>

                            <div className="flex items-center gap-3 text-sm text-blue-200 font-semibold bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                                <Shield size={16} />
                                <span>Verified Citizen Portal</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="w-full md:w-1/2 p-10 md:p-14 bg-white">
                    <div className="mb-10 text-center md:text-left">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 md:hidden mx-auto shadow-sm">
                            <LayoutDashboard size={24} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Sign In</h2>
                        <p className="text-slate-500">Welcome back! Please enter your details.</p>
                    </div>

                    {(serverError || resendSuccess) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className={`px-4 py-3 rounded-xl mb-6 text-sm flex flex-col gap-2 border ${resendSuccess
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {resendSuccess ? <CheckCircle size={18} className="shrink-0 text-emerald-600" /> : <AlertCircle size={18} className="shrink-0 text-red-600" />}
                                {resendSuccess ? resendSuccess : serverError}
                            </div>

                            {!resendSuccess && serverError && serverError.includes('verify') && (
                                <button
                                    onClick={handleResendVerification}
                                    type="button"
                                    disabled={resendLoading}
                                    className="text-xs font-bold underline ml-6 text-left hover:text-red-900 disabled:opacity-50 transition-colors"
                                >
                                    {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                                </button>
                            )}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <Mail className="absolute left-4 top-10 text-slate-400" size={18} />
                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                className="pl-11 bg-white border-slate-200 focus:bg-slate-50 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl"
                                labelClassName="text-slate-700 font-semibold mb-1"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-10 text-slate-400" size={18} />
                            <Input
                                label="Password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="pl-11 pr-11 bg-white border-slate-200 focus:bg-slate-50 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl"
                                labelClassName="text-slate-700 font-semibold mb-1"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-10 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between text-sm mt-2">
                            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none font-medium">
                                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 transition-colors" />
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 text-base font-bold shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_20px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 transition-all bg-blue-600 hover:bg-blue-700 rounded-xl border-none mt-4"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Sign In <ArrowRight size={18} />
                                </span>
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 font-medium">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                            Create Account
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
