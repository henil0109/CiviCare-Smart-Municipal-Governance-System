import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, HelpCircle, ChevronRight } from 'lucide-react';

const MunicipalInfo = () => {
    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="bg-slate-900 text-white py-16 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
                    <p className="text-slate-300 max-w-xl mx-auto">
                        Find answers to common questions or get in touch with our dedicated support team.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Contact Cards */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Phone className="text-blue-600" size={20} />
                                Emergency
                            </h3>
                            <p className="text-2xl font-mono font-bold text-slate-800">1800-123-4567</p>
                            <p className="text-xs text-gray-500 mt-1">Available 24/7 Toll Free</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Mail className="text-blue-600" size={20} />
                                Email Support
                            </h3>
                            <a href="mailto:support@civicare.gov" className="text-blue-600 font-medium hover:underline">
                                support@civicare.gov
                            </a>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="text-blue-600" size={20} />
                                Head Office
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Municipal Corporation HQ,<br />
                                2nd Floor, Civic Center,<br />
                                Main Road, City - 395007.
                            </p>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <HelpCircle size={28} className="text-blue-600" />
                                Frequently Asked Questions
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { q: "How do I report a new issue?", a: "Go to the Dashboard and click 'Report New Issue'. You can upload photos and set the location." },
                                    { q: "How long does it take to resolve a complaint?", a: "It depends on the priority. High priority (Emergency) issues are addressed within 24 hours. Normal issues take 3-5 days." },
                                    { q: "Can I track the status of my report?", a: "Yes. Go to 'My Complaints' or check your Dashboard Activity Feed for real-time updates." },
                                    { q: "What is the 'Civic Level'?", a: "It's a reward system. Every verified report earns you XP. Higher levels unlock special badges and community recognition." },
                                    { q: "Is my personal data safe?", a: "Absolutely. We use industry-standard encryption and your contact details are only shared with the officer assigned to your case." }
                                ].map((faq, i) => (
                                    <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                        <h3 className="font-bold text-gray-800 mb-2 flex items-start gap-2">
                                            <ChevronRight size={18} className="text-blue-400 mt-1 shrink-0" />
                                            {faq.q}
                                        </h3>
                                        <p className="text-gray-600 text-sm ml-7 leading-relaxed">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MunicipalInfo;
