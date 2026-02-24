import { motion } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';

const GamificationCard = ({ xp = 2450, level = 4, nextLevelXp = 3000, rank = "Novice Citizen" }) => {
    const progress = (xp / nextLevelXp) * 100;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl"
        >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-blue-200 font-medium mb-1">Current Status</h3>
                    <div className="flex items-center gap-2">
                        <Trophy className="text-yellow-400" size={24} />
                        <span className="text-3xl font-bold">Level {level}</span>
                    </div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-sm font-medium border border-white/10">
                    {rank}
                </div>
            </div>

            <div className="relative pt-4">
                <div className="flex justify-between text-sm mb-2 text-blue-200">
                    <span>{xp} XP</span>
                    <span>{nextLevelXp} XP</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-4 overflow-hidden border border-white/10">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 relative"
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse" />
                    </motion.div>
                </div>
                <p className="text-center mt-3 text-sm text-blue-200 flex items-center justify-center gap-2">
                    <Zap size={14} className="text-yellow-400" />
                    {nextLevelXp - xp} XP to next level
                </p>
            </div>
        </motion.div>
    );
};

export default GamificationCard;
