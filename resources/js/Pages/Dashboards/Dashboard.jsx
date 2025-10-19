import React, { useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { TrendingUp, Users, BookOpen, Activity, BarChart3 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard = () => {
  // KPI Stats with trends
  const stats = useMemo(() => [
    {
      id: 'homophones',
      value: '120',
      label: 'Total Homophones',
      trend: '+18%',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      id: 'quizzes',
      value: '15',
      label: 'Quizzes Created',
      trend: '+12%',
      icon: Activity,
      color: 'from-green-500 to-green-600',
      borderColor: 'border-green-200',
    },
    {
      id: 'students',
      value: '44',
      label: 'Students Registered',
      trend: '+8%',
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      borderColor: 'border-orange-200',
    },
    {
      id: 'sessions',
      value: '87',
      label: 'Practice Sessions',
      trend: '+24%',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      borderColor: 'border-purple-200',
    },
  ], []);

  // Weekly activity data
  const weeklyData = useMemo(() => [
    { day: 'Mon', sessions: 12, engagement: 65 },
    { day: 'Tue', sessions: 19, engagement: 78 },
    { day: 'Wed', sessions: 15, engagement: 72 },
    { day: 'Thu', sessions: 25, engagement: 88 },
    { day: 'Fri', sessions: 22, engagement: 82 },
    { day: 'Sat', sessions: 28, engagement: 92 },
    { day: 'Sun', sessions: 18, engagement: 75 },
  ], []);

  // Top performing quizzes
  const quizData = useMemo(() => [
    { name: 'Their/There/They\'re', value: 320, color: '#3b82f6' },
    { name: 'To/Too/Two', value: 280, color: '#10b981' },
    { name: 'Your/You\'re', value: 220, color: '#f59e0b' },
    { name: 'Accept/Except', value: 180, color: '#8b5cf6' },
  ], []);

  // Student performance by level
  const levelData = useMemo(() => [
    { level: 'Beginner', students: 18, color: '#ef4444' },
    { level: 'Intermediate', students: 16, color: '#f59e0b' },
    { level: 'Advanced', students: 10, color: '#10b981' },
  ], []);

  const StatCard = ({ stat }) => {
    const Icon = stat.icon;
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${stat.borderColor} hover:shadow-lg transition-shadow`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</h3>
            <p className="text-green-600 text-sm font-semibold mt-2">
              <TrendingUp className="inline w-4 h-4 mr-1" />
              {stat.trend} vs last month
            </p>
          </div>
          <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg text-white`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your homophone learning analytics.</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => <StatCard key={stat.id} stat={stat} />)}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
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
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="sessions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSessions)" />
              <Area type="monotone" dataKey="engagement" stroke="#10b981" fillOpacity={1} fill="url(#colorEngagement)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Quizzes Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Top Quizzes</h2>
            <p className="text-gray-600 text-sm mt-1">By attempts</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={quizData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name.split('/')[0]}: ${value}`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {quizData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} attempts`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row - Bar Chart and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Quiz Performance</h2>
            <p className="text-gray-600 text-sm mt-1">Completion by difficulty level</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={levelData} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="level" type="category" stroke="#9ca3af" width={140} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Bar dataKey="students" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            <p className="text-gray-600 text-sm mt-1">Latest student interactions</p>
          </div>
          <div className="space-y-4">
            {[
              { student: 'John Doe', action: 'Completed "Their/There/They\'re"', time: '2 hours ago', status: 'success' },
              { student: 'Jane Smith', action: 'Started "To/Too/Two" quiz', time: '4 hours ago', status: 'pending' },
              { student: 'Mike Johnson', action: 'Completed "Your/You\'re"', time: '1 day ago', status: 'success' },
              { student: 'Sarah Lee', action: 'Scored 95% on practice session', time: '2 days ago', status: 'success' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.student}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    activity.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {activity.status === 'success' ? '✓ Done' : 'Pending'}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default Dashboard;