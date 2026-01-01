import React, { useEffect, useState } from 'react';
import { User, Goal, GoalStatus } from '../types';
import { db } from '../services/mockDataService';
import { GeminiService } from '../services/geminiService';
import { Plus, Sparkles, Check, Trash2, Calendar, Target as TargetIcon } from 'lucide-react';

interface GoalsProps {
  user: User;
}

const Goals: React.FC<GoalsProps> = ({ user }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // New Goal Form State
  const [draftGoal, setDraftGoal] = useState('');
  const [smartSuggestion, setSmartSuggestion] = useState<any>(null);
  const [isRefining, setIsRefining] = useState(false);

  useEffect(() => {
    loadGoals();
  }, [user.id]);

  const loadGoals = async () => {
    const data = await db.getGoals(user.id);
    setGoals(data);
  };

  const handleSmartify = async () => {
    if (!draftGoal) return;
    setIsRefining(true);
    try {
      const suggestion = await GeminiService.makeGoalSmart(draftGoal);
      setSmartSuggestion(suggestion);
    } catch (e) {
      alert("Failed to generate suggestion. Please check API Key.");
    }
    setIsRefining(false);
  };

  const handleSaveGoal = async () => {
    setLoading(true);
    const goalData = smartSuggestion || {
      title: draftGoal,
      description: 'Manual entry',
      metric: 'N/A',
      deadline: '2024-12-31'
    };

    await db.createGoal({
      userId: user.id,
      title: goalData.title,
      description: goalData.description,
      metric: goalData.metric || 'N/A',
      deadline: goalData.timebound || '2024-12-31',
      status: GoalStatus.NOT_STARTED,
      progress: 0
    });
    
    setLoading(false);
    setIsModalOpen(false);
    setDraftGoal('');
    setSmartSuggestion(null);
    loadGoals();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Goals</h1>
          <p className="text-slate-500">Track and manage your objectives.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={18} />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid gap-4">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-900">{goal.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                    ${goal.status === GoalStatus.COMPLETED ? 'bg-green-100 text-green-800' : 
                      goal.status === GoalStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                    {goal.status}
                  </span>
                </div>
                <p className="text-slate-600">{goal.description}</p>
              </div>
              <div className="text-slate-400">
                {goal.progress}%
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
              <div 
                className={`h-2 rounded-full ${goal.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-slate-500">
               <div className="flex items-center space-x-1">
                 <TargetIcon size={14} />
                 <span>{goal.metric}</span>
               </div>
               <div className="flex items-center space-x-1">
                 <Calendar size={14} />
                 <span>Due: {goal.deadline}</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">Create New Goal</h2>
            
            {!smartSuggestion ? (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Describe your goal roughly:</label>
                <textarea 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                  placeholder="e.g., I want to learn React better and rewrite the dashboard."
                  value={draftGoal}
                  onChange={(e) => setDraftGoal(e.target.value)}
                />
                
                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Sparkles size={20} />
                    <span className="font-medium">Use AI to make it SMART</span>
                  </div>
                  <button 
                    onClick={handleSmartify}
                    disabled={!draftGoal || isRefining}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {isRefining ? 'Refining...' : 'Refine Goal'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 space-y-3">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="text-green-600 mt-1" size={20} />
                    <div>
                      <h3 className="font-bold text-green-900">AI Suggestion</h3>
                      <p className="text-green-800 text-sm mt-1">{smartSuggestion.reasoning}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4 bg-white p-3 rounded border border-green-100">
                    <p className="text-sm"><span className="font-bold">Title:</span> {smartSuggestion.title}</p>
                    <p className="text-sm"><span className="font-bold">Specific:</span> {smartSuggestion.description}</p>
                    <p className="text-sm"><span className="font-bold">Measurable:</span> {smartSuggestion.metric}</p>
                    <p className="text-sm"><span className="font-bold">Time-bound:</span> {smartSuggestion.timebound}</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={handleSaveGoal} 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
                  >
                    Accept & Save
                  </button>
                  <button 
                    onClick={() => setSmartSuggestion(null)} 
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
                  >
                    Edit Draft
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
               <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-700 text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
