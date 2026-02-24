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
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-600/10 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center relative z-10 shadow-2xl"
            >
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader className="text-blue-400 animate-spin mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-white mb-2">Verifying...</h2>
                        <p className="text-blue-100">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="text-green-400" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Verified!</h2>
                        <p className="text-blue-100 mb-8">{message}</p>

                        <Link to="/login" className="w-full">
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                Proceed to Login
                            </Button>
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                            <XCircle className="text-red-400" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                        <p className="text-red-100 mb-8">{message}</p>

                        <div className="flex gap-4 w-full">
                            <Link to="/login" className="flex-1">
                                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/register" className="flex-1">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
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
