import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';


import Navbar from './components/Navbar';
import AdminLayout from './components/admin/AdminLayout'; // Import AdminLayout

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import UserProfile from './pages/UserProfile';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import SupervisorTasks from './pages/SupervisorTasks';
import About from './pages/About';
import Services from './pages/Services';
import ContactUs from './pages/ContactUs';
import SupervisorLayout from './components/supervisor/SupervisorLayout';
import TeamManagement from './pages/TeamManagement';
import CitizenManagement from './pages/CitizenManagement';
import AdminSettings from './pages/AdminSettings';
import Analytics from './pages/Analytics';
import AdminNotifications from './pages/AdminNotifications';
import ComplaintDetail from './pages/ComplaintDetail';
import AdminComplaints from './pages/AdminComplaints';
import AdminInquiries from './pages/AdminInquiries';
import MyComplaints from './pages/MyComplaints';
import ComplaintForm from './pages/ComplaintForm';
import Reports from './pages/Reports';
import ReportDocument from './pages/ReportDocument';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import MunicipalInfo from './pages/MunicipalInfo';
import ChatbotWidget from './components/ChatbotWidget';

// Protected Route Wrapper
const ProtectedRoute = ({ children, roleRequired }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (roleRequired && user.role !== roleRequired) {
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
};

// Layout for Public/User pages that includes Navbar
const PublicLayout = ({ user, setUser }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pt-24">
            <Navbar user={user} setUser={setUser} />
            <Outlet />
        </div>
    );
};

const AnimatedRoutes = ({ user, setUser }) => {
    const location = useLocation();

    return (
        <AnimatePresence mode='wait'>
            <Routes location={location} key={location.pathname}>
                {/* Public & User Routes */}
                <Route element={<PublicLayout user={user} setUser={setUser} />}>
                    <Route path="/" element={<Home user={user} />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <UserDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/login" element={<Login setUser={setUser} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify" element={<VerifyEmail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/info" element={<MunicipalInfo />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/contact" element={<ContactUs />} />

                    <Route path="/my-complaints" element={
                        <ProtectedRoute>
                            <MyComplaints />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <UserProfile />
                        </ProtectedRoute>
                    } />
                    <Route path="/complaint/new" element={
                        <ProtectedRoute>
                            <ComplaintForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/complaints/:id" element={
                        <ProtectedRoute>
                            <ComplaintDetail />
                        </ProtectedRoute>
                    } />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute roleRequired="admin">
                        <AdminLayout />
                    </ProtectedRoute>
                }>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="team" element={<TeamManagement />} />
                    <Route path="citizens" element={<CitizenManagement />} />
                    <Route path="complaints" element={<AdminComplaints />} />
                    <Route path="inquiries" element={<AdminInquiries />} />
                    <Route path="complaints/:id" element={<ComplaintDetail />} />
                    <Route path="notifications" element={<AdminNotifications />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="reports/:id" element={<ReportDocument />} />
                    <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Supervisor Routes */}
                <Route path="/supervisor" element={
                    <ProtectedRoute roleRequired="supervisor">
                        <SupervisorLayout user={user} setUser={setUser} />
                    </ProtectedRoute>
                }>
                    <Route path="dashboard" element={<SupervisorDashboard />} />
                    <Route path="tasks" element={<SupervisorTasks />} />
                    <Route path="complaints/:id" element={<ComplaintDetail />} />
                    <Route path="team" element={<TeamManagement />} />
                    <Route path="history" element={<Reports />} />
                    <Route path="reports/:id" element={<ReportDocument />} />
                </Route>
            </Routes>
        </AnimatePresence>
    );

};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 bg-red-50 text-red-900 border border-red-200 m-10 rounded-xl">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
                    <details className="whitespace-pre-wrap">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <ErrorBoundary>
            <Router>
                <AnimatedRoutes user={user} setUser={setUser} />
                <ChatbotWidget user={user} />
            </Router>
        </ErrorBoundary>
    );
}

export default App;
