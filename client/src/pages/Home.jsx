import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, ShieldCheck, Activity, CheckCircle, Smartphone, BarChart3, Users, Zap, Globe, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

const FeatureCard = ({ icon: Icon, title, desc, delay, color, link }) => (
    <Link to={link || '#'}>
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 rounded-3xl relative overflow-hidden group hover:border-${color}-200 transition-all h-full`}
        >
            <div className={`w-14 h-14 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-${color}-600 group-hover:text-white transition-colors duration-300`}>
                <Icon size={28} />
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">{title}</h3>
            <p className="text-slate-500 leading-relaxed font-normal text-lg">{desc}</p>

            <div className={`mt-6 flex items-center text-sm font-bold text-slate-400 group-hover:text-${color}-600 transition-colors gap-2`}>
                Learn More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
        </motion.div>
    </Link>
);

const Home = ({ user }) => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    return (
        <div className="bg-slate-50 min-h-screen text-slate-800 overflow-hidden font-outfit" ref={containerRef}>

            {/* COMMAND CENTER HERO */}
            <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
                {/* Dynamic Background */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-50/50 via-white to-slate-50" />
                
                {/* Decorative blobs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
                <div className="absolute top-40 right-10 w-72 h-72 bg-teal-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

                <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">

                    {/* MASSIVE LOGO INTEGRATION */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative mb-8 mt-12"
                    >
                        <img
                            src="/logo.png"
                            alt="CiviCare Emblem"
                            className="w-40 md:w-56 h-auto relative drop-shadow-xl"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 leading-tight">
                            Smart Governance. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Empowered Citizens.</span>
                        </h1>

                        <p className="text-slate-500 text-xl md:text-2xl max-w-3xl mx-auto mb-12 font-normal leading-relaxed">
                            Experience the next generation of municipal administration. A premium digital platform bringing transparency, speed, and AI-driven resolution to your city.
                        </p>
                    </motion.div>

                    {/* ACTIONS */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4 mb-40 relative z-20"
                    >
                        <Link to={user ? "/dashboard" : "/register"}>
                            <button className="px-8 py-4 bg-blue-600 rounded-xl font-bold text-white transition-all hover:bg-blue-700 hover:shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:-translate-y-1 flex items-center gap-3 w-full sm:w-auto justify-center">
                                <ShieldCheck size={20} />
                                Access Portal
                            </button>
                        </Link>
                        <Link to="/about">
                            <button className="px-8 py-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 w-full sm:w-auto">
                                Discover Platform
                            </button>
                        </Link>
                    </motion.div>
                </div>

                {/* DASHBOARD STATS OVERLAY */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="absolute bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]"
                >
                    <div className="container mx-auto px-4 py-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-200">
                            <div className="text-center px-4">
                                <div className="text-3xl font-extrabold text-blue-600 mb-1">98.4%</div>
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Resolution Rate</div>
                            </div>
                            <div className="text-center px-4">
                                <div className="text-3xl font-extrabold text-indigo-600 mb-1">52K+</div>
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Active Citizens</div>
                            </div>
                            <div className="text-center px-4">
                                <div className="text-3xl font-extrabold text-emerald-600 mb-1">12</div>
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Connected Wards</div>
                            </div>
                            <div className="text-center px-4">
                                <div className="text-3xl font-extrabold text-purple-600 mb-1">24h</div>
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Avg Response Time</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* FEATURES GRID */}
            <div className="py-24 container mx-auto px-4 bg-slate-50">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">Premium Features</h2>
                    <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Designed for Modern Cities</h3>
                    <p className="text-xl text-slate-500">
                        A complete ecosystem bridging the gap between citizens and administration through transparency, intelligent automation, and user-centric design.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={Smartphone}
                        title="Instant Reporting"
                        desc="Snap a photo, tag location, and report issues in under 30 seconds. Our platform automatically processes your request."
                        delay={0.1}
                        color="blue"
                        link="/services"
                    />
                    <FeatureCard
                        icon={Activity}
                        title="Live Tracking"
                        desc="Watch your complaint move through the system with real-time status updates and transparent timeline visualization."
                        delay={0.2}
                        color="emerald"
                        link={user ? "/dashboard" : "/login"}
                    />
                    <FeatureCard
                        icon={ShieldCheck}
                        title="Verified Resolution"
                        desc="Accountability matters. Nothing is closed until it's actually fixed, with photo proof required for every single resolution."
                        delay={0.3}
                        color="indigo"
                        link="/about"
                    />

                    {/* Big Feature Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-3 bg-blue-600 rounded-3xl p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-12 shadow-[0_20px_50px_rgba(37,99,235,0.2)]"
                    >
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-400/30 to-transparent pointer-events-none" />
                        
                        <div className="relative z-10 flex-1 text-white">
                            <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold mb-6 tracking-wide uppercase">AI Integration</div>
                            <h3 className="text-4xl font-extrabold mb-6">Predictive Impact Analysis</h3>
                            <p className="text-blue-100 text-lg mb-8 max-w-xl font-light leading-relaxed">
                                Our bespoke AI engine doesn't just route complaints. It analyzes patterns, predicts infrastructure failures, and optimizes resource allocation before emergencies escalate.
                            </p>
                            <button className="bg-white text-blue-600 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg">
                                Explore AI Capabilities
                            </button>
                        </div>
                        <div className="relative z-10 w-full md:w-1/3">
                            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Activity className="text-white animate-pulse" size={24} />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-lg">System Health</div>
                                            <div className="text-blue-200 text-sm">Monitoring all vectors</div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-400 w-3/4"></div>
                                        </div>
                                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-400 w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 flex justify-between text-sm text-blue-100">
                                        <span>AI Engine Status</span>
                                        <span className="font-mono text-emerald-300 font-bold">OPTIMAL</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="py-24 relative overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px]" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white tracking-tight">Ready to Shape Your City?</h2>
                    <p className="text-slate-400 text-xl mb-10 max-w-2xl mx-auto font-light">
                        Join thousands of citizens who are already making a difference. Your voice matters, and CiviCare ensures it is heard and acted upon.
                    </p>
                    <Link to="/register">
                        <button className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:-translate-y-1 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.4)]">
                            Create Your Free Account
                        </button>
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default Home;
