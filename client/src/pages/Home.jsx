import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    FileText, ShieldCheck, Activity, CheckCircle, Smartphone, 
    BarChart3, Users, Zap, Globe, ArrowRight, X, ChevronRight, 
    ChevronLeft, Camera, Clock, FileSignature, Scale, Building,
    MapPin, Network, Award
} from 'lucide-react';

// --- CountUp Component ---
const CountUp = ({ end, duration = 2, prefix = '', suffix = '', decimals = 0 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (inView) {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
                // easeOutExpo
                const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                setCount(easeOut * end);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    setCount(end);
                }
            };
            window.requestAnimationFrame(step);
        }
    }, [inView, end, duration]);

    return (
        <span ref={ref}>
            {prefix}{count.toFixed(decimals)}{suffix}
        </span>
    );
};

// --- Modal Component ---
const Modal = ({ isOpen, onClose, data }) => {
    return (
        <AnimatePresence>
            {isOpen && data && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
                    />
                    {/* Modal Content */}
                    <div className="fixed inset-0 pointer-events-none z-[101] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white pointer-events-auto w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative border border-slate-100"
                        >
                            <button 
                                onClick={onClose}
                                className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors z-10"
                            >
                                <X size={20} />
                            </button>

                            <div className={`bg-${data.color}-50 p-10 pt-12 text-center relative overflow-hidden`}>
                                <div className={`absolute -top-10 -left-10 w-40 h-40 bg-${data.color}-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70`} />
                                <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-${data.color}-300/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70`} />
                                
                                <div className={`w-20 h-20 bg-white shadow-xl text-${data.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10`}>
                                    <data.icon size={40} />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 relative z-10">{data.title}</h3>
                            </div>

                            <div className="p-8 pb-10">
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    {data.content}
                                </p>
                                {data.features && (
                                    <ul className="mt-6 space-y-3">
                                        {data.features.map((feat, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-slate-700">
                                                <CheckCircle size={20} className={`text-${data.color}-500 shrink-0 mt-0.5`} />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};


// --- Main Home Component ---
const Home = ({ user }) => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);

    const openModal = (key) => {
        setModalData(modalContent[key]);
        setIsModalOpen(true);
    };

    const modalContent = {
        platform: {
            title: "Discover the Platform",
            icon: Globe,
            color: "blue",
            content: "CiviCare is a premium e-governance platform designed to eliminate bureaucracy. It connects citizens directly to municipal departments using advanced AI routing, ensuring your voice is heard instantly.",
            features: ["AI-Powered Issue Routing", "Real-time Resolution Tracking", "Direct Department Communication", "Verified Digital Identity Integration"]
        },
        instant: {
            title: "Instant Reporting",
            icon: Smartphone,
            color: "blue",
            content: "Our state-of-the-art mobile and web interface lets you report issues in seconds. Advanced geofencing automatically tags the exact ward and jurisdiction.",
            features: ["GPS Auto-Location", "Multi-Image Upload", "Voice-to-Text Descriptions"]
        },
        tracking: {
            title: "Live Tracking",
            icon: Activity,
            color: "emerald",
            content: "Never wonder about the status of your complaint again. Watch as your issue moves from 'Reported' to 'Assigned' and 'Resolved' with live milestone updates.",
            features: ["SMS & Email Notifications", "Timeline Visualization", "Assigned Officer Details"]
        },
        verified: {
            title: "Verified Resolution",
            icon: ShieldCheck,
            color: "indigo",
            content: "Accountability is our core tenet. Municipal workers must provide photographic proof of the fixed issue before it can be closed. You have the final say.",
            features: ["Before/After Photo Verification", "Citizen Sign-off Process", "Quality Assurance Metrics"]
        }
    };

    const procedures = [
        { id: 1, title: "Capture & Report", desc: "Spot an issue in your city? Simply snap a photo, add a brief description, and submit. We'll automatically pinpoint your location.", icon: Camera, color: "blue" },
        { id: 2, title: "Smart Routing", desc: "Our intelligent system analyzes the report and instantly routes it to the specific municipal department responsible for the fix.", icon: Network, color: "indigo" },
        { id: 3, title: "Active Tracking", desc: "Track the progress of your report in real-time. Receive instant notifications when a team is dispatched to your location.", icon: Clock, color: "teal" },
        { id: 4, title: "Resolution & Verify", desc: "Once the work is done, the team uploads proof. You get to verify the resolution, ensuring the job is done right.", icon: Award, color: "emerald" },
    ];

    const egovInfo = [
        { title: "Radical Transparency", desc: "Access live dashboards showing municipal response times, budget allocations for infrastructure, and district-wise performance metrics.", icon: BarChart3, color: "blue" },
        { title: "Digital Policy Making", desc: "Participate in local governance by reviewing proposed city projects and providing direct feedback before initiatives are finalized.", icon: Scale, color: "indigo" },
        { title: "Secure Infrastructure", desc: "Built on a zero-trust architecture, ensuring all citizen data and municipal communications are cryptographically secured.", icon: ShieldCheck, color: "emerald" },
        { title: "Unified Command", desc: "A centralized dashboard for municipal supervisors to allocate resources dynamically based on predictive AI models.", icon: Building, color: "purple" }
    ];

    return (
        <div className="bg-slate-50 min-h-screen text-slate-800 font-outfit" ref={containerRef}>
            
            {/* Modal Overlay */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={modalData} />

            {/* COMMAND CENTER HERO */}
            <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
                {/* Dynamic Background */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-50/50 via-white to-slate-50" />
                
                {/* Animated Decorative blobs */}
                <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-20 left-10 w-96 h-96 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70" 
                />
                <motion.div 
                    animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute top-40 right-10 w-96 h-96 bg-teal-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70" 
                />
                <motion.div 
                    animate={{ scale: [1, 1.15, 1], y: [0, -30, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-10 left-1/3 w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70" 
                />

                <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">

                    {/* MASSIVE LOGO INTEGRATION */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.8 }}
                        className="relative mb-8 mt-12"
                    >
                        <div className="absolute inset-0 bg-white/40 blur-2xl rounded-full scale-150 -z-10"></div>
                        <img
                            src="/logo.png"
                            alt="CiviCare Emblem"
                            className="w-44 md:w-60 h-auto relative drop-shadow-[0_20px_30px_rgba(37,99,235,0.2)]"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                    >


                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 text-slate-900 leading-[1.1]">
                            Smart Governance. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500">Empowered Citizens.</span>
                        </h1>

                        <p className="text-slate-500 text-xl md:text-2xl max-w-3xl mx-auto mb-12 font-normal leading-relaxed">
                            Experience the next generation of municipal administration. A premium digital platform bringing unprecedented transparency, speed, and AI-driven resolution directly to your city.
                        </p>
                    </motion.div>

                    {/* ACTIONS */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 120 }}
                        className="flex flex-col sm:flex-row gap-5 mb-40 relative z-20"
                    >
                        <Link to={user ? "/dashboard" : "/register"}>
                            <button className="px-10 py-4 bg-blue-600 rounded-2xl font-bold text-white text-lg transition-all hover:bg-blue-700 hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)] hover:-translate-y-1 flex items-center gap-3 w-full sm:w-auto justify-center group border border-blue-500">
                                <ShieldCheck size={22} className="group-hover:scale-110 transition-transform" />
                                Access Portal
                            </button>
                        </Link>
                        <button 
                            onClick={() => openModal('platform')}
                            className="px-10 py-4 bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg rounded-2xl font-bold text-slate-700 text-lg transition-all hover:bg-white hover:border-blue-200 hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-3 group"
                        >
                            <FileText size={22} className="text-blue-500 group-hover:rotate-12 transition-transform" />
                            Discover Platform
                        </button>
                    </motion.div>
                </div>

                {/* ANIMATED DASHBOARD STATS OVERLAY */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8, type: "spring" }}
                    className="absolute bottom-0 w-full bg-white/90 backdrop-blur-2xl border-t border-slate-200 shadow-[0_-20px_50px_rgba(0,0,0,0.04)] z-30"
                >
                    <div className="container mx-auto px-4 py-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
                            <motion.div whileHover={{ scale: 1.05 }} className="text-center px-4 cursor-default">
                                <div className="text-4xl font-extrabold text-blue-600 mb-1 flex justify-center items-baseline">
                                    <CountUp end={98.4} decimals={1} duration={2.5} />
                                    <span className="text-2xl">%</span>
                                </div>
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Resolution Rate</div>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} className="text-center px-4 cursor-default">
                                <div className="text-4xl font-extrabold text-indigo-600 mb-1 flex justify-center items-baseline">
                                    <CountUp end={52} duration={2} />
                                    <span className="text-2xl">K+</span>
                                </div>
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Citizens</div>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} className="text-center px-4 cursor-default">
                                <div className="text-4xl font-extrabold text-teal-600 mb-1 flex justify-center items-baseline">
                                    <CountUp end={12} duration={1.5} />
                                </div>
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Connected Wards</div>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} className="text-center px-4 cursor-default">
                                <div className="text-4xl font-extrabold text-purple-600 mb-1 flex justify-center items-baseline">
                                    <span className="text-2xl mr-1">&lt;</span>
                                    <CountUp end={24} duration={2} />
                                    <span className="text-2xl">h</span>
                                </div>
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Avg Response Time</div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* HOW IT WORKS: VERTICAL TIMELINE */}
            <div className="py-32 bg-white relative overflow-hidden border-t border-slate-100">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-3 flex items-center justify-center gap-2">
                            <Zap size={16} /> Official Procedure
                        </h2>
                        <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Transparent. Efficient. Verified.</h3>
                        <p className="text-xl text-slate-500 font-light">
                            A standardized four-step protocol ensuring every citizen's report is handled with accountability and precision.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto relative">
                        {/* Connecting Line */}
                        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-100 via-indigo-100 to-transparent -translate-x-1/2 rounded-full" />
                        
                        <div className="space-y-16 md:space-y-24 relative">
                            {procedures.map((proc, index) => {
                                const isEven = index % 2 === 0;
                                return (
                                    <motion.div
                                        key={proc.id}
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.6 }}
                                        className={`flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}
                                    >
                                        {/* Content Box */}
                                        <div className={`flex-1 w-full pl-20 md:pl-0 ${isEven ? 'md:text-left md:pl-16' : 'md:text-right md:pr-16'}`}>
                                            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-300 relative group">
                                                <div className={`absolute top-0 ${isEven ? 'left-0 rounded-tl-3xl rounded-br-3xl' : 'right-0 rounded-tr-3xl rounded-bl-3xl'} bg-${proc.color}-100 text-${proc.color}-600 font-bold px-4 py-2 text-sm`}>
                                                    Step 0{proc.id}
                                                </div>
                                                <h4 className="text-2xl font-bold text-slate-800 mb-4 mt-4">{proc.title}</h4>
                                                <p className="text-slate-500 text-lg leading-relaxed">
                                                    {proc.desc}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Center Icon */}
                                        <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-slate-50 flex items-center justify-center shadow-lg z-10">
                                            <div className={`w-10 h-10 bg-${proc.color}-50 text-${proc.color}-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <proc.icon size={20} />
                                            </div>
                                        </div>

                                        {/* Empty spacer for flex alignment */}
                                        <div className="hidden md:block flex-1 w-1/2" />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* FEATURES GRID & MODALS */}
            <div className="py-32 container mx-auto px-4 bg-slate-50 relative">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-3">Core Modules</h2>
                    <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Designed for Modern Cities</h3>
                    <p className="text-xl text-slate-500">
                        A complete ecosystem bridging the gap between citizens and administration through transparency, intelligent automation, and user-centric design.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {/* Feature Card 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        onClick={() => openModal('instant')}
                        className="bg-white cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 rounded-3xl relative overflow-hidden group hover:border-blue-200 hover:shadow-xl transition-all h-full"
                    >
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                            <Smartphone size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Instant Reporting</h3>
                        <p className="text-slate-500 leading-relaxed font-normal text-lg mb-6">Snap a photo, tag location, and report issues in under 30 seconds. Our platform processes it instantly.</p>
                        <div className="flex items-center text-sm font-bold text-blue-600 gap-2">
                            Explore Module <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                        </div>
                    </motion.div>

                    {/* Feature Card 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        onClick={() => openModal('tracking')}
                        className="bg-white cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 rounded-3xl relative overflow-hidden group hover:border-emerald-200 hover:shadow-xl transition-all h-full"
                    >
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                            <Activity size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Live Tracking</h3>
                        <p className="text-slate-500 leading-relaxed font-normal text-lg mb-6">Watch your complaint move through the system with real-time status updates and transparent timelines.</p>
                        <div className="flex items-center text-sm font-bold text-emerald-600 gap-2">
                            Explore Module <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                        </div>
                    </motion.div>

                    {/* Feature Card 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        onClick={() => openModal('verified')}
                        className="bg-white cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 rounded-3xl relative overflow-hidden group hover:border-indigo-200 hover:shadow-xl transition-all h-full"
                    >
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Verified Resolution</h3>
                        <p className="text-slate-500 leading-relaxed font-normal text-lg mb-6">Accountability matters. Nothing is closed until it's actually fixed, with photo proof required for every resolution.</p>
                        <div className="flex items-center text-sm font-bold text-indigo-600 gap-2">
                            Explore Module <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                        </div>
                    </motion.div>
                </div>

                {/* Big AI Feature Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center gap-12 shadow-[0_30px_60px_rgba(37,99,235,0.25)] border border-blue-500/30"
                >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-[80px] pointer-events-none" 
                    />
                    
                    <div className="relative z-10 flex-1 text-white">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-bold mb-8 tracking-widest uppercase border border-white/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            AI Integration Live
                        </div>
                        <h3 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">Predictive Impact <br/>Analysis Engine</h3>
                        <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-xl font-light leading-relaxed">
                            Our bespoke AI engine doesn't just route complaints. It analyzes historical patterns, predicts infrastructure failures, and optimizes resource allocation before emergencies escalate.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1">
                                View AI Capabilities
                            </button>
                            <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-bold text-white transition-all hover:bg-white/20 hover:border-white/40">
                                View Data Models
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10 w-full md:w-5/12 perspective-1000">
                        <motion.div 
                            initial={{ rotateY: -10, rotateX: 5 }}
                            whileHover={{ rotateY: 0, rotateX: 0 }}
                            transition={{ type: "spring", stiffness: 100 }}
                            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform-gpu"
                        >
                            <div className="space-y-8">
                                <div className="flex items-center gap-5 border-b border-white/10 pb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                                        <Activity className="text-white animate-pulse" size={28} />
                                    </div>
                                    <div>
                                        <div className="text-white font-bold text-xl mb-1">System Health</div>
                                        <div className="text-blue-200 text-sm flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Monitoring all vectors
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-sm text-blue-100 mb-2 font-medium">
                                            <span>AI Prediction Accuracy</span>
                                            <span>94.2%</span>
                                        </div>
                                        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "94.2%" }}
                                                transition={{ duration: 1.5, delay: 0.5 }}
                                                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm text-blue-100 mb-2 font-medium">
                                            <span>Resource Optimization</span>
                                            <span>+68%</span>
                                        </div>
                                        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "68%" }}
                                                transition={{ duration: 1.5, delay: 0.7 }}
                                                className="h-full bg-gradient-to-r from-blue-400 to-indigo-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/10 flex justify-between items-center text-sm">
                                    <span className="text-blue-200">Neural Network Status</span>
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono font-bold rounded-lg border border-emerald-500/30">OPTIMAL</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* E-GOVERNANCE INFORMATION GRID */}
            <div className="py-24 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4">
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Digital E-Governance Protocols</h2>
                        <p className="text-xl text-slate-500 max-w-2xl font-light">
                            CiviCare is built on the foundation of open data and civic empowerment. Discover the core pillars of our governance architecture.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {egovInfo.map((info, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row gap-6"
                            >
                                <div className={`w-16 h-16 bg-${info.color}-100 text-${info.color}-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-${info.color}-600 group-hover:text-white transition-all duration-300 shadow-sm`}>
                                    <info.icon size={32} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-slate-800 mb-3">{info.title}</h4>
                                    <p className="text-slate-500 leading-relaxed text-lg">{info.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="py-32 relative overflow-hidden bg-slate-900 border-t border-slate-800">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
                <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[150px] pointer-events-none" 
                />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", bounce: 0.4 }}
                    >
                        <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-white tracking-tight">Ready to Shape Your City?</h2>
                        <p className="text-slate-300 text-2xl mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                            Join thousands of citizens who are already making a difference. Your voice matters, and CiviCare ensures it is heard and acted upon with unprecedented speed.
                        </p>
                        <Link to="/register">
                            <button className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-bold text-xl hover:bg-slate-100 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                                Create Your Free Account
                            </button>
                        </Link>
                        <p className="mt-6 text-slate-500 font-medium">Join 52,000+ citizens today. No credit card required.</p>
                    </motion.div>
                </div>
            </div>

        </div>
    );
};

export default Home;
