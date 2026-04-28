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
        className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group h-full flex flex-col"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150`} />

        <div className={`w-16 h-16 bg-${color}-50 rounded-2xl flex items-center justify-center text-${color}-600 mb-6 group-hover:bg-${color}-600 group-hover:text-white transition-all duration-300 shadow-sm border border-${color}-100`}>
            <Icon size={32} />
        </div>

        <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">{title}</h3>
        <p className="text-slate-500 mb-6 leading-relaxed font-light">{desc}</p>

        <ul className="space-y-3 mb-8 flex-grow">
            {features.map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                    <CheckCircle2 size={16} className={`text-${color}-500`} />
                    {feat}
                </li>
            ))}
        </ul>

        <Link to="/complaint/new" className="w-full mt-auto">
            <button className={`w-full py-4 rounded-xl border border-${color}-200 text-${color}-700 font-bold hover:bg-${color}-600 hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-2 shadow-sm`}>
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
            color: "amber"
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
            color: "emerald"
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

        <div className="bg-slate-50 min-h-screen pt-32 pb-20 font-outfit">
            <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-blue-50/50 to-slate-50" />

            <div className="container mx-auto px-4 relative z-10">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-sm mb-6 shadow-sm"
                    >
                        <Zap size={16} fill="currentColor" /> Premium Civic Services
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight"
                    >
                        Everything Your City <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Has to Offer.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-500 leading-relaxed font-light"
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
                    className="mt-32 bg-white border border-slate-100 rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50" />
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Can't find what you're looking for?</h2>
                        <p className="text-slate-500 text-lg mb-8 font-light">
                            Our support team is available 24/7 to assist you with specific queries and custom service requests.
                        </p>
                        <Link to="/contact">
                            <button className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-[0_8px_20px_rgba(37,99,235,0.2)]">
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
