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
            whileHover={{ y: -10, rotateX: 5, rotateY: 5 }}
            className={`bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:border-${color}-500/50 transition-colors h-full`}
        >
            <div className={`absolute -right-10 -top-10 w-40 h-40 bg-${color}-500/20 blur-3xl rounded-full group-hover:bg-${color}-500/30 transition-colors`} />

            <div className={`w-14 h-14 bg-gradient-to-br from-${color}-500 to-${color}-700 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-${color}-500/30 group-hover:scale-110 transition-transform`}>
                <Icon size={28} />
            </div>

            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
            <p className="text-slate-400 leading-relaxed font-light text-lg">{desc}</p>

            <div className="mt-6 flex items-center text-sm font-bold text-white/50 group-hover:text-white transition-colors gap-2">
                Learn More <ArrowRight size={14} />
            </div>
        </motion.div>
    </Link>
);

const Home = ({ user }) => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    return (
        <div className="bg-slate-950 min-h-screen text-white overflow-hidden selection:bg-blue-500 selection:text-white" ref={containerRef}>

            {/* COMMAND CENTER HERO */}
            <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
                {/* Dynamic Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-slate-950" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
                    {/* Grid Effect */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/10 to-transparent" />
                </div>

                <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">

                    {/* MASSIVE LOGO INTEGRATION */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, filter: "blur(10px)" }}
                        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="relative mb-12"
                    >
                        {/* Glow Behind */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-400/10 rounded-full blur-[50px]" />

                        <img
                            src="/logo.png"
                            alt="CiviCare Emblem"
                            className="w-48 md:w-64 h-auto relative drop-shadow-[0_0_50px_rgba(59,130,246,0.5)]"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400">
                            YOUR CITY.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">YOUR COMMAND.</span>
                        </h1>

                        <p className="text-slate-400 text-xl md:text-2xl max-w-2xl mx-auto mb-10 font-light mix-blend-plus-lighter">
                            The Integrated Command Center for Modern Citizenship.
                        </p>
                    </motion.div>

                    {/* HUD ACTIONS */}
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex flex-col sm:flex-row gap-6 mb-32 relative z-20"
                    >
                        <Link to={user ? "/dashboard" : "/register"}>
                            <button className="group relative px-10 py-4 bg-blue-600/10 border border-blue-500/50 rounded-xl font-bold text-lg text-blue-300 transition-all hover:bg-blue-600 hover:text-white hover:border-blue-400 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] overflow-hidden">
                                <div className="absolute inset-0 bg-blue-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative flex items-center gap-3">
                                    <Zap size={20} className="group-hover:text-yellow-300 transition-colors" />
                                    INITIATE PROTOCOL
                                </span>
                            </button>
                        </Link>
                    </motion.div>
                </div>

                {/* DASHBOARD STATS OVERLAY (HUD) */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className="absolute bottom-0 w-full border-t border-white/5 bg-slate-950/50 backdrop-blur-xl"
                >
                    <div className="container mx-auto px-4 py-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
                            <div className="text-center">
                                <Activity className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                                <div className="text-2xl font-mono font-bold text-white">98.4%</div>
                                <div className="text-xs text-slate-500 tracking-widest uppercase">System Uptime</div>
                            </div>
                            <div className="text-center">
                                <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                <div className="text-2xl font-mono font-bold text-white">52,140</div>
                                <div className="text-xs text-slate-500 tracking-widest uppercase">Active Citizens</div>
                            </div>
                            <div className="text-center">
                                <ShieldCheck className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                                <div className="text-2xl font-mono font-bold text-white">LEVEL 4</div>
                                <div className="text-xs text-slate-500 tracking-widest uppercase">Security Clearance</div>
                            </div>
                            <div className="text-center">
                                <Globe className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                                <div className="text-2xl font-mono font-bold text-white">12</div>
                                <div className="text-xs text-slate-500 tracking-widest uppercase">Connected Wards</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* LIVE STATS TICKER */}
            <div className="bg-blue-600 py-4 overflow-hidden relative">
                <div className="flex animate-marquee whitespace-nowrap gap-12 text-white/90 font-mono font-bold text-lg items-center">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex gap-12">
                            <span className="flex items-center gap-2">⚡ ACTIVE ISSUES: 142</span>
                            <span className="flex items-center gap-2">✅ RESOLVED TODAY: 45</span>
                            <span className="flex items-center gap-2">🚒 EMERGENCY UNITS: DEPLOYED</span>
                            <span className="flex items-center gap-2">⏱️ AVG RESPONSE: 24m</span>
                            <span className="flex items-center gap-2">🌍 CITY STATUS: ONLINE</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* FEATURES GRID */}
            <div className="py-32 container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <motion.h2
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="text-5xl md:text-6xl font-black mb-8 leading-tight"
                        >
                            Next-Gen <span className="text-blue-500">Governance</span><br />
                            Is Finally Here.
                        </motion.h2>
                    </div>

                    <div className="flex items-end">
                        <p className="text-slate-400 text-lg mb-8">
                            A complete ecosystem designed to bridge the gap between citizens and administration through transparency and technology.
                        </p>
                    </div>

                    <FeatureCard
                        icon={Smartphone}
                        title="Instant Reporting"
                        desc="Snap a photo, tag location, and report issues in under 30 seconds. AI automatically categorizes your request."
                        delay={0.1}
                        color="blue"
                        link="/services"
                    />
                    <FeatureCard
                        icon={Activity}
                        title="Real-time Tracking"
                        desc="Watch your complaint move through the system with live status updates and timeline visualization."
                        delay={0.2}
                        color="emerald"
                        link={user ? "/dashboard" : "/login"}
                    />
                    <FeatureCard
                        icon={ShieldCheck}
                        title="Verified Resolution"
                        desc="Nothing is closed until it's actually fixed. Photo proof required for every single resolution."
                        delay={0.3}
                        color="purple"
                        link="/about"
                    />

                    {/* Big Feature Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-3 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-12"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        <div className="relative z-10 flex-1">
                            <div className="inline-block px-4 py-1 bg-blue-500/20 rounded-full text-blue-300 text-sm font-bold mb-6 border border-blue-400/20">NEW FEATURE</div>
                            <h3 className="text-4xl font-bold mb-6">AI Impact Analysis</h3>
                            <p className="text-blue-100/80 text-lg mb-8 max-w-xl">
                                Our bespoke AI engine doesn't just route complaints. It analyzes patterns, predicts infrastructure failures, and optimizes resource allocation before emergencies happen.
                            </p>
                            <button className="bg-white text-blue-900 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                                View Handling Protocols
                            </button>
                        </div>
                        <div className="relative z-10 w-full md:w-1/3">
                            {/* Abstract Graphic representing AI */}
                            <div className="aspect-square bg-blue-500/30 rounded-full blur-3xl absolute inset-0" />
                            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                                <div className="space-y-4">
                                    <div className="h-2 bg-white/20 rounded w-3/4" />
                                    <div className="h-2 bg-white/20 rounded w-1/2" />
                                    <div className="h-24 bg-blue-500/20 rounded-xl border border-blue-400/30 flex items-center justify-center">
                                        <Activity className="text-blue-400 animate-pulse" size={48} />
                                    </div>
                                    <div className="flex justify-between text-sm text-blue-200">
                                        <span>System Status</span>
                                        <span className="font-mono text-emerald-400">OPTIMAL</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-800" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-6xl font-black mb-8 text-white">Ready to Shape Your City?</h2>
                    <p className="text-blue-100 text-xl mb-12 max-w-2xl mx-auto">
                        Join 50,000+ citizens who are already making a difference. Your voice matters, and CiviCare makes sure it's heard.
                    </p>
                    <Link to="/register">
                        <button className="bg-white text-blue-900 px-12 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-xl shadow-black/20">
                            Get Started Now
                        </button>
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default Home;
