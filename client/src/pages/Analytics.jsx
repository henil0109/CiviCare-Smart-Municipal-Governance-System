import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Activity,
    Zap,
    TrendingUp,
    AlertTriangle,
    BarChart3,
    Shield
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/admin/analytics', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Generating AI Report...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Failed to load analytics</div>;

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="text-blue-600" /> System Intelligence & Analytics
                </h1>
                <p className="text-gray-500 mt-1">Real-time AI monitoring, predictions, and predictive maintenance reports.</p>
            </div>

            {/* AI Executive Summary */}
            <div className="mb-8 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-purple-200 font-bold uppercase tracking-wider text-xs">
                        <Zap size={14} /> AI Executive Summary
                    </div>
                    <p className="text-lg md:text-xl font-medium leading-relaxed opacity-95">
                        "{data.summary}"
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 border-t border-white/10 pt-6">
                        <div>
                            <p className="text-purple-300 text-xs uppercase mb-1">Efficiency Score</p>
                            <p className="text-3xl font-bold">{data.efficiency_score}%</p>
                        </div>
                        <div>
                            <p className="text-purple-300 text-xs uppercase mb-1">Total Incidents</p>
                            <p className="text-3xl font-bold">{data.total_complaints}</p>
                        </div>
                        <div>
                            <p className="text-purple-300 text-xs uppercase mb-1">System Status</p>
                            <p className="text-3xl font-bold text-green-400">Online</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                {/* Trend Prediction */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp size={20} className="text-gray-400" /> Complaint Volume Forecast
                        </h3>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium">Next 7 Days</span>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.trends}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <ReTooltip />
                                <Area type="monotone" dataKey="actual" stroke="#8884d8" fillOpacity={1} fill="url(#colorActual)" name="Actual Load" />
                                <Area type="monotone" dataKey="predicted" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPred)" name="AI Predicted" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-4">AI Model predicts potential surges based on priority inputs.</p>
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-gray-400" /> Incident Distribution
                    </h3>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.category_dist}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.category_dist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <ReTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Future Alerts */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Shield size={20} className="text-gray-400" /> Future Risk Assessment
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.alerts.length > 0 ? data.alerts.map((alert, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${alert.type === 'critical' ? 'bg-red-50 border-red-100 text-red-700' :
                                alert.type === 'warning' ? 'bg-orange-50 border-orange-100 text-orange-700' :
                                    'bg-blue-50 border-blue-100 text-blue-700'
                            }`}>
                            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm uppercase mb-1">{alert.type} Alert</h4>
                                <p className="text-sm">{alert.msg}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-2 text-center p-8 text-gray-400 bg-gray-50 rounded-xl">
                            System stable. No immediate future risks detected.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
