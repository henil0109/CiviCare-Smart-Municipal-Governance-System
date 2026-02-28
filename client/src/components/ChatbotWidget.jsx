import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Rotating preview messages shown above the FAB
const PREVIEW_MESSAGES = [
    { emoji: '👋', text: "Hey! I'm CiviBot" },
    { emoji: '💬', text: 'Got a civic issue?' },
    { emoji: '🏙️', text: 'Ask me anything!' },
    { emoji: '📋', text: 'Report complaints here' },
    { emoji: '🆘', text: 'Emergency helplines?' },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function renderText(text) {
    const lines = text.split('\n');
    return lines.map((line, li) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
            <span key={li}>
                {parts.map((part, pi) =>
                    pi % 2 === 1 ? <strong key={pi} style={{ color: '#93c5fd' }}>{part}</strong> : part
                )}
                {li < lines.length - 1 && <br />}
            </span>
        );
    });
}

// Pulsing online dot
const OnlineDot = () => (
    <span style={{
        width: 8, height: 8, background: '#4ade80', borderRadius: '50%',
        display: 'inline-block', flexShrink: 0,
        boxShadow: '0 0 0 2px rgba(74,222,128,0.3)',
        animation: 'civipulse 2s ease-in-out infinite'
    }} />
);

// Bot avatar
const BotAvatar = ({ size = 32 }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #2563eb, #6366f1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.45, boxShadow: '0 2px 8px rgba(99,102,241,0.4)'
    }}>
        🤖
    </div>
);

