import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { Link } from 'react-router-dom';

const slides = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
        title: "Empowering Citizens, Improving Cities",
        description: "Report issues, track progress, and contribute to a better community.",
        cta: "Submit Complaint",
        link: "/complaint/new"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2613&auto=format&fit=crop",
        title: "Transparent & Efficient Governance",
        description: "Track the status of your complaints in real-time with our AI-powered system.",
        cta: "Track Status",
        link: "/my-complaints"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2070&auto=format&fit=crop",
        title: "Building a Smarter Future",
        description: "Join hands with the municipality to maintain hygiene, safety, and infrastructure.",
        cta: "Learn More",
        link: "/info"
    }
];

const HeroSlider = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-[500px] w-full overflow-hidden rounded-2xl shadow-xl mb-12">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${slides[index].image})` }}
                    />
                    <div className="absolute inset-0 bg-black/50" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl md:text-6xl font-bold mb-4"
                        >
                            {slides[index].title}
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg md:text-xl mb-8 max-w-2xl"
                        >
                            {slides[index].description}
                        </motion.p>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Link to={slides[index].link}>
                                <Button className="bg-secondary text-white hover:bg-opacity-90 px-8 py-3 text-lg">
                                    {slides[index].cta}
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`w-3 h-3 rounded-full transition-all ${i === index ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
