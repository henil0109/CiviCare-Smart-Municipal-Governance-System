import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';

const LanguageSwitcher = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('English');

    const languages = [
        { code: 'en', name: 'English', localName: 'English' },
        { code: 'gu', name: 'Gujarati', localName: 'ગુજરાતી' }
    ];

    useEffect(() => {
        // Try to detect if a cookie already holds the googtrans value
        const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
        if (match) {
            const langCode = match[2].split('/').pop();
            const found = languages.find(l => l.code === langCode);
            if (found) {
                setCurrentLang(found.name);
            }
        }
    }, []);

    const changeLanguage = (langCode, langName) => {
        // Find the hidden google translate select element
        const selectEl = document.querySelector('.goog-te-combo');
        if (selectEl) {
            selectEl.value = langCode;
            // Dispatch a change event so the Google script picks it up
            selectEl.dispatchEvent(new Event('change'));
            setCurrentLang(langName);
        }
        setIsOpen(false);
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isStaff = user.role === 'admin' || user.role === 'supervisor';

    return (
        <div className={`fixed bottom-6 ${isStaff ? 'left-72' : 'left-6'} z-[60] font-outfit`}>
            <div className="relative group">
                {/* Highlight Pulse Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                
                {/* Main Button - Compact & Premium */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative flex items-center gap-2 bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(99,102,241,0.2)] hover:shadow-[0_8px_32px_rgba(99,102,241,0.3)] text-slate-700 px-3 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                >
                    <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-1.5 rounded-full text-white shadow-lg shadow-blue-200">
                        <Globe size={16} />
                    </div>
                    <div className="flex flex-col items-start pr-1">
                        <span className="text-[10px] leading-none font-bold text-indigo-600/70 uppercase tracking-tighter">Language</span>
                        <span className="text-xs font-black tracking-wide text-slate-800">
                            {currentLang === 'Gujarati' ? 'ગુજરાતી' : 'English'}
                        </span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu - Opens Upward */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full left-0 mb-3 w-44 bg-white/95 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-[0_-20px_60px_rgba(79,70,229,0.15)] overflow-hidden py-2"
                        >
                            <div className="px-4 py-2 border-b border-slate-100/50 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Language</span>
                            </div>
                            
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code, lang.name)}
                                    className={`w-full text-left px-4 py-2.5 text-xs font-bold flex justify-between items-center transition-colors
                                        ${currentLang === lang.name 
                                            ? 'bg-indigo-50/80 text-indigo-700' 
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                        }`}
                                >
                                    <span>{lang.localName}</span>
                                    {currentLang === lang.name && <Check size={14} className="text-indigo-500" />}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LanguageSwitcher;
