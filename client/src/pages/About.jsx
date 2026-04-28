import { motion } from 'framer-motion';
import { Target, Users, History, Award, CheckCircle2, ArrowRight } from 'lucide-react';

const About = () => {
    const stats = [
        { label: 'Active Citizens', value: '50K+' },
        { label: 'Issues Resolved', value: '12K+' },
        { label: 'Partner Cities', value: '08' },
        { label: 'Avg Resolution', value: '24h' }
    ];

    const timeline = [
        { year: '2023', title: 'The Inception', desc: 'CiviCare was born out of a civic hackathon idea to bridge the gap between municipal bodies and citizens using smart technology.' },
        { year: '2024', title: 'Pilot Launch', desc: 'Launched in 2 wards with 500 beta testers. Detected 1,000+ unaddressed issues in the first month.' },
        { year: '2025', title: 'City-Wide Scale', desc: 'Expanded to cover the entire metropolitan area. Integrated real-time tracking and automated status updates.' },
        { year: '2026', title: 'AI Integration', desc: 'Deployed version 3.0 with predictive AI, preventing infrastructure failures before they happen.' }
    ];

    return (
        <div className="bg-slate-50 min-h-screen font-outfit overflow-hidden">
            {/* HERO */}
            <div className="relative pt-32 pb-20 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight leading-tight">
                            Building the Future of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Civic Infrastructure.</span>
                        </h1>
                        <p className="text-slate-500 text-xl max-w-3xl mx-auto leading-relaxed font-light">
                            CiviCare isn't just an app. It's a premium digital infrastructure layer that empowers citizens to take ownership of their environment and enables governments to serve with precision.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* STATS STRIP */}
            <div className="bg-white py-12 border-y border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative z-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="px-4"
                            >
                                <div className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-2 tracking-tight">{stat.value}</div>
                                <div className="text-slate-500 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MISSION SECTION */}
            <div className="py-32 container mx-auto px-4 relative">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold text-sm mb-6 shadow-sm border border-blue-100">
                            <Target size={16} /> Our Mission
                        </div>
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Democratizing Urban Maintenance</h2>
                        <p className="text-slate-500 text-lg mb-8 leading-relaxed font-light">
                            We believe that a clean, safe, and functional city is a fundamental right. But it's also a shared responsibility.
                        </p>
                        <ul className="space-y-5">
                            {[
                                "Transparent reporting mechanisms",
                                "Accountability for every ticket raised",
                                "Data-driven resource allocation"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-slate-700 font-semibold bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
                                    <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                                        <CheckCircle2 size={18} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2.5rem] rotate-3 opacity-10" />
                        <img
                            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                            alt="Team Meeting"
                            className="relative rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white"
                        />
                    </div>
                </div>
            </div>

            {/* TIMELINE */}
            <div className="py-32 bg-white relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">The Journey So Far</h2>
                        <div className="w-24 h-1 bg-blue-600 mx-auto mt-6 rounded-full" />
                    </div>

                    <div className="max-w-4xl mx-auto space-y-16 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 -ml-[0.5px]" />

                        {timeline.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className={`relative flex flex-col md:flex-row gap-8 pl-24 md:pl-0 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                            >
                                <div className="flex-1 md:text-right">
                                    {i % 2 === 0 && (
                                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                            <div className="text-5xl font-black text-slate-200 mb-4">{item.year}</div>
                                            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{item.title}</h3>
                                            <p className="text-slate-500 font-light leading-relaxed">{item.desc}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Node */}
                                <div className="absolute left-8 md:static w-5 h-5 rounded-full bg-blue-600 shadow-[0_0_0_8px_rgba(37,99,235,0.15)] z-10 flex-shrink-0 self-start md:self-center translate-x-[-9px] md:translate-x-0 mt-8 md:mt-0" />

                                <div className="flex-1">
                                    {i % 2 !== 0 && (
                                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                            <div className="text-5xl font-black text-slate-200 mb-4">{item.year}</div>
                                            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{item.title}</h3>
                                            <p className="text-slate-500 font-light leading-relaxed">{item.desc}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="py-32 text-center bg-slate-50">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">Want to be part of the change?</h2>
                    <p className="text-xl text-slate-500 font-light mb-10">
                        Join our mission to build smarter, cleaner, and more responsive cities.
                    </p>
                    <button className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:-translate-y-1 flex items-center gap-3 mx-auto text-lg">
                        Join the Movement <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default About;
