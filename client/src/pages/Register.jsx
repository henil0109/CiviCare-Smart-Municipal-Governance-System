import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Activity, MapPin, Fingerprint, Mail, User } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'citizen',
        phone: '',
        address: '',
        id_number: '' // New Field
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passScore, setPassScore] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false); // New state for success view

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });

        if (name === 'password') {
            let score = 0;
            if (value.length >= 8) score++;
            if (/[A-Z]/.test(value)) score++;
            if (/[0-9]/.test(value)) score++;
            if (/[^A-Za-z0-9]/.test(value)) score++;
            setPassScore(score);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = "Username required";
        if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = "Invalid email";

        // Password rules
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = "Must include at least one uppercase letter";
        } else if (!/[0-9]/.test(formData.password)) {
            newErrors.password = "Must include at least one number";
        } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
            newErrors.password = "Must include at least one special character";
        }

        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        if (!formData.id_number.trim()) newErrors.id_number = "ID Number is required";
        if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone must be 10 digits";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        if (!validate()) return;

        setLoading(true);
        try {
            await axios.post('/api/auth/register', formData);
            setIsRegistered(true); // Show success view
        } catch (err) {
            setServerError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    // SUCCESS VIEW
    if (isRegistered) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-outfit">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100"
                >
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
                        <Mail className="text-blue-600" size={40} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Check your Email</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed text-lg">
                        We've sent a verification link to <strong className="text-slate-800">{formData.email}</strong>.<br />
                        Please verify your account to access the dashboard.
                    </p>
                    <div className="p-4 bg-blue-50 rounded-xl mb-6 text-sm text-blue-700 border border-blue-100">
                        <span className="font-semibold">Didn't receive it?</span> Check your spam/junk folder. The email may take a minute or two to arrive.
                    </div>
                    <Link to="/login">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-12 shadow-[0_8px_20px_rgba(37,99,235,0.2)]">Return to Login</Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-outfit py-10">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-slate-100 flex flex-col md:flex-row relative z-10"
            >
                {/* Visual Side */}
                <div className="hidden md:flex w-2/5 p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex-col justify-between relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2574&auto=format&fit=crop')] mix-blend-overlay opacity-20 bg-cover bg-center" />

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl mb-8 shadow-inner border border-white/30 shadow-lg">
                            🏛️
                        </div>
                        <h2 className="text-4xl font-extrabold mb-6 leading-tight tracking-tight">Empower Your City</h2>
                        <p className="text-blue-100 text-lg leading-relaxed font-light">
                            Join thousands of citizens making a difference. Report issues, track progress, and build a better community together.
                        </p>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 transform transition hover:scale-105 shadow-sm">
                            <div className="flex-shrink-0 w-10 h-10 bg-emerald-400/20 rounded-full flex items-center justify-center">
                                <ShieldCheck className="text-emerald-300" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold">Secure & Private</h3>
                                <p className="text-xs text-blue-100">Identity Verified Registration</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="w-full md:w-3/5 p-8 md:p-12 bg-white">
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
                        <p className="text-slate-500 mt-2 text-lg">Enter your details to register as a citizen</p>
                    </div>

                    {serverError && (
                        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-200 font-medium">
                            <AlertCircle size={18} />
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="relative">
                                <User className="absolute left-4 top-10 text-slate-400" size={18} />
                                <Input label="Username" name="username" value={formData.username} onChange={handleChange} error={errors.username} className="pl-11 bg-white border-slate-200 focus:bg-slate-50 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl" labelClassName="text-slate-700 font-semibold mb-1" />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-4 top-10 text-slate-400" size={18} />
                                <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} className="pl-11 bg-white border-slate-200 focus:bg-slate-50 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl" labelClassName="text-slate-700 font-semibold mb-1" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="relative">
                                <Input label="Password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} error={errors.password} className="pr-10 bg-white border-slate-200 focus:bg-slate-50 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl" labelClassName="text-slate-700 font-semibold mb-1" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-slate-400 hover:text-blue-600 transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>

                                {/* Strength Meter */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 h-1.5 mb-1.5">
                                            {[...Array(4)].map((_, i) => (
                                                <div key={i} className={`h-full flex-1 rounded-full transition-all duration-300 ${i < passScore
                                                    ? passScore === 1 ? 'bg-red-500'
                                                        : passScore === 2 ? 'bg-amber-400'
                                                            : passScore === 3 ? 'bg-blue-500'
                                                                : 'bg-emerald-500'
                                                    : 'bg-slate-200'
                                                    }`} />
                                            ))}
                                        </div>
                                        <p className={`text-xs font-bold ${passScore === 1 ? 'text-red-500' :
                                            passScore === 2 ? 'text-amber-500' :
                                                passScore === 3 ? 'text-blue-500' :
                                                    passScore === 4 ? 'text-emerald-600' : 'text-slate-400'
                                            }`}>
                                            {passScore === 0 ? '' : passScore === 1 ? 'Weak' : passScore === 2 ? 'Fair' : passScore === 3 ? 'Good' : 'Strong'}
                                        </p>

                                        {/* Requirements Checklist */}
                                        <ul className="mt-2 space-y-1">
                                            {[
                                                { label: 'At least 8 characters', met: formData.password.length >= 8 },
                                                { label: 'One uppercase letter (A–Z)', met: /[A-Z]/.test(formData.password) },
                                                { label: 'One number (0–9)', met: /[0-9]/.test(formData.password) },
                                                { label: 'One special character (!@#$…)', met: /[^A-Za-z0-9]/.test(formData.password) },
                                            ].map(req => (
                                                <li key={req.label} className={`flex items-center gap-1.5 text-xs font-medium ${req.met ? 'text-emerald-600' : 'text-slate-500'
                                                    }`}>
                                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${req.met ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                                        }`}>{req.met ? '✓' : '·'}</span>
                                                    {req.label}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <Input label="Confirm Password" name="confirmPassword" type={showConfirm ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} className="pr-10 bg-white border-slate-200 focus:bg-slate-50 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl" labelClassName="text-slate-700 font-semibold mb-1" />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-10 text-slate-400 hover:text-blue-600 transition-colors">
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                {/* Confirm match indicator */}
                                {formData.confirmPassword && (
                                    <p className={`text-xs mt-2 font-bold ${formData.password === formData.confirmPassword ? 'text-emerald-600' : 'text-red-500'
                                        }`}>
                                        {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ID Number Field */}
                        <div className="relative">
                            <Fingerprint className="absolute left-4 top-10 text-slate-400" size={18} />
                            <Input
                                label="Aadhaar / Voter ID Number"
                                name="id_number"
                                value={formData.id_number}
                                onChange={handleChange}
                                error={errors.id_number}
                                placeholder="XXXX-XXXX-XXXX"
                                className="pl-11 bg-white border-slate-200 focus:bg-slate-50 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl"
                                labelClassName="text-slate-700 font-semibold mb-1"
                            />
                        </div>

                        <div className="grid md:grid-cols-1 gap-5">
                            <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} className="bg-white border-slate-200 focus:bg-slate-50 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl" labelClassName="text-slate-700 font-semibold mb-1" />
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                            <div className="border border-slate-200 rounded-xl relative overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
                                <LocationPicker
                                    initialAddress={formData.address}
                                    onAddressSelect={(address) => setFormData({ ...formData, address: address })}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_20px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 transition-all bg-blue-600 hover:bg-blue-700 rounded-xl border-none mt-4">
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : <span className="flex items-center justify-center gap-2">Register & Verify <ArrowRight size={18} /></span>}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 font-medium">
                        Already have an account? <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">Log in here</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
