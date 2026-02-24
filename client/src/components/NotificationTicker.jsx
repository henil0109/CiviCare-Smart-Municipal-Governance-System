import { Bell } from 'lucide-react';

const NotificationTicker = () => {
    const notifications = [
        "🚧 Road maintenance scheduled for Ward 5 on Monday.",
        "🌧️ Heavy rain alert: Please avoid low-lying areas.",
        "💡 Power outage in Sector 12 from 2PM to 4PM tomorrow.",
        "💉 Vaccination drive at City Hospital this weekend."
    ];

    return (
        <div className="bg-blue-900 text-white py-3 px-4 rounded-xl mb-8 flex items-center shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 font-bold whitespace-nowrap mr-6 text-secondary">
                <Bell size={20} />
                <span>Updates:</span>
            </div>
            <div className="w-full overflow-hidden">
                <div className="animate-marquee whitespace-nowrap inline-block text-sm md:text-base">
                    {notifications.map((note, i) => (
                        <span key={i} className="mx-8">• {note}</span>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {notifications.map((note, i) => (
                        <span key={`dup-${i}`} className="mx-8">• {note}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotificationTicker;
