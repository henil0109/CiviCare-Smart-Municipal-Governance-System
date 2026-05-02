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
        } else {
            console.error("Google Translate not initialized yet.");
        }
        setIsOpen(false);
    };

    return (
        <div className="fixed top-24 right-6 z-50 font-outfit">
            <div className="flex flex-col items-end">
                {/* Tiny Label */}
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 mr-2">
                    Switch to local language
                </span>
                <div className="relative">
                {/* Floating Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(99,102,241,0.2)] hover:shadow-[0_8px_40px_rgba(99,102,241,0.3)] text-slate-700 px-4 py-3 rounded-full transition-all duration-300 hover:scale-105"
                >
                    <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 p-1.5 rounded-full text-white">
                        <Globe size={18} />
                    </div>
                    <span className="font-extrabold text-sm tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
                        {currentLang === 'Gujarati' ? 'ગુજરાતી' : 'English'}
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -15, scale: 0.95 }}
                            className="absolute top-full right-0 mt-3 w-48 bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-[0_20px_60px_rgba(79,70,229,0.15)] overflow-hidden py-2"
                        >
                            <div className="px-4 py-2 border-b border-slate-100/50 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Language</span>
                            </div>
                            
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code, lang.name)}
                                    className={`w-full text-left px-5 py-3 text-sm font-bold flex justify-between items-center transition-colors
                                        ${currentLang === lang.name 
                                            ? 'bg-indigo-50/80 text-indigo-700' 
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                        }`}
                                >
                                    <div className="flex flex-col">
                                        <span>{lang.localName}</span>
                                        {lang.name !== lang.localName && (
                                            <span className="text-[10px] text-slate-400 font-medium tracking-wide">{lang.name}</span>
                                        )}
                                    </div>
                                    {currentLang === lang.name && <Check size={16} className="text-indigo-500" />}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default LanguageSwitcher;
