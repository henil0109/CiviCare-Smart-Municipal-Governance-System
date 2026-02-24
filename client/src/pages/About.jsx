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
        { year: '2023', title: 'The Inception', desc: 'CivicCare was born out of a hackathon idea to bridge the gap between municipal bodies and citizens using AI.' },
        { year: '2024', title: 'Pilot Launch', desc: 'Launched in 2 wards with 500 beta testers. Detected 1,000+ unaddressed issues in the first month.' },
        { year: '2025', title: 'City-Wide Scale', desc: 'Expanded to cover the entire metropolitan area. Integrated real-time tracking and automated status updates.' },
        { year: '2026', title: 'AI Integration', desc: 'Deployed version 3.0 with predictive maintenance AI, preventing infrastructure failures before they happen.' }
    ];

    return (
        <div className="bg-white min-h-screen">
            {/* HERO */}
            <div className="relative pt-32 pb-20 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
                            We Are Building the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Future of Civic Life.</span>
                        </h1>
                        <p className="text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed">
                            CivicCare isn't just an app. It's a digital infrastructure layer that empowers citizens to take ownership of their environment and enables governments to serve with precision.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* STATS STRIP */}
            <div className="bg-blue-600 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="text-4xl md:text-5xl font-black text-white mb-2">{stat.value}</div>
                                <div className="text-blue-200 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MISSION SECTION */}
            <div className="py-24 container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold text-sm mb-6">
                            <Target size={16} /> Our Mission
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 mb-6">Democratizing Urban Maintenance</h2>
                        <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                            We believe that a clean, safe, and functional city is a fundamental right. But it's also a shared responsibility.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Transparent reporting mechanisms",
                                "Accountability for every ticket raised",
                                "Data-driven resource allocation"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                    <CheckCircle2 className="text-emerald-500" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-3 opacity-20" />
                        <img
                            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                            alt="Team Meeting"
                            className="relative rounded-3xl shadow-2xl"
                        />
                    </div>
                </div>
            </div>

            {/* TIMELINE */}
            <div className="py-24 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">The Journey So Far</h2>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-12 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 -ml-[0.5px]" />

                        {timeline.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className={`relative flex flex-col md:flex-row gap-8 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                            >
                                <div className="flex-1 md:text-right">
                                    {i % 2 === 0 && (
                                        <>
                                            <div className="text-5xl font-black text-slate-200 mb-2">{item.year}</div>
                                            <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                                            <p className="text-slate-600">{item.desc}</p>
                                        </>
                                    )}
                                </div>

                                <div className="w-4 h-4 rounded-full bg-blue-600 shadow-[0_0_0_8px_rgba(37,99,235,0.2)] z-10 flex-shrink-0 self-start md:self-center translate-x-[-9px] md:translate-x-0" />

                                <div className="flex-1">
                                    {i % 2 !== 0 && (
                                        <>
                                            <div className="text-5xl font-black text-slate-200 mb-2">{item.year}</div>
                                            <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                                            <p className="text-slate-600">{item.desc}</p>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="py-20 text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-8">Want to be part of the change?</h2>
                <button className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto">
                    Join the Team <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default About;
