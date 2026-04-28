import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, HelpCircle, ChevronRight } from 'lucide-react';

const MunicipalInfo = () => {
    return (
        <div className="bg-slate-50 min-h-screen pb-20 font-outfit">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Help & Support</h1>
                    <p className="text-blue-100 max-w-xl mx-auto text-lg font-light">
                        Find answers to common questions or get in touch with our dedicated support team.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-12 relative z-20">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Contact Cards */}
                    <div className="md:col-span-1 space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100"
                        >
                            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-3 text-lg">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                    <Phone size={18} />
                                </div>
                                Emergency
                            </h3>
                            <p className="text-3xl font-mono font-bold text-slate-800">1800-123-4567</p>
                            <p className="text-sm text-slate-500 mt-2 font-medium">Available 24/7 Toll Free</p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100"
                        >
                            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-3 text-lg">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                                    <Mail size={18} />
                                </div>
                                Email Support
                            </h3>
                            <a href="mailto:support@civicare.gov" className="text-blue-600 font-bold hover:text-blue-700 transition-colors text-lg">
                                support@civicare.gov
                            </a>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100"
                        >
                            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-3 text-lg">
                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                                    <MapPin size={18} />
                                </div>
                                Head Office
                            </h3>
                            <p className="text-slate-600 text-base leading-relaxed">
                                Municipal Corporation HQ,<br />
                                2nd Floor, Civic Center,<br />
                                Main Road, City - 395007.
                            </p>
                        </motion.div>
                    </div>

                    {/* FAQ Section */}
                    <div className="md:col-span-2">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-3xl p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full"
                        >
                            <h2 className="text-3xl font-extrabold mb-8 flex items-center gap-3 text-slate-900">
                                <HelpCircle size={32} className="text-blue-600" />
                                Frequently Asked Questions
                            </h2>
                            <div className="space-y-6">
                                {[
                                    { q: "How do I report a new issue?", a: "Go to the Dashboard and click 'Report New Issue'. You can upload photos and set the location." },
                                    { q: "How long does it take to resolve a complaint?", a: "It depends on the priority. High priority (Emergency) issues are addressed within 24 hours. Normal issues take 3-5 days." },
                                    { q: "Can I track the status of my report?", a: "Yes. Go to 'My Complaints' or check your Dashboard Activity Feed for real-time updates." },
                                    { q: "What is the 'Civic Level'?", a: "It's a reward system. Every verified report earns you XP. Higher levels unlock special badges and community recognition." },
                                    { q: "Is my personal data safe?", a: "Absolutely. We use industry-standard encryption and your contact details are only shared with the officer assigned to your case." }
                                ].map((faq, i) => (
                                    <div key={i} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                        <h3 className="font-bold text-slate-800 mb-2 flex items-start gap-3 text-lg">
                                            <ChevronRight size={20} className="text-blue-500 mt-0.5 shrink-0" />
                                            {faq.q}
                                        </h3>
                                        <p className="text-slate-500 text-base ml-8 leading-relaxed">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MunicipalInfo;
