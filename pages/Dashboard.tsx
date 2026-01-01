import React, { useEffect, useState } from 'react';
import { User, Goal, GoalStatus } from '../types';
import { db } from '../services/mockDataService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Target, Award, TrendingUp, Clock, MessageSquare } from 'lucide-react';

interface DashboardProps {
  user: User;
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  
  useEffect(() => {
    const load = async () => {
      const g = await db.getGoals(user.id);
      setGoals(g);
    };
    load();
  }, [user.id]);

  const stats = [
    { label: 'Active Goals', value: goals.filter(g => g.status === GoalStatus.IN_PROGRESS).length, icon: Target, color: 'bg-blue-500' },
    { label: 'Completed', value: goals.filter(g => g.status === GoalStatus.COMPLETED).length, icon: Award, color: 'bg-green-500' },
    { label: 'Pending Reviews', value: 1, icon: Clock, color: 'bg-amber-500' },
    { label: 'Avg Rating', value: '4.2', icon: TrendingUp, color: 'bg-purple-500' },
  ];

  const chartData = goals.map(g => ({
    name: g.title.substring(0, 15) + '...',
    progress: g.progress
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.name.split(' ')[0]} 👋</h1>
        <p className="text-slate-500">Here's what's happening with your performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
              <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Goal Progress</h2>
            <button 
              onClick={() => onNavigate('goals')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.progress === 100 ? '#22c55e' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => onNavigate('goals')}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-blue-300 transition-all flex items-center space-x-3"
            >
              <div className="bg-blue-100 p-2 rounded-md"><Target size={18} className="text-blue-600"/></div>
              <span className="font-medium text-slate-700">Add New Goal</span>
            </button>
             <button 
               onClick={() => onNavigate('feedback')}
               className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-purple-300 transition-all flex items-center space-x-3"
             >
              <div className="bg-purple-100 p-2 rounded-md"><MessageSquare size={18} className="text-purple-600"/></div>
              <span className="font-medium text-slate-700">Request Feedback</span>
            </button>
             <button 
               onClick={() => onNavigate('appraisals')}
               className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-green-300 transition-all flex items-center space-x-3"
             >
              <div className="bg-green-100 p-2 rounded-md"><Award size={18} className="text-green-600"/></div>
              <span className="font-medium text-slate-700">Self Assessment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;