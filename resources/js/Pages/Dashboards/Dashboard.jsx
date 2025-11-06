import React, { useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { TrendingUp, Users, BookOpen, Activity, BarChart3 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { usePage } from '@inertiajs/react';

const Dashboard = () => {
  const { props } = usePage();

  // KPI Stats with trends
  const stats = useMemo(() => {
    const s = props?.stats || {};
    return [
      {
        id: 'homophones',
        value: s?.homophones?.count ?? '—',
        label: 'Total Homophones',
        trend: s?.homophones?.change ?? '+0%',
        icon: BookOpen,
        color: 'text-blue-500',
        borderColor: 'border-blue-100',
        bgColor: 'bg-blue-50',
      },
      {
        id: 'quizzes',
        value: s?.quizzes?.count ?? '—',
        label: 'Quizzes Created',
        trend: s?.quizzes?.change ?? '+0%',
        icon: Activity,
        color: 'text-green-500',
        borderColor: 'border-green-100',
        bgColor: 'bg-green-50',
      },
      {
        id: 'students',
        value: s?.students?.count ?? '—',
        label: 'Students Registered',
        trend: s?.students?.change ?? '+0%',
        icon: Users,
        color: 'text-orange-500',
        borderColor: 'border-orange-100',
        bgColor: 'bg-orange-50',
      },
      {
        id: 'sessions',
        value: s?.sessions?.count ?? '—',
        label: 'Student Vs No-Permission',
        trend: s?.sessions?.change ?? '+0%',
        icon: BarChart3,
        color: 'text-purple-500',
        borderColor: 'border-purple-100',
        bgColor: 'bg-purple-50',
      },
      {
        id: 'activeUsers',
        value: s?.activeUsers?.count ?? '—',
        label: 'Active Users (7d)',
        trend: s?.activeUsers?.change ?? '+0%',
        icon: Users,
        color: 'text-sky-500',
        borderColor: 'border-sky-100',
        bgColor: 'bg-sky-50',
      },
      {
        id: 'avgWords',
        value: s?.avgWords?.count ?? '—',
        label: 'Avg Words/Check (7d)',
        trend: s?.avgWords?.change ?? '+0%',
        icon: Activity,
        color: 'text-emerald-500',
        borderColor: 'border-emerald-100',
        bgColor: 'bg-emerald-50',
      },
    ];
  }, [props?.stats]);

  // Weekly activity data
  const weeklyData = useMemo(() => props?.weeklyData ?? [], [props?.weeklyData]);

  // Top Articles by checks
  const quizColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
  const quizData = useMemo(() => {
    const list = props?.topArticles ?? [];
    return list.map((q, idx) => ({
      name: q.name,
      value: q.attempts ?? q.value ?? 0,
      color: quizColors[idx % quizColors.length],
    }));
  }, [props?.topArticles]);

  // Comparison datasets: Student vs No-Role from GrammarChecker
  const cmp = props?.comparison || {};
  const trendData = useMemo(() => cmp.trend7d || [], [cmp.trend7d]);
  const distributionData = useMemo(() => (cmp.distribution || []).map((d, i) => ({
    ...d,
    color: i === 0 ? '#2563eb' : '#f97316',
  })), [cmp.distribution]);

  // Grouped Bar data: Avg Words/Check and Avg Checks/User
  const barCompareData = useMemo(() => {
    const avgWords = cmp?.avgWordPerCheck || {};
    const avgChecks = cmp?.avgChecksPerUser || {};
    return [
      {
        metric: 'Avg Words/Check',
        Student: Number(avgWords.student ?? 0),
        'No Role': Number(avgWords.norole ?? 0),
      },
      {
        metric: 'Avg Checks/User',
        Student: Number(avgChecks.student ?? 0),
        'No Role': Number(avgChecks.norole ?? 0),
      },
    ];
  }, [cmp?.avgWordPerCheck, cmp?.avgChecksPerUser]);

  const StatCard = ({ stat }) => {
    const Icon = stat.icon;
    return (
      <div className={`bg-white px-3 pb-2 pt-3 border-l-4 ${stat.borderColor} shadow-sm rounded-xl flex flex-col hover:shadow-md transition-shadow duration-200`}>
        <div className="flex items-center justify-between">
          <p className="text-gray-800 text-sm font-semibold">
            {stat.label}
          </p>
          <div className={`${stat.color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-1">
          <h2 className="text-2xl font-bold text-gray-900">
            {stat.value}
          </h2>
          <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            {stat.trend} vs last month
          </p>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="bg-gray-50 min-h-screen p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">Welcome back! Here's your homophone learning analytics.</p>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {stats.map((stat) => <StatCard key={stat.id} stat={stat} />)}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Activity Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Activity Overview</h2>
              <p className="text-gray-600 text-sm mt-1">Sessions and engagement last 7 days</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="sessions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSessions)" />
                <Area type="monotone" dataKey="engagement" stroke="#10b981" fillOpacity={1} fill="url(#colorEngagement)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Articles Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Top Articles</h2>
              <p className="text-gray-600 text-sm mt-1">By checks</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={quizData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name.split('/')[0]}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  style={{ fontSize: '11px' }}
                >
                  {quizData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value} checks`}
                  contentStyle={{ 
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparison: Student vs No-Role */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Trend Line Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Engagement Trend (7d)</h2>
              <p className="text-gray-600 text-sm mt-1">Student vs No-Role checks</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="student" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Student" />
                <Line type="monotone" dataKey="norole" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="No Role" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution Pie */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Checks Distribution</h2>
              <p className="text-gray-600 text-sm mt-1">Share of checks by group</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={distributionData} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false}
                     label={({ name, value }) => `${name}: ${value}` }>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cmp-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grouped Bar: KPI Comparison */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">KPI Comparison</h2>
            <p className="text-gray-600 text-sm mt-1">Student vs No-Role on Avg Words/Check and Avg Checks/User</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barCompareData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="metric" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="Student" fill="#2563eb" radius={[4,4,0,0]} />
              <Bar dataKey="No Role" fill="#f97316" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;