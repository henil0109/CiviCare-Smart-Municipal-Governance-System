import { motion } from 'framer-motion';
import {
    Truck, ShieldAlert, TreePine, Droplets, Lightbulb,
    Construction, ArrowRight, Zap, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ icon: Icon, title, desc, features, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150`} />

        <div className={`w-16 h-16 bg-${color}-50 rounded-2xl flex items-center justify-center text-${color}-600 mb-6 group-hover:bg-${color}-600 group-hover:text-white transition-all duration-300 shadow-lg shadow-${color}-500/20`}>
            <Icon size={32} />
        </div>

        <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 mb-6 leading-relaxed">{desc}</p>

        <ul className="space-y-3 mb-8">
            {features.map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <CheckCircle2 size={16} className={`text-${color}-500`} />
                    {feat}
                </li>
            ))}
        </ul>

        <Link to="/complaint/new" className="w-full">
            <button className={`w-full py-4 rounded-xl border border-${color}-200 text-${color}-700 font-bold hover:bg-${color}-600 hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-${color}-500/30`}>
                Request Service <ArrowRight size={18} />
            </button>
        </Link>
    </motion.div>
);

const Services = () => {
    const services = [
        {
            icon: Truck,
            title: "Waste Management",
            desc: "Smart garbage collection monitoring and on-demand pickup requests for bulk waste.",
            features: ["Real-time Truck Tracking", "Bulk Pickup Scheduling", "Recycling Guidelines"],
            color: "emerald"
        },
        {
            icon: Droplets,
            title: "Water Supply",
            desc: "Report leakages, check supply timings, and monitor quality metrics in your ward.",
            features: ["Leakage Reporting", "Supply Schedule", "Quality Dashboard"],
            color: "blue"
        },
        {
            icon: Lightbulb,
            title: "Street Lighting",
            desc: "Automated fault detection and repair requests for streetlights in public areas.",
            features: ["Auto-Fault Detection", "Dark Spot Reporting", "Energy Usage Stats"],
            color: "yellow"
        },
        {
            icon: Construction,
            title: "Road Maintenance",
            desc: "Pothole reporting and road repair tracking with photographic evidence.",
            features: ["Pothole Mapping", "Repair Timeline", "Contractor details"],
            color: "orange"
        },
        {
            icon: TreePine,
            title: "Parks & Greenery",
            desc: "Maintenance of public parks, tree plantation drives, and pruning requests.",
            features: ["Park Maintenance", "Tree Plantation", "Pruning Requests"],
            color: "green"
        },
        {
            icon: ShieldAlert,
            title: "Disaster Management",
            desc: "Emergency response coordination for floods, fires, and other civic hazards.",
            features: ["SOS Alerts", "Shelter Locations", "Emergency Contacts"],
            color: "red"
        }
    ];

    return (

        <div className="bg-slate-950 min-h-screen pt-32 pb-20">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                <div className="absolute top-0 left-0 w-full h-full bg-slate-950/80" />
            </div>

            <div className="container mx-auto px-4 relative z-10">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-bold text-sm mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                    >
                        <Zap size={16} fill="currentColor" /> Premium Civic Services
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-lg"
                    >
                        Everything Your City <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Has to Offer.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-400 leading-relaxed font-light"
                    >
                        Access critical municipal services instantly. No queues, no paperwork—just efficient digital governance at your fingertips.
                    </motion.p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <ServiceCard key={index} {...service} delay={index * 0.1} />
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-32 bg-slate-900 rounded-3xl p-12 text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold text-white mb-6">Can't find what you're looking for?</h2>
                        <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
                            Our support team is available 24/7 to assist you with specific queries and custom service requests.
                        </p>
                        <Link to="/contact">
                            <button className="bg-white text-slate-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-100 transition-colors">
                                Contact Support Centre
                            </button>
                        </Link>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default Services;
