import { motion } from 'framer-motion';

const Card = ({ children, className = '', ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
