import { motion } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';

const GamificationCard = ({ xp = 2450, level = 4, nextLevelXp = 3000, rank = "Novice Citizen" }) => {
    const progress = (xp / nextLevelXp) * 100;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-[2rem] p-8 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-full flex flex-col justify-between"
        >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-bl-full -mr-10 -mt-10 blur-xl pointer-events-none" />

            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h3 className="text-slate-500 font-semibold mb-1 uppercase tracking-wider text-xs">Current Status</h3>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-sm border border-amber-100 shrink-0">
                            <Trophy size={24} />
                        </div>
                        <span className="text-4xl font-extrabold text-slate-900 tracking-tight">Level {level}</span>
                    </div>
                </div>
                <div className="bg-blue-50 text-blue-700 rounded-full px-4 py-1.5 text-sm font-bold border border-blue-100 shadow-sm">
                    {rank}
                </div>
            </div>

            <div className="relative pt-4 mt-auto z-10">
                <div className="flex justify-between text-sm mb-3 font-bold text-slate-700">
                    <span>{xp} XP</span>
                    <span className="text-slate-400">{nextLevelXp} XP</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200/50 inset-shadow-sm">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 relative rounded-full"
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse" />
                    </motion.div>
                </div>
                <p className="text-center mt-4 text-sm text-slate-500 flex items-center justify-center gap-2 font-medium">
                    <Zap size={16} className="text-amber-500 fill-amber-500" />
                    <span className="text-slate-700 font-bold">{nextLevelXp - xp} XP</span> to next level
                </p>
            </div>
        </motion.div>
    );
};

export default GamificationCard;
