import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, Phone, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            await axios.post('/api/contact', formData);
            setStatus({ type: 'success', message: 'Thank you! Your message has been sent successfully.' });
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Something went wrong. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 py-24 px-4 sm:px-6 lg:px-8 font-outfit relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight"
                    >
                        Contact Support Centre
                    </motion.h1>
                    <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light leading-relaxed">
                        We are here to help. Reach out to us for any queries, support, or feedback regarding our municipal services.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    >
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Get in Touch</h2>

                        <div className="space-y-8">
                            <div className="flex items-start gap-5 group">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm border border-blue-100">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-1">Visit Us</h3>
                                    <p className="text-slate-500 leading-relaxed font-light">
                                        Municipal Corporation HQ<br />
                                        123 Civic Center Drive<br />
                                        City, State 12345
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5 group">
                                <div className="w-14 h-14 bg-emerald-50 rounded-2xl text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm border border-emerald-100">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-1">Email Us</h3>
                                    <a href="mailto:support@civicare.gov" className="block text-slate-500 hover:text-blue-600 transition-colors font-light">support@civicare.gov</a>
                                    <a href="mailto:info@civicare.gov" className="block text-slate-500 hover:text-blue-600 transition-colors font-light">info@civicare.gov</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-5 group">
                                <div className="w-14 h-14 bg-purple-50 rounded-2xl text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm border border-purple-100">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-1">Call Us</h3>
                                    <p className="text-slate-500 font-light">+1 (555) 123-4567</p>
                                    <p className="text-slate-500 font-light text-sm mt-1">Mon-Fri from 8am to 5pm</p>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="mt-10 h-64 bg-slate-100 rounded-3xl overflow-hidden relative border border-slate-200 shadow-inner">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14686.533933221974!2d72.5004245!3d23.0372836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bf637%3A0xe56b7d609c2a3962!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1709665432123!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Municipal Corporation Map"
                            ></iframe>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
                    >
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Send us a Message</h2>

                        {status.message && (
                            <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                <p>{status.message}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm resize-none"
                                    placeholder="Tell us more about your inquiry..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                            >
                                {isSubmitting ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
