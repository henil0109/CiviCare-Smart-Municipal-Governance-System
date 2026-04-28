import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Camera, FileText, Upload, CheckCircle, AlertCircle,
    Droplets, Lightbulb, Truck, Hammer, ShieldAlert, ChevronRight, ChevronLeft, Send,
    Waves, Flame, Trees, Building2, Volume2, TrafficCone, Wind, Wrench, Shield
} from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

const CATEGORIES = [
    { id: 'Roads & Infrastructure', icon: Hammer, label: 'Roads & Infra', color: 'orange' },
    { id: 'Water Supply & Plumbing', icon: Droplets, label: 'Water Supply', color: 'blue' },
    { id: 'Electricity & Street Lighting', icon: Lightbulb, label: 'Electricity', color: 'amber' },
    { id: 'Sanitation & Waste Management', icon: Truck, label: 'Sanitation', color: 'emerald' },
    { id: 'Drainage & Sewage', icon: Waves, label: 'Drainage & Sewage', color: 'cyan' },
    { id: 'Parks & Public Spaces', icon: Trees, label: 'Parks & Spaces', color: 'lime' },
    { id: 'Building & Construction', icon: Building2, label: 'Construction', color: 'stone' },
    { id: 'Noise & Environmental', icon: Volume2, label: 'Noise & Pollution', color: 'purple' },
    { id: 'Fire Safety & Emergency', icon: Flame, label: 'Fire & Emergency', color: 'red' },
    { id: 'Traffic & Road Safety', icon: TrafficCone, label: 'Traffic Safety', color: 'yellow' },
    { id: 'Public Safety', icon: ShieldAlert, label: 'Public Safety', color: 'rose' },
    { id: 'Other', icon: Wrench, label: 'Other', color: 'slate' },
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
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden selection:bg-blue-200 selection:text-blue-900 font-outfit pb-12 pt-6">

            {/* Background Graphics */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] opacity-60"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex-1 flex items-center justify-center p-4">
                {success ? (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-[2.5rem] p-12 text-center max-w-lg shadow-[0_20px_60px_rgb(0,0,0,0.06)] border border-slate-100 w-full"
                    >
                        <div className="w-28 h-28 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-emerald-500 border border-emerald-100 shadow-sm relative">
                            <div className="absolute inset-0 bg-emerald-400 rounded-[2rem] opacity-20 animate-ping"></div>
                            <CheckCircle size={56} className="relative z-10" />
                        </div>
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Report Filed!</h2>
                        <p className="text-slate-500 mb-8 text-base font-medium">Your report has been received and is pending official scrutiny. Reward XP will be credited upon verification.</p>
                        <div className="bg-blue-50 text-blue-700 px-6 py-3 rounded-xl font-bold text-sm inline-block border border-blue-100 shadow-sm uppercase tracking-widest">
                            Status: Pending Scrutiny
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgb(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row border border-slate-100 min-h-[85vh] md:h-[88vh]"
                    >
                        {/* Sidebar / Progress */}
                        <div className="w-full md:w-[340px] bg-gradient-to-br from-slate-50 to-blue-50/30 p-10 flex flex-col justify-between border-r border-slate-100 relative overflow-hidden shrink-0">
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20 text-white">
                                        <Shield size={22} />
                                    </div>
                                    <span className="font-black tracking-widest text-lg text-slate-900">CIVIC HERO</span>
                                </div>
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight leading-tight">File a Report</h2>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">Help us improve the city by reporting infrastructure issues accurately.</p>
                            </div>

                            <div className="space-y-8 my-10 relative z-10 flex-1 flex flex-col justify-center">
                                {/* Vertical Line connecting steps */}
                                <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-200 -z-10 rounded-full"></div>

                                {[
                                    { num: 1, title: "Category", active: step >= 1 },
                                    { num: 2, title: "Location", active: step >= 2 },
                                    { num: 3, title: "Evidence", active: step >= 3 },
                                    { num: 4, title: "Review", active: step >= 4 }
                                ].map((s) => (
                                    <div key={s.num} className="flex items-center gap-5 group">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${s.active
                                            ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] scale-110 border border-blue-500'
                                            : 'bg-white text-slate-400 border border-slate-200 group-hover:border-slate-300'
                                            }`}>
                                            {s.active && step > s.num ? <CheckCircle size={20} /> : s.num}
                                        </div>
                                        <span className={`text-base font-extrabold transition-colors ${s.active ? 'text-slate-900' : 'text-slate-400'
                                            }`}>
                                            {s.title}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-slate-200 relative z-10 shadow-sm">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Potential Reward</p>
                                <div className="flex items-center gap-3 text-amber-500 font-black text-2xl tracking-tight">
                                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-lg border border-amber-100">🏆</div>
                                    50 XP
                                </div>
                            </div>
                        </div>

                        {/* Form Area */}
                        <div className="flex-1 flex flex-col bg-white relative">
                            {/* Scrollable step content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
                                <h3 className="text-3xl font-extrabold text-slate-900 mb-8 pb-4 border-b border-slate-100 tracking-tight">
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
                                            className="space-y-8"
                                        >
                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Subject Title <span className="text-red-500">*</span></label>
                                                <input
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder="e.g., Deep pothole on Main Street"
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 placeholder-slate-400 transition-all outline-none font-bold text-lg shadow-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4 pl-1">Select Category <span className="text-red-500">*</span></label>
                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {CATEGORIES.map((cat) => {
                                                        const isSelected = formData.category === cat.id;
                                                        return (
                                                            <button
                                                                key={cat.id}
                                                                onClick={() => handleCategorySelect(cat.id)}
                                                                className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all duration-200 ${isSelected
                                                                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm scale-[1.02]'
                                                                    : 'bg-white border-slate-100 hover:border-blue-200 text-slate-500 hover:bg-slate-50 hover:shadow-sm'
                                                                    }`}
                                                            >
                                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                                                    <cat.icon size={24} />
                                                                </div>
                                                                <span className={`text-[11px] font-black uppercase tracking-widest text-center ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>{cat.label}</span>
                                                            </button>
                                                        );
                                                    })}
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
                                            className="space-y-8"
                                        >
                                            {/* Detected City Banner */}
                                            {locationLoading ? (
                                                <div className="flex items-center gap-3 text-slate-600 text-sm font-bold bg-slate-50 px-5 py-4 rounded-xl border border-slate-200 shadow-sm">
                                                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                                                    Detecting your city via GPS...
                                                </div>
                                            ) : detectedCity ? (
                                                <div className="flex items-center gap-3 text-emerald-700 text-sm font-bold bg-emerald-50 px-5 py-4 rounded-xl border border-emerald-200 shadow-sm">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <span>Detected Region: <strong>{detectedCity}</strong></span>
                                                </div>
                                            ) : null}

                                            <div>
                                                <div className="mb-2 relative z-50">
                                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Pin Location on Map <span className="text-red-500">*</span></label>
                                                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
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
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Detailed Address <span className="text-red-500">*</span></label>
                                                <textarea
                                                    name="detail_address"
                                                    rows="3"
                                                    value={formData.detail_address}
                                                    onChange={handleChange}
                                                    placeholder={`Area / Street / Locality / Society / Landmark\ne.g., Near Green Park, MG Road, Sunrise Society, Opp. City Mall`}
                                                    className={`w-full p-4 bg-slate-50 border rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 placeholder-slate-400 outline-none resize-none font-medium shadow-sm transition-all ${!formData.detail_address ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'}`}
                                                />
                                                <p className="text-xs text-slate-500 mt-2 ml-1 font-medium">Required — Enter your area, street, society or nearby landmark so authorities can locate the exact spot.</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -20, opacity: 0 }}
                                            className="space-y-8"
                                        >
                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Detailed Description <span className="text-red-500">*</span></label>
                                                <textarea
                                                    name="description"
                                                    rows="4"
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    placeholder="Explain the severity of the issue, hazards, etc..."
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 placeholder-slate-400 outline-none resize-none font-medium shadow-sm transition-all"
                                                ></textarea>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Evidence <span className="text-red-500">*</span></label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className={`border-2 border-dashed rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors relative group cursor-pointer ${!files.photo ? 'border-amber-300 bg-amber-50/50' : 'border-emerald-300 bg-emerald-50/50'}`}>
                                                        <input type="file" onChange={(e) => handleFileChange(e, 'photo')} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                        {previews.photo ? (
                                                            <div className="relative">
                                                                <img src={previews.photo} alt="Preview" className="w-full h-36 object-cover rounded-xl shadow-md border border-slate-200" />
                                                                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-1 rounded-full shadow-lg"><CheckCircle size={16}/></div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors shadow-sm text-amber-600">
                                                                    <Camera size={26} />
                                                                </div>
                                                                <p className="text-sm font-extrabold text-slate-700">Upload Photo <span className="text-red-500">*</span></p>
                                                                <p className="text-xs text-slate-500 mt-1 font-medium">Required for verification</p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors relative group cursor-pointer">
                                                        <input type="file" onChange={(e) => handleFileChange(e, 'proof')} accept=".pdf,image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                        {previews.proof ? (
                                                            <div className="h-36 flex flex-col items-center justify-center bg-blue-50 rounded-xl text-blue-700 font-bold text-sm p-4 border border-blue-200 shadow-inner">
                                                                <FileText size={36} className="mb-3 text-blue-500" />
                                                                <span className="truncate w-full">{files.proof.name}</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors shadow-sm text-slate-500 group-hover:text-blue-600">
                                                                    <Upload size={26} />
                                                                </div>
                                                                <p className="text-sm font-extrabold text-slate-700">Supporting Document</p>
                                                                <p className="text-xs text-slate-500 mt-1 font-medium">Optional (PDF/Image)</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 pl-1">Contact Phone</label>
                                                <input
                                                    name="contact_phone"
                                                    value={formData.contact_phone}
                                                    onChange={handleChange}
                                                    placeholder="10-digit mobile number"
                                                    maxLength={10}
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 placeholder-slate-400 outline-none font-bold shadow-sm transition-all"
                                                />
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">Auto-filled from your profile</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 4 && (
                                        <motion.div
                                            key="step4"
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -20, opacity: 0 }}
                                            className="space-y-8"
                                        >
                                            <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl space-y-5 text-sm shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-[40px] opacity-50 -mr-10 -mt-10"></div>
                                                
                                                <div className="flex justify-between items-center border-b border-slate-200 pb-4 relative z-10">
                                                    <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Issue Title</span>
                                                    <span className="font-extrabold text-slate-900 text-base">{formData.title}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-slate-200 pb-4 relative z-10">
                                                    <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Category</span>
                                                    <span className="font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg border border-blue-200 shadow-sm text-xs">{formData.category}</span>
                                                </div>
                                                <div className="flex justify-between items-start border-b border-slate-200 pb-4 relative z-10">
                                                    <span className="text-slate-500 font-bold uppercase tracking-wider text-xs mt-1">Location</span>
                                                    <span className="font-bold text-slate-800 text-right max-w-[250px] leading-relaxed">{formData.location_address}</span>
                                                </div>
                                                {formData.detail_address && (
                                                    <div className="flex justify-between items-start border-b border-slate-200 pb-4 relative z-10">
                                                        <span className="text-slate-500 font-bold uppercase tracking-wider text-xs mt-1">Detailed Address</span>
                                                        <span className="font-bold text-slate-800 text-right max-w-[250px] leading-relaxed">{formData.detail_address}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center border-b border-slate-200 pb-4 relative z-10">
                                                    <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Contact</span>
                                                    <span className="font-bold text-slate-900">{formData.contact_phone || 'Not provided'}</span>
                                                </div>
                                                <div className="flex justify-between items-center relative z-10">
                                                    <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Evidence</span>
                                                    <span className="font-extrabold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 text-xs">
                                                        {files.photo ? <><CheckCircle size={14}/> Photo Attached</> : 'No Photo'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 bg-amber-50 p-5 rounded-2xl text-amber-800 text-sm border border-amber-200 shadow-sm">
                                                <div className="bg-amber-100 p-2 rounded-xl text-amber-600 shrink-0 border border-amber-200">
                                                    <AlertCircle size={20} />
                                                </div>
                                                <p className="font-medium leading-relaxed pt-1">
                                                    By submitting this report, you certify that the information provided is true. False reporting may lead to account suspension.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between items-center px-8 md:px-12 py-5 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md">
                                {step > 1 ? (
                                    <button onClick={prevStep} className="px-6 py-3.5 rounded-xl font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center gap-2 transition-all text-sm border border-transparent hover:border-slate-300">
                                        <ChevronLeft size={18} /> Back
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
                                        className="px-8 py-3.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.25)] text-sm"
                                    >
                                        Next Step <ChevronRight size={18} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="px-8 py-3.5 rounded-xl font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 transition-all shadow-[0_8px_20px_rgba(16,185,129,0.25)] text-sm disabled:opacity-70"
                                    >
                                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send size={18} />}
                                        {loading ? 'Submitting...' : 'Submit Report'}
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
