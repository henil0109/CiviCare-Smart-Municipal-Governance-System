import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import Button from '../components/ui/Button';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');
    const hasRun = useRef(false); // Ref to prevent double-fire in StrictMode

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token found.');
            return;
        }

        if (hasRun.current) return;
        hasRun.current = true;

        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        try {
            await axios.post('/api/auth/verify', { token });
            setStatus('success');
            setMessage('Email verification successful! You can now log in.');
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Verification failed or link expired.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-outfit">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-100/50 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white rounded-3xl border border-slate-100 p-10 text-center relative z-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
            >
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader className="text-blue-600 animate-spin mb-6" size={48} />
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Verifying...</h2>
                        <p className="text-slate-500">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
                            <CheckCircle className="text-emerald-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Verified!</h2>
                        <p className="text-slate-500 mb-8 text-lg">{message}</p>

                        <Link to="/login" className="w-full">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 shadow-[0_8px_20px_rgba(16,185,129,0.2)]">
                                Proceed to Login
                            </Button>
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
                            <XCircle className="text-red-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Verification Failed</h2>
                        <p className="text-slate-500 mb-8">{message}</p>

                        <div className="flex gap-4 w-full">
                            <Link to="/login" className="flex-1">
                                <Button className="w-full bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl h-12">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/register" className="flex-1">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 shadow-[0_8px_20px_rgba(37,99,235,0.2)]">
                                    Register Again
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
