import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Activity, MapPin, Fingerprint, Mail } from 'lucide-react';
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
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl"
                >
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="text-blue-600" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Check your Email</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        We've sent a verification link to <strong>{formData.email}</strong>.<br />
                        Please verify your account to access the dashboard.
                    </p>
                    <div className="p-4 bg-gray-50 rounded-xl mb-6 text-sm text-gray-500 border border-gray-100">
                        <span className="font-semibold text-gray-700">Developer Note:</span> Check the Server Console/Terminal for the simulated email link.
                    </div>
                    <Link to="/login">
                        <Button className="w-full">Return to Login</Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 flex flex-col md:flex-row relative z-10"
            >
                {/* Visual Side */}
                <div className="hidden md:flex w-2/5 p-12 bg-gradient-to-br from-blue-600/80 to-purple-700/80 text-white flex-col justify-between relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2574&auto=format&fit=crop')] mix-blend-overlay opacity-20 bg-cover bg-center" />

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl mb-8 shadow-inner border border-white/30">
                            🏙️
                        </div>
                        <h2 className="text-4xl font-bold mb-6 leading-tight">Empower Your City</h2>
                        <p className="text-blue-100 text-lg leading-relaxed">
                            Join thousands of citizens making a difference. Report issues, track progress, and build a better community together.
                        </p>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 transform transition hover:scale-105">
                            <div className="flex-shrink-0 w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center">
                                <ShieldCheck className="text-green-300" size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold">Secure & Private</h3>
                                <p className="text-xs text-blue-100">Identity Verified Registration</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="w-full md:w-3/5 p-8 md:p-12 bg-white/95">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                        <p className="text-gray-500 mt-2">Enter your details to register as a citizen</p>
                    </div>

                    {serverError && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100">
                            <AlertCircle size={18} />
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-5">
                            <Input label="Username" name="username" value={formData.username} onChange={handleChange} error={errors.username} className="bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400" />
                            <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} className="bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="relative">
                                <Input label="Password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} error={errors.password} className="pr-10 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>

                                {/* Strength Meter */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 h-1.5 mb-1.5">
                                            {[...Array(4)].map((_, i) => (
                                                <div key={i} className={`h-full flex-1 rounded-full transition-all duration-300 ${i < passScore
                                                        ? passScore === 1 ? 'bg-red-500'
                                                            : passScore === 2 ? 'bg-yellow-400'
                                                                : passScore === 3 ? 'bg-blue-500'
                                                                    : 'bg-green-500'
                                                        : 'bg-gray-200'
                                                    }`} />
                                            ))}
                                        </div>
                                        <p className={`text-xs font-semibold ${passScore === 1 ? 'text-red-500' :
                                                passScore === 2 ? 'text-yellow-500' :
                                                    passScore === 3 ? 'text-blue-500' :
                                                        passScore === 4 ? 'text-green-600' : 'text-gray-400'
                                            }`}>
                                            {passScore === 0 ? '' : passScore === 1 ? 'Weak' : passScore === 2 ? 'Fair' : passScore === 3 ? 'Good' : 'Strong'}
                                        </p>

                                        {/* Requirements Checklist */}
                                        <ul className="mt-1.5 space-y-0.5">
                                            {[
                                                { label: 'At least 8 characters', met: formData.password.length >= 8 },
                                                { label: 'One uppercase letter (A–Z)', met: /[A-Z]/.test(formData.password) },
                                                { label: 'One number (0–9)', met: /[0-9]/.test(formData.password) },
                                                { label: 'One special character (!@#$…)', met: /[^A-Za-z0-9]/.test(formData.password) },
                                            ].map(req => (
                                                <li key={req.label} className={`flex items-center gap-1.5 text-xs ${req.met ? 'text-green-600' : 'text-gray-400'
                                                    }`}>
                                                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${req.met ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                                        }`}>{req.met ? '✓' : '·'}</span>
                                                    {req.label}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <Input label="Confirm Password" name="confirmPassword" type={showConfirm ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} className="pr-10 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400" />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                {/* Confirm match indicator */}
                                {formData.confirmPassword && (
                                    <p className={`text-xs mt-1.5 font-medium ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-500'
                                        }`}>
                                        {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ID Number Field */}
                        <div className="relative">
                            <Fingerprint className="absolute left-3 top-9 text-gray-400" size={18} />
                            <Input
                                label="Aadhaar / Voter ID Number"
                                name="id_number"
                                value={formData.id_number}
                                onChange={handleChange}
                                error={errors.id_number}
                                placeholder="XXXX-XXXX-XXXX"
                                className="pl-10 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400"
                            />
                        </div>

                        <div className="grid md:grid-cols-1 gap-5">
                            <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} className="bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400" />
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                            <div className="border border-gray-300 rounded-xl relative">
                                <LocationPicker
                                    initialAddress={formData.address}
                                    onAddressSelect={(address) => setFormData({ ...formData, address: address })}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full h-12 text-lg shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 border-none">
                            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : <span className="flex items-center justify-center gap-2">Register & Verify <ArrowRight size={20} /></span>}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-gray-600">
                        Already have an account? <Link to="/login" className="font-bold text-blue-600 hover:underline">Log in here</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