// Typing dots
const TypingIndicator = () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <BotAvatar />
        <div className="civi-bubble-bot" style={{ padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
            {[0, 160, 320].map((delay, i) => (
                <span key={i} style={{
                    width: 7, height: 7, background: '#475569', borderRadius: '50%',
                    display: 'inline-block', animation: `civibounce 1.2s ease-in-out ${delay}ms infinite`
                }} />
            ))}
        </div>
    </div>
);

// Single message
const MessageBubble = ({ msg, onQuickReply, navigate }) => {
    const isBot = msg.role === 'bot';

    const handleQR = (qr) => {
        const lower = qr.toLowerCase();
        if (lower.includes('complaint form') || lower.includes('go to complaint')) return navigate('/complaint/new');
        if (lower.includes('my complaints') || lower.includes('view my complaint')) return navigate('/my-complaints');
        if (lower.includes('login') || lower.includes('🔐')) return navigate('/login');
        if (lower.includes('register') || lower.includes('📝 register')) return navigate('/register');
        if (lower.includes('goodbye')) return;
        onQuickReply(qr);
    };

    return (
        <motion.div
            style={{
                display: 'flex', gap: 8,
                flexDirection: isBot ? 'row' : 'row-reverse',
                alignItems: 'flex-end'
            }}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
        >
            {isBot && <BotAvatar />}

            <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className={isBot ? 'civi-bubble-bot' : 'civi-bubble-user'}
                    style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                    {renderText(msg.content)}
                </div>

                {/* Action buttons */}
                {isBot && msg.action === 'redirect_login' && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="civi-action-primary" onClick={() => navigate('/login')}>🔐 Login</button>
                        <button className="civi-action-ghost" onClick={() => navigate('/register')}>📝 Register Free</button>
                    </div>
                )}
                {isBot && msg.action === 'navigate' && (
                    <button className="civi-action-primary" onClick={() => navigate('/complaint/new')}>
                        📋 Open Complaint Form
                    </button>
                )}
                {isBot && msg.action === 'navigate_complaints' && (
                    <button className="civi-action-primary" onClick={() => navigate('/my-complaints')}>
                        🔍 View My Complaints
                    </button>
                )}

                {/* Quick replies */}
                {isBot && msg.quickReplies?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 2 }}>
                        {msg.quickReplies.map((qr, i) => (
                            <button key={i} className="civi-chip" onClick={() => handleQR(qr)}>{qr}</button>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ── Welcome card (shown before first open) ─────────────────────────────────
const WelcomeCard = ({ onOpen, previewIdx }) => {
    const pm = PREVIEW_MESSAGES[previewIdx % PREVIEW_MESSAGES.length];
    return (
        <motion.div
            className="civi-welcome-card"
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onClick={onOpen}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BotAvatar size={38} />
                <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: '#f1f5f9', lineHeight: 1.2 }}>
                        {pm.emoji} {pm.text}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                        Click to chat · Available 24/7
                    </div>
                </div>
                <button
                    style={{
                        marginLeft: 'auto', background: 'none', border: 'none', color: '#475569',
                        cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '2px 4px'
                    }}
                    onClick={e => { e.stopPropagation(); }}
                >
                    ‹
                </button>
            </div>
        </motion.div>
    );
};

// ── MAIN WIDGET ────────────────────────────────────────────────────────────
export default function ChatbotWidget({ user }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewIdx, setPreviewIdx] = useState(0);
    const [dismissed, setDismissed] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasGreeted, setHasGreeted] = useState(false);
    const [unread, setUnread] = useState(0);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Show preview bubble after 2s on first load
    useEffect(() => {
        const t = setTimeout(() => {
            if (!isOpen && !dismissed) setShowPreview(true);
        }, 2000);
        return () => clearTimeout(t);
    }, []);

    // Rotate preview message every 3s
    useEffect(() => {
        if (!showPreview) return;
        const t = setInterval(() => setPreviewIdx(i => i + 1), 3000);
        return () => clearInterval(t);
    }, [showPreview]);

    // Auto scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // On open
    useEffect(() => {
        if (isOpen) {
            setShowPreview(false);
            setUnread(0);
            setTimeout(() => inputRef.current?.focus(), 350);
            if (!hasGreeted) {
                sendToBot('hello');
                setHasGreeted(true);
            }
        }
    }, [isOpen]);

    const sendToBot = useCallback(async (text) => {
        const userMsg = { role: 'user', content: text, id: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        const token = localStorage.getItem('token');
        const hist = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));

        try {
            const res = await fetch(`${API_BASE}/api/chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` })
                },
                body: JSON.stringify({ message: text, history: hist })
            });
            const data = await res.json();
            await new Promise(r => setTimeout(r, 450));

            const botMsg = {
                role: 'bot',
                content: data.reply || "Sorry, something went wrong.",
                quickReplies: data.quick_replies || [],
                action: data.action || null,
                id: Date.now() + 1
            };
            setMessages(prev => [...prev, botMsg]);
            if (!isOpen) setUnread(p => p + 1);
        } catch {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: '⚠️ Connection issue. Please try again shortly.',
                quickReplies: ['🏠 Main Menu'],
                action: null, id: Date.now() + 1
            }]);
        } finally {
            setIsTyping(false);
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        const m = input.trim();
        if (!m || isTyping) return;
        setInput('');
        sendToBot(m);
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleRestart = () => {
        setMessages([]);
        setHasGreeted(false);
        setTimeout(() => { sendToBot('hello'); setHasGreeted(true); }, 50);
    };

    const handleOpen = () => { setIsOpen(true); setShowPreview(false); };
    const handleClose = () => { setIsOpen(false); setShowPreview(false); setDismissed(true); };

    return (
        <>
            <style>{`
        /* ── Base ── */
        .civi-root {
          position: fixed; bottom: 24px; right: 24px; z-index: 9999;
          display: flex; flex-direction: column; align-items: flex-end; gap: 10px;
          font-family: 'Outfit', system-ui, sans-serif;
        }

        /* ── Keyframes ── */
        @keyframes civipulse {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0.5;transform:scale(0.8)}
        }
        @keyframes civibounce {
          0%,60%,100%{transform:translateY(0)}
          30%{transform:translateY(-7px)}
        }
        @keyframes civishine {
          0%{background-position:200% center}
          100%{background-position:-200% center}
        }

        /* ── Welcome Card (speech bubble / cloud shape) ── */
        .civi-speech-wrap {
          position: relative;
          margin-bottom: 6px;
        }
        .civi-welcome-card {
          background: linear-gradient(145deg, #131c33 0%, #0d1526 100%);
          border: 1.5px solid rgba(99,102,241,0.35);
          /* Cloud-like asymmetric border-radius */
          border-radius: 22px 22px 22px 6px;
          padding: 14px 15px 12px;
          width: 235px;
          cursor: pointer;
          box-shadow:
            0 8px 32px rgba(0,0,0,0.4),
            0 0 0 1px rgba(255,255,255,0.03),
            inset 0 1px 0 rgba(255,255,255,0.06);
          backdrop-filter: blur(16px);
          animation: civiFloat 3s ease-in-out infinite;
          position: relative;
        }
        /* Triangle tail pointing down-right toward FAB */
        .civi-welcome-card::after {
          content: '';
          position: absolute;
          bottom: -10px;
          right: 22px;
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 0px solid transparent;
          border-top: 11px solid #1a2642;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        /* Border-match tail layer */
        .civi-welcome-card::before {
          content: '';
          position: absolute;
          bottom: -13px;
          right: 20px;
          width: 0;
          height: 0;
          border-left: 12px solid transparent;
          border-right: 0px solid transparent;
          border-top: 13px solid rgba(99,102,241,0.35);
          z-index: -1;
        }
        @keyframes civiFloat {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .civi-welcome-card:hover {
          box-shadow:
            0 12px 44px rgba(0,0,0,0.5),
            0 0 0 1px rgba(99,102,241,0.5),
            inset 0 1px 0 rgba(255,255,255,0.08);
          border-color: rgba(99,102,241,0.55);
        }
        /* Glowing top edge */
        .civi-card-glow {
          position: absolute;
          top: 0; left: 20px; right: 20px;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(99,102,241,0.6) 30%,
            rgba(147,197,253,0.8) 50%,
            rgba(99,102,241,0.6) 70%,
            transparent 100%);
          border-radius: 1px;
        }

        /* ── Chat Window ── */
        .civi-window {
          width: 370px;
          height: 580px;
          max-height: 82vh;
          background: #0b1120;
          border-radius: 22px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(99,102,241,0.2),
            0 24px 60px rgba(0,0,0,0.5),
            0 0 80px rgba(37,99,235,0.08);
        }

        /* ── Header ── */
        .civi-header {
          padding: 0;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .civi-header-bg {
          background: linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%);
          padding: 14px 16px 12px;
          display: flex;
          align-items: center;
          gap: 11px;
          position: relative;
        }
        .civi-header-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }
        .civi-header-avatar-wrap {
          position: relative; flex-shrink: 0;
        }
        .civi-header-avatar {
          width: 42px; height: 42px; border-radius: 14px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          box-shadow: 0 4px 12px rgba(99,102,241,0.5);
        }
        .civi-online-badge {
          position: absolute; bottom: -2px; right: -2px;
          width: 12px; height: 12px; border-radius: 50%;
          background: #4ade80;
          border: 2px solid #1e3a8a;
          animation: civipulse 2s infinite;
        }
        .civi-header-info { flex: 1 }
        .civi-header-name {
          font-size: 15px; font-weight: 800; color: white; letter-spacing: 0.2px;
        }
        .civi-header-status {
          font-size: 11.5px; color: rgba(255,255,255,0.55); margin-top: 1px;
          display: flex; align-items: center; gap: 5px;
        }
        .civi-header-actions { display: flex; gap: 5px; }
        .civi-hbtn {
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.8); width: 30px; height: 30px;
          border-radius: 9px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; transition: all 0.15s; flex-shrink: 0;
        }
        .civi-hbtn:hover { background: rgba(255,255,255,0.2); color: white; }

        /* Capability chips row */
        .civi-caps {
          background: rgba(0,0,0,0.25);
          padding: 8px 16px;
          display: flex; gap: 6px; overflow-x: auto;
          scrollbar-width: none;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .civi-caps::-webkit-scrollbar { display: none; }
        .civi-cap-pill {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 3px 10px;
          font-size: 11px; color: rgba(255,255,255,0.55);
          white-space: nowrap; cursor: pointer; transition: all 0.15s;
          flex-shrink: 0;
        }
        .civi-cap-pill:hover {
          background: rgba(99,102,241,0.2);
          border-color: rgba(99,102,241,0.4);
          color: #a5b4fc;
        }

        /* ── Messages ── */
        .civi-messages {
          flex: 1; overflow-y: auto; padding: 16px 14px;
          display: flex; flex-direction: column; gap: 14px;
          scroll-behavior: smooth;
        }
        .civi-messages::-webkit-scrollbar { width: 3px; }
        .civi-messages::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }

        /* Date divider */
        .civi-divider {
          text-align: center; font-size: 10.5px; color: #334155;
          position: relative; margin: 4px 0;
        }
        .civi-divider::before, .civi-divider::after {
          content: ''; position: absolute; top: 50%;
          width: 35%; height: 1px; background: #1e293b;
        }
        .civi-divider::before { left: 0 }
        .civi-divider::after { right: 0 }

        /* ── Bubbles ── */
        .civi-bubble-bot {
          background: #151f35;
          border: 1px solid rgba(255,255,255,0.06);
          color: #cbd5e1; border-radius: 18px 18px 18px 4px;
          padding: 10px 14px;
          word-break: break-word;
        }
        .civi-bubble-user {
          background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
          color: white; border-radius: 18px 18px 4px 18px;
          padding: 10px 14px;
          word-break: break-word;
          box-shadow: 0 4px 12px rgba(37,99,235,0.3);
        }

        /* ── Action buttons ── */
        .civi-action-primary {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          border: none; color: white; padding: 8px 14px;
          border-radius: 10px; cursor: pointer; font-size: 12.5px;
          font-weight: 600; transition: all 0.15s;
          font-family: 'Outfit', sans-serif;
          box-shadow: 0 3px 10px rgba(37,99,235,0.3);
        }
        .civi-action-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .civi-action-ghost {
          background: transparent; border: 1px solid #334155;
          color: #94a3b8; padding: 8px 14px;
          border-radius: 10px; cursor: pointer; font-size: 12.5px;
          font-weight: 600; transition: all 0.15s;
          font-family: 'Outfit', sans-serif;
        }
        .civi-action-ghost:hover { background: #1e293b; color: white; border-color: #4b5563; }

        /* ── Quick reply chips ── */
        .civi-chip {
          background: #0f172a; border: 1px solid #1e3a5f;
          color: #60a5fa; padding: 5px 11px;
          border-radius: 20px; font-size: 12px; cursor: pointer;
          transition: all 0.15s; white-space: nowrap;
          font-family: 'Outfit', sans-serif;
        }
        .civi-chip:hover {
          background: #1e3a8a; border-color: #2563eb; color: white;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(37,99,235,0.25);
        }

        /* ── Input ── */
        .civi-input-wrap {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 12px 12px 10px;
          background: #0b1120;
          display: flex; flex-direction: column; gap: 8px; flex-shrink: 0;
        }
        .civi-input-row {
          display: flex; align-items: center; gap: 8px;
          background: #151f35;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 4px 4px 4px 14px;
          transition: border-color 0.2s;
        }
        .civi-input-row:focus-within {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
        }
        .civi-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: #e2e8f0; font-size: 13.5px; font-family: 'Outfit', sans-serif;
          resize: none; max-height: 80px; overflow-y: auto; line-height: 1.5;
          padding: 6px 0;
        }
        .civi-input::placeholder { color: #334155; }
        .civi-send {
          width: 38px; height: 38px; flex-shrink: 0;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          border: none; border-radius: 11px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
          box-shadow: 0 2px 8px rgba(37,99,235,0.3);
        }
        .civi-send:hover:not(:disabled) { transform: scale(1.08); opacity: 0.9; }
        .civi-send:disabled { opacity: 0.35; cursor: not-allowed; }

        /* Footer hint row */
        .civi-footer-hint {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          font-size: 10.5px; color: #1e293b; padding-bottom: 2px;
        }

        /* ── FAB ── */
        .civi-fab {
          width: 58px; height: 58px; border-radius: 50%; border: none;
          cursor: pointer; position: relative; flex-shrink: 0;
          background: linear-gradient(135deg, #2563eb 0%, #6366f1 100%);
          box-shadow: 0 4px 20px rgba(37,99,235,0.45), 0 0 0 0 rgba(37,99,235,0.4);
          display: flex; align-items: center; justify-content: center;
          animation: civiringpulse 3s ease-in-out infinite;
        }
        @keyframes civiringpulse {
          0%,100%{box-shadow:0 4px 20px rgba(37,99,235,0.45),0 0 0 0 rgba(37,99,235,0)}
          50%{box-shadow:0 4px 20px rgba(37,99,235,0.45),0 0 0 10px rgba(37,99,235,0)}
        }
        .civi-fab:hover { transform: scale(1.06); }
        .civi-fab-badge {
          position: absolute; top: -4px; right: -4px;
          background: #ef4444; color: white; font-size: 10px; font-weight: 700;
          min-width: 18px; height: 18px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Outfit', sans-serif; border: 2px solid #0b1120;
          padding: 0 3px;
        }

        /* ── Responsive ── */
        @media (max-width: 420px) {
          .civi-root { bottom: 16px; right: 16px; }
          .civi-window { width: calc(100vw - 32px); max-height: 78vh; }
          .civi-welcome-card { width: calc(100vw - 100px); }
        }
      `}</style>

            <div className="civi-root">

                {/* Chat Window */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            className="civi-window"
                            initial={{ opacity: 0, scale: 0.88, y: 20, originX: 1, originY: 1 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.88, y: 20 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        >
                            {/* ─ Header ─ */}
                            <div className="civi-header">
                                <div className="civi-header-bg">
                                    <div className="civi-header-avatar-wrap">
                                        <div className="civi-header-avatar">🤖</div>
                                        <div className="civi-online-badge" />
                                    </div>
                                    <div className="civi-header-info">
                                        <div className="civi-header-name">CiviBot</div>
                                        <div className="civi-header-status">
                                            <OnlineDot />
                                            <span>Online · Municipal AI Assistant</span>
                                        </div>
                                    </div>
                                    <div className="civi-header-actions">
                                        <button className="civi-hbtn" title="Restart" onClick={handleRestart}>🔄</button>
                                        <button className="civi-hbtn" title="Close" onClick={handleClose}>✕</button>
                                    </div>
                                </div>

                                {/* Capability chips */}
                                <div className="civi-caps">
                                    {['📋 Complaints', '🔍 Track Status', '🆘 Emergency', '📞 Contact', '❓ FAQ', '🏛️ Info'].map((c, i) => (
                                        <button key={i} className="civi-cap-pill"
                                            onClick={() => sendToBot(c.substring(3))}>
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ─ Messages ─ */}
                            <div className="civi-messages">
                                <div className="civi-divider">Today</div>
                                {messages.map(msg => (
                                    <MessageBubble
                                        key={msg.id}
                                        msg={msg}
                                        onQuickReply={sendToBot}
                                        navigate={navigate}
                                    />
                                ))}
                                {isTyping && <TypingIndicator />}
                                <div ref={bottomRef} />
                            </div>

                            {/* ─ Input ─ */}
                            <div className="civi-input-wrap">
                                <div className="civi-input-row">
                                    <textarea
                                        ref={inputRef}
                                        className="civi-input"
                                        placeholder="Ask CiviBot anything..."
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKey}
                                        rows={1}
                                    />
                                    <button
                                        className="civi-send"
                                        onClick={handleSend}
                                        disabled={!input.trim() || isTyping}
                                    >
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                                            stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="civi-footer-hint">
                                    <span>⚡</span>
                                    <span style={{ color: '#334155' }}>Powered by CiviCare AI</span>
                                    <span style={{ color: '#1e293b' }}>·</span>
                                    <span style={{ color: '#1e293b' }}>Press Enter to send</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Preview / Welcome Speech Bubble */}
                <AnimatePresence mode="wait">
                    {showPreview && !isOpen && (
                        <div className="civi-speech-wrap">
                            <motion.div
                                key={`prev-${previewIdx}`}
                                className="civi-welcome-card"
                                initial={{ opacity: 0, scale: 0.8, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.85, y: 8 }}
                                transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                                onClick={handleOpen}
                            >
                                {/* Glowing top edge */}
                                <div className="civi-card-glow" />

                                {/* Top row: avatar + text + dismiss */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <BotAvatar size={36} />
                                        {/* sparkle */}
                                        <span style={{
                                            position: 'absolute', top: -5, right: -6,
                                            fontSize: 12, lineHeight: 1
                                        }}>✨</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <motion.div
                                            key={previewIdx}
                                            initial={{ opacity: 0, x: 8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.25 }}
                                            style={{ fontWeight: 700, fontSize: 13.5, color: '#f1f5f9', lineHeight: 1.3 }}
                                        >
                                            {PREVIEW_MESSAGES[previewIdx % PREVIEW_MESSAGES.length].emoji}{' '}
                                            {PREVIEW_MESSAGES[previewIdx % PREVIEW_MESSAGES.length].text}
                                        </motion.div>
                                        <div style={{
                                            fontSize: 11, color: '#475569', marginTop: 3,
                                            display: 'flex', alignItems: 'center', gap: 4
                                        }}>
                                            <OnlineDot />
                                            <span>Always online · Tap to chat</span>
                                        </div>
                                    </div>
                                    <button
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.07)',
                                            color: '#475569', cursor: 'pointer', fontSize: 14,
                                            width: 22, height: 22, borderRadius: 6,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0, transition: 'all 0.15s', lineHeight: 1
                                        }}
                                        onMouseOver={e => e.currentTarget.style.color = '#94a3b8'}
                                        onMouseOut={e => e.currentTarget.style.color = '#475569'}
                                        onClick={e => { e.stopPropagation(); setShowPreview(false); setDismissed(true); }}
                                        title="Dismiss"
                                    >×</button>
                                </div>

                                {/* Divider */}
                                <div style={{
                                    height: 1, background: 'rgba(255,255,255,0.05)',
                                    margin: '10px 0 8px'
                                }} />

                                {/* Mini quick-action pills */}
                                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                    {[
                                        { label: '📋 Complaint', msg: 'submit complaint' },
                                        { label: '🆘 Emergency', msg: 'emergency' },
                                        { label: '📞 Contact', msg: 'contact' }
                                    ].map((q, i) => (
                                        <button key={i}
                                            style={{
                                                background: 'rgba(37,99,235,0.12)',
                                                border: '1px solid rgba(37,99,235,0.28)',
                                                color: '#60a5fa', borderRadius: 20,
                                                padding: '4px 11px', fontSize: 11,
                                                cursor: 'pointer',
                                                fontFamily: 'Outfit, sans-serif',
                                                transition: 'all 0.15s', whiteSpace: 'nowrap'
                                            }}
                                            onMouseOver={e => {
                                                e.currentTarget.style.background = 'rgba(37,99,235,0.25)';
                                                e.currentTarget.style.color = '#93c5fd';
                                            }}
                                            onMouseOut={e => {
                                                e.currentTarget.style.background = 'rgba(37,99,235,0.12)';
                                                e.currentTarget.style.color = '#60a5fa';
                                            }}
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleOpen();
                                                setTimeout(() => sendToBot(q.msg), 600);
                                            }}
                                        >{q.label}</button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* FAB */}
                <motion.button
                    className="civi-fab"
                    onClick={() => isOpen ? handleClose() : handleOpen()}
                    whileTap={{ scale: 0.91 }}
                    title={isOpen ? 'Close CiviBot' : 'Chat with CiviBot'}
                >
                    {unread > 0 && !isOpen && (
                        <span className="civi-fab-badge">{unread > 9 ? '9+' : unread}</span>
                    )}
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.svg key="x" width="22" height="22" viewBox="0 0 24 24"
                                fill="none" stroke="white" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round"
                                initial={{ rotate: -80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 80, opacity: 0 }} transition={{ duration: 0.2 }}>
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </motion.svg>
                        ) : (
                            <motion.div key="bot"
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.6, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ fontSize: 26, lineHeight: 1 }}
                            >
                                🤖
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </>
    );
}
