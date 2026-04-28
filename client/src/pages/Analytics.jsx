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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

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

    if (loading) return <div className="p-10 text-center text-slate-500 font-outfit font-medium">Generating AI Report...</div>;
    if (!data) return <div className="p-10 text-center text-red-500 font-outfit font-bold">Failed to load analytics</div>;

    return (
        <div className="font-outfit pb-10">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                        <Activity size={20} />
                    </div>
                    System Intelligence & Analytics
                </h1>
                <p className="text-slate-500 mt-3 text-lg font-light max-w-2xl">
                    Real-time AI monitoring, predictions, and predictive maintenance reports.
                </p>
            </div>

            {/* AI Executive Summary */}
            <div className="mb-10 bg-white border border-indigo-100 rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6 text-indigo-600 font-black uppercase tracking-widest text-xs">
                        <Zap size={16} fill="currentColor" /> AI Executive Summary
                    </div>
                    <p className="text-xl md:text-2xl font-bold leading-relaxed text-slate-800">
                        "{data.summary}"
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10 border-t border-slate-100 pt-8">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Efficiency Score</p>
                            <p className="text-4xl font-extrabold text-indigo-600 tracking-tight">{data.efficiency_score}%</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Incidents</p>
                            <p className="text-4xl font-extrabold text-slate-900 tracking-tight">{data.total_complaints}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">System Status</p>
                            <p className="text-4xl font-extrabold text-emerald-500 tracking-tight">Online</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

                {/* Trend Prediction */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100 shrink-0">
                                <TrendingUp size={16} />
                            </div>
                            Complaint Volume Forecast
                        </h3>
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold border border-indigo-100 tracking-wide uppercase">Next 7 Days</span>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                                <ReTooltip
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
                                    labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', fontSize: '14px' }}
                                />
                                <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorActual)" name="Actual Load" />
                                <Area type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={4} strokeDasharray="6 6" fillOpacity={1} fill="url(#colorPred)" name="AI Predicted" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-center text-slate-400 mt-6 font-medium">AI Model predicts potential surges based on priority inputs.</p>
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h3 className="font-extrabold text-slate-900 text-lg mb-8 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center border border-purple-100 shrink-0">
                            <BarChart3 size={16} />
                        </div>
                        Incident Distribution
                    </h3>
                    <div className="h-72 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.category_dist}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.category_dist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <ReTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontWeight: 600, color: '#1e293b' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Future Alerts */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="font-extrabold text-slate-900 text-lg mb-8 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shrink-0">
                        <Shield size={16} />
                    </div>
                    Future Risk Assessment
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.alerts.length > 0 ? data.alerts.map((alert, idx) => (
                        <div key={idx} className={`p-6 rounded-2xl border flex items-start gap-4 ${alert.type === 'critical' ? 'bg-red-50 border-red-100 text-red-700 shadow-[0_4px_15px_rgba(220,38,38,0.05)]' :
                                alert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700 shadow-[0_4px_15px_rgba(245,158,11,0.05)]' :
                                    'bg-blue-50 border-blue-100 text-blue-700 shadow-[0_4px_15px_rgba(59,130,246,0.05)]'
                            }`}>
                            <div className="bg-white p-2 rounded-xl shadow-sm border border-inherit shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-widest mb-1 opacity-90">{alert.type} Alert</h4>
                                <p className="text-sm font-semibold">{alert.msg}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-1 md:col-span-2 text-center p-12 bg-slate-50 border border-slate-100 border-dashed rounded-3xl">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                                <Shield size={32} />
                            </div>
                            <h4 className="text-slate-900 font-extrabold text-lg mb-1">System Stable</h4>
                            <p className="text-slate-500 font-medium">No immediate future risks detected.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
