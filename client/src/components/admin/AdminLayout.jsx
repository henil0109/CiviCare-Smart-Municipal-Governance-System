import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import EmergencyAlertModal from './EmergencyAlertModal';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [emergencyComplaint, setEmergencyComplaint] = useState(null);

    // Persist dismissed IDs in sessionStorage so they survive tab navigation
    const getIgnoredIds = () => {
        try { return JSON.parse(sessionStorage.getItem('dismissedEmergencies') || '[]'); }
        catch { return []; }
    };
    const addIgnoredId = (id) => {
        const ids = getIgnoredIds();
        if (!ids.includes(id)) sessionStorage.setItem('dismissedEmergencies', JSON.stringify([...ids, id]));
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    // Poll for Emergencies — only truly NEW High+Pending complaints, not already actioned ones
    useEffect(() => {
        const checkEmergencies = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/complaints', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const dismissed = getIgnoredIds();
                // Must be High priority AND still genuinely pending (not dispatched/in-progress/resolved/rejected)
                const actionableStatuses = ['Pending'];
                const emergency = res.data.find(c =>
                    c.priority === 'High' &&
                    actionableStatuses.includes(c.status) &&
                    !dismissed.includes(c._id) &&
                    !c.assigned_team &&       // skip if team already assigned
                    !c.assigned_supervisor    // skip if supervisor already assigned
                );

                setEmergencyComplaint(prev => {
                    // Don't re-trigger if already showing the same complaint
                    if (prev && prev._id === emergency?._id) return prev;
                    return emergency || null;
                });
            } catch (err) {
                console.error("Emergency Poll Error:", err);
            }
        };

        const interval = setInterval(checkEmergencies, 15000);
        checkEmergencies();

        return () => clearInterval(interval);
    }, []);

    const handleVerifyEmergency = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/complaints/${id}`, {
                status: 'In Progress',
                remark: 'Emergency verified & team deployed by admin.'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            addIgnoredId(id);
            setEmergencyComplaint(null);
            alert("Emergency Verified & Team Dispatched!");
        } catch (err) {
            console.error(err);
            alert("Failed to verify emergency");
        }
    };

    const handleDismiss = () => {
        if (emergencyComplaint) {
            addIgnoredId(emergencyComplaint._id);
            setEmergencyComplaint(null);
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex-1 md:ml-64 transition-all duration-300">
                <AdminHeader toggleSidebar={toggleSidebar} />

                <main className="p-6 md:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Global Emergency Alert */}
            {emergencyComplaint && (
                <EmergencyAlertModal
                    complaint={emergencyComplaint}
                    onClose={handleDismiss}
                    onVerify={handleVerifyEmergency}
                />
            )}
        </div>
    );
};

export default AdminLayout;
