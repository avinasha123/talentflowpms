import React, { useEffect, useState } from 'react';
import { User, Appraisal, ReviewStatus } from '../types';
import { db } from '../services/mockDataService';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface AppraisalsProps {
  user: User;
}

const Appraisals: React.FC<AppraisalsProps> = ({ user }) => {
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [activeReview, setActiveReview] = useState<Appraisal | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await db.getAppraisals(user.id);
      setAppraisals(data);
    };
    load();
  }, [user.id]);

  const StatusBadge = ({ status }: { status: ReviewStatus }) => {
    const styles = {
      [ReviewStatus.DRAFT]: 'bg-slate-100 text-slate-600',
      [ReviewStatus.SUBMITTED]: 'bg-blue-100 text-blue-600',
      [ReviewStatus.REVIEWED]: 'bg-purple-100 text-purple-600',
      [ReviewStatus.FINALIZED]: 'bg-green-100 text-green-600',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Performance Appraisals</h1>
          <p className="text-slate-500">View past reviews and complete pending assessments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of Reviews */}
        <div className="lg:col-span-1 space-y-4">
          {appraisals.map(app => (
            <div 
              key={app.id}
              onClick={() => setActiveReview(app)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeReview?.id === app.id 
                  ? 'bg-blue-50 border-blue-500 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-900">{app.cycle} Review</h3>
                <StatusBadge status={app.status} />
              </div>
              <p className="text-sm text-slate-500 mb-2">Submitted: {app.submittedAt || 'Pending'}</p>
            </div>
          ))}
          {appraisals.length === 0 && (
             <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
               <p className="text-slate-500">No appraisals found.</p>
             </div>
          )}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2">
          {activeReview ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">{activeReview.cycle} Performance Review</h2>
                <p className="text-slate-500">Review details and feedback.</p>
              </div>

              {/* Self Assessment Section */}
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <CheckCircle size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Self Assessment</h3>
                </div>
                
                <div className="space-y-4 pl-4 border-l-2 border-blue-100 ml-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Key Achievements</h4>
                    <p className="mt-1 text-slate-600 bg-slate-50 p-3 rounded-lg">{activeReview.selfAssessment.achievements}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Core Strengths</h4>
                    <p className="mt-1 text-slate-600 bg-slate-50 p-3 rounded-lg">{activeReview.selfAssessment.strengths}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Development Areas</h4>
                    <p className="mt-1 text-slate-600 bg-slate-50 p-3 rounded-lg">{activeReview.selfAssessment.areasForImprovement}</p>
                  </div>
                   <div>
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Self Rating</h4>
                    <div className="mt-1 flex items-center space-x-1">
                      <span className="text-2xl font-bold text-blue-600">{activeReview.selfAssessment.rating}</span>
                      <span className="text-slate-400">/ 5.0</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Manager Feedback Section */}
              {activeReview.managerAssessment && (
                 <section>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                      <AlertCircle size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Manager Feedback</h3>
                  </div>
                  
                  <div className="space-y-4 pl-4 border-l-2 border-purple-100 ml-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Manager Comments</h4>
                      <p className="mt-1 text-slate-600 bg-slate-50 p-3 rounded-lg italic">"{activeReview.managerAssessment.feedback}"</p>
                    </div>
                     <div>
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Manager Rating</h4>
                      <div className="mt-1 flex items-center space-x-1">
                        <span className="text-2xl font-bold text-purple-600">{activeReview.managerAssessment.rating}</span>
                        <span className="text-slate-400">/ 5.0</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 min-h-[400px]">
              <Clock size={48} className="mb-4 opacity-50" />
              <p>Select a review cycle to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appraisals;
