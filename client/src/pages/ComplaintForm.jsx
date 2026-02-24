import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Camera, FileText, Upload, CheckCircle, AlertCircle,
    Droplets, Lightbulb, Truck, Hammer, ShieldAlert, ChevronRight, ChevronLeft, Send,
    Waves, Flame, Trees, Building2, Volume2, TrafficCone, Wind, Wrench
} from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

const CATEGORIES = [
    { id: 'Roads & Infrastructure', icon: Hammer, label: 'Roads & Infra', color: 'orange' },
    { id: 'Water Supply & Plumbing', icon: Droplets, label: 'Water Supply', color: 'blue' },
    { id: 'Electricity & Street Lighting', icon: Lightbulb, label: 'Electricity', color: 'yellow' },
    { id: 'Sanitation & Waste Management', icon: Truck, label: 'Sanitation', color: 'green' },
    { id: 'Drainage & Sewage', icon: Waves, label: 'Drainage & Sewage', color: 'cyan' },
    { id: 'Parks & Public Spaces', icon: Trees, label: 'Parks & Spaces', color: 'emerald' },
    { id: 'Building & Construction', icon: Building2, label: 'Construction', color: 'stone' },
    { id: 'Noise & Environmental', icon: Volume2, label: 'Noise & Pollution', color: 'purple' },
    { id: 'Fire Safety & Emergency', icon: Flame, label: 'Fire & Emergency', color: 'red' },
    { id: 'Traffic & Road Safety', icon: TrafficCone, label: 'Traffic Safety', color: 'amber' },
    { id: 'Public Safety', icon: ShieldAlert, label: 'Public Safety', color: 'rose' },
    { id: 'Other', icon: Wrench, label: 'Other', color: 'gray' },
];

const ComplaintForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isEmergency = location.state?.isEmergency || false;

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [detectedCity, setDetectedCity] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);

    // Form State - phone auto-filled directly from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [formData, setFormData] = useState({
        title: isEmergency ? 'EMERGENCY: ' : '',
        category: isEmergency ? 'Public Safety' : '',
        location_address: '',
        detail_address: '',
        description: isEmergency ? 'URGENT: Requesting immediate assistance for ' : '',
        contact_phone: storedUser.phone || ''
    });

    const [files, setFiles] = useState({ proof: null, photo: null });
    const [previews, setPreviews] = useState({ proof: null, photo: null });

    // Auto-fill phone from user profile & auto-detect city
    useEffect(() => {
        // phone already initialized in useState, but keep this as fallback
        if (storedUser.phone && !formData.contact_phone) {
            setFormData(prev => ({ ...prev, contact_phone: storedUser.phone }));
        }

        // Geolocation → Reverse geocode to get city
        if (navigator.geolocation) {
            setLocationLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    try {
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                            { headers: { 'Accept-Language': 'en' } }
                        );
                        const data = await res.json();
                        const addr = data.address || {};
                        const city = addr.city || addr.town || addr.village || addr.county || '';
                        const state = addr.state || '';
                        const fullAddress = [
                            addr.suburb || addr.neighbourhood || '',
                            addr.road || '',
                            city,
                            state
                        ].filter(Boolean).join(', ');
                        setDetectedCity(city ? `${city}${state ? ', ' + state : ''}` : '');
                        setFormData(prev => ({
                            ...prev,
                            location_address: prev.location_address || fullAddress,
                            latitude,
                            longitude
                        }));
                    } catch (_) {
                        // silent fail
                    } finally {
                        setLocationLoading(false);
                    }
                },
                () => setLocationLoading(false)
            );
        }
    }, []);

    // Handlers
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCategorySelect = (id) => setFormData({ ...formData, category: id });

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [type]: file }));
            setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
        }
    };



    const handleSubmit = async () => {
        if (formData.contact_phone && !/^\d{10}$/.test(formData.contact_phone)) {
            alert("Contact phone must be 10 digits if provided.");
            return;
        }
        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (files.proof) data.append('proof', files.proof);
        if (files.photo) data.append('photo', files.photo);

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/complaints', data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (err) {
            alert("Submission failed. Please try again.");
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    // Validations
    const isStep1Valid = formData.title && formData.category;
    const isStep2Valid = formData.location_address && formData.detail_address;
    const isStep3Valid = formData.description && files.photo; // photo always required

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden selection:bg-blue-500 selection:text-white">

            {/* Background — matches Home/Services theme exactly */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-slate-950" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/10 to-transparent" />
                {/* Animated glow orbs */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px]"
                />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex-1 flex items-center justify-center p-4 py-24">
                {success ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center max-w-lg shadow-2xl"
                    >
                        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400 ring-2 ring-emerald-500/30">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-4xl font-extrabold text-white mb-4">Complaint Logged!</h2>
                        <p className="text-slate-400 mb-8 text-lg">Your report has been received and is pending official scrutiny. XP will be credited upon verification.</p>
                        <div className="bg-blue-500/10 text-blue-300 px-6 py-3 rounded-xl font-bold text-lg inline-block shadow-sm border border-blue-500/20">
                            Status: Pending Scrutiny
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-5xl w-full bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10 min-h-[600px]"
                    >
                        {/* Sidebar / Progress */}
                        <div className="w-full md:w-80 bg-slate-900 text-white p-10 flex flex-col justify-between relative overflow-hidden">
                            {/* Decorative Circle */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md border border-white/10">
                                        <ShieldAlert className="text-blue-400" size={24} />
                                    </div>
                                    <span className="font-extrabold tracking-widest text-lg">CIVIC HERO</span>
                                </div>
                                <h2 className="text-3xl font-bold mb-4 leading-tight">File a Report</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">Help us improve the city by reporting infrastructure issues accurately.</p>
                            </div>

                            <div className="space-y-8 my-8 relative z-10">
                                {/* Vertical Line */}
                                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-white/10 -z-10"></div>

                                {[
                                    { num: 1, title: "Category", active: step >= 1 },
                                    { num: 2, title: "Location", active: step >= 2 },
                                    { num: 3, title: "Evidence", active: step >= 3 },
                                    { num: 4, title: "Review", active: step >= 4 }
                                ].map((s) => (
                                    <div key={s.num} className="flex items-center gap-5 group">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-lg ${s.active
                                            ? 'bg-blue-600 text-white ring-4 ring-blue-600/20 scale-110'
                                            : 'bg-slate-800 text-slate-400 border border-white/5'
                                            }`}>
                                            {s.active && step > s.num ? <CheckCircle size={16} /> : s.num}
                                        </div>
                                        <span className={`text-base font-medium transition-colors ${s.active ? 'text-white' : 'text-slate-400'
                                            }`}>
                                            {s.title}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 relative z-10 backdrop-blur-md">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Potential Reward</p>
                                <div className="flex items-center gap-3 text-yellow-400 font-black text-2xl">
                                    <span>🏆</span> 50 XP
                                </div>
                            </div>
                        </div>

                        {/* Form Area — dark to match site */}
                        <div className="flex-1 p-8 md:p-12 relative overflow-y-auto custom-scrollbar bg-slate-950/60">
                            <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">
                                {step === 1 && "What's the situation?"}
                                {step === 2 && "Where is it happening?"}
                                {step === 3 && "Evidence & Details"}
                                {step === 4 && "Ready to Submit?"}
                            </h3>

                            <AnimatePresence mode='wait'>
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -20, opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Subject Title</label>
                                            <input
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                placeholder="e.g., Deep pothole on Main Street"
                                                className="w-full p-4 bg-slate-800/80 border border-white/10 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-white placeholder-slate-500 transition-all outline-none font-medium text-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-3 ml-1">Select Category</label>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                                {CATEGORIES.map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => handleCategorySelect(cat.id)}
                                                        className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${formData.category === cat.id
                                                            ? `border-${cat.color}-500 bg-${cat.color}-500/10 text-${cat.color}-400 ring-2 ring-${cat.color}-500/20`
                                                            : 'bg-slate-800/60 border-white/10 hover:border-blue-500/50 text-slate-400 hover:bg-slate-800'
                                                            }`}
                                                    >
                                                        <cat.icon size={28} className={formData.category === cat.id ? `text-${cat.color}-400` : 'text-slate-400'} />
                                                        <span className="text-xs font-bold uppercase tracking-wider">{cat.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -20, opacity: 0 }}
                                        className="space-y-6"
                                    >


                                        {/* Detected City Banner */}
                                        {locationLoading ? (
                                            <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-800/60 px-4 py-3 rounded-xl border border-white/10">
                                                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin shrink-0" />
                                                Detecting your city...
                                            </div>
                                        ) : detectedCity ? (
                                            <div className="flex items-center gap-2 text-emerald-300 text-sm bg-emerald-900/20 px-4 py-3 rounded-xl border border-emerald-500/30">
                                                <MapPin size={16} className="shrink-0" />
                                                <span>Detected City: <strong>{detectedCity}</strong></span>
                                            </div>
                                        ) : null}

                                        <div>
                                            <div className="mb-2 relative z-50">
                                                <label className="text-sm font-semibold text-slate-300 mb-2 block">Pin Location on Map</label>
                                                <LocationPicker
                                                    initialAddress={formData.location_address}
                                                    onAddressSelect={(address, lat, lng) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            location_address: address,
                                                            latitude: lat,
                                                            longitude: lng
                                                        }));
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Detailed Address <span className="text-red-400">*</span></label>
                                            <textarea
                                                name="detail_address"
                                                rows="3"
                                                value={formData.detail_address}
                                                onChange={handleChange}
                                                placeholder={`Area / Street / Locality / Society / Landmark\ne.g., Near Green Park, MG Road, Sunrise Society, Opp. City Mall`}
                                                className={`w-full p-4 bg-slate-800/80 border rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-white placeholder-slate-500 outline-none resize-none font-medium ${!formData.detail_address ? 'border-orange-500/60' : 'border-white/10'}`}
                                            />
                                            <p className="text-xs text-slate-400 mt-1.5 ml-1 font-medium">Required — Enter your area, street, society or nearby landmark so authorities can locate the exact spot.</p>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -20, opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Detailed Description</label>
                                            <textarea
                                                name="description"
                                                rows="4"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Explain the severity of the issue, hazards, etc..."
                                                className="w-full p-4 bg-slate-800/80 border border-white/10 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-white placeholder-slate-500 outline-none resize-none font-medium"
                                            ></textarea>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className={`border-2 border-dashed rounded-2xl p-6 text-center hover:bg-slate-800 transition-colors relative group ${!files.photo ? 'border-orange-500/50 bg-orange-900/10' : 'border-emerald-500/50 bg-emerald-900/10'}`}>
                                                <input type="file" onChange={(e) => handleFileChange(e, 'photo')} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                {previews.photo ? (
                                                    <img src={previews.photo} alt="Preview" className="w-full h-32 object-cover rounded-xl shadow-lg" />
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-500/20 transition-colors">
                                                            <Camera size={24} className="text-orange-400" />
                                                        </div>
                                                        <p className="text-xs font-bold text-orange-300">Upload Photo <span className="text-red-400">*</span></p>
                                                        <p className="text-[10px] text-slate-500 mt-1">Required</p>
                                                    </>
                                                )}
                                            </div>
                                            <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:bg-slate-800 transition-colors relative group">
                                                <input type="file" onChange={(e) => handleFileChange(e, 'proof')} accept=".pdf,image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                {previews.proof ? (
                                                    <div className="h-32 flex flex-col items-center justify-center bg-blue-900/20 rounded-xl text-blue-400 font-bold text-xs p-4 border border-blue-500/20">
                                                        <FileText size={32} className="mb-2" />
                                                        <span>{files.proof.name}</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-900/20 transition-colors">
                                                            <Upload size={24} className="text-slate-500 group-hover:text-blue-400" />
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-500 group-hover:text-slate-300">Supporting Doc</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Contact Phone</label>
                                            <input
                                                name="contact_phone"
                                                value={formData.contact_phone}
                                                onChange={handleChange}
                                                placeholder="10-digit mobile number"
                                                maxLength={10}
                                                className="w-full p-4 bg-slate-800/80 border border-white/10 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-white placeholder-slate-500 outline-none font-medium"
                                            />
                                            <p className="text-xs text-slate-400 mt-1.5 ml-1 font-medium">Auto-filled from your profile — authorities will use this to contact you.</p>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div
                                        key="step4"
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -20, opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-slate-800/60 border border-white/10 p-6 rounded-2xl space-y-4 text-sm">
                                            <div className="flex justify-between border-b border-white/5 pb-3">
                                                <span className="text-slate-400">Issue</span>
                                                <span className="font-bold text-white">{formData.title}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-3">
                                                <span className="text-slate-400">Category</span>
                                                <span className="font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{formData.category}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-3">
                                                <span className="text-slate-400">Location</span>
                                                <span className="font-bold text-slate-200 text-right max-w-[200px]">{formData.location_address}</span>
                                            </div>
                                            {formData.detail_address && (
                                                <div className="flex justify-between border-b border-white/5 pb-3">
                                                    <span className="text-slate-400">Detail Address</span>
                                                    <span className="font-bold text-slate-200 text-right max-w-[200px]">{formData.detail_address}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between border-b border-white/5 pb-3">
                                                <span className="text-slate-400">Contact</span>
                                                <span className="font-bold text-slate-200">{formData.contact_phone || 'Not provided'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Evidence</span>
                                                <span className="font-bold text-emerald-400">{files.photo ? 'Photo Attached ✓' : 'No Photo'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 bg-blue-500/10 p-4 rounded-xl text-blue-300 text-sm border border-blue-500/20">
                                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                            <p>By submitting this report, you certify that the information provided is true. False reporting may lead to account suspension.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation Buttons */}
                            <div className="absolute bottom-8 left-8 right-8 flex justify-between pt-4 border-t border-white/10">
                                {step > 1 ? (
                                    <button onClick={prevStep} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                                        <ChevronLeft size={20} /> Back
                                    </button>
                                ) : <div></div>}

                                {step < 4 ? (
                                    <button
                                        onClick={nextStep}
                                        disabled={
                                            (step === 1 && !isStep1Valid) ||
                                            (step === 2 && !isStep2Valid) ||
                                            (step === 3 && !isStep3Valid)
                                        }
                                        className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-blue-900/50 border border-blue-500/50"
                                    >
                                        Next <ChevronRight size={20} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="px-8 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 transition-all shadow-xl shadow-emerald-200"
                                    >
                                        {loading ? <span className="animate-spin">⌛</span> : <Send size={20} />}
                                        Submit Report
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div >
    );
};

export default ComplaintForm;
