import React, { useEffect, useState } from 'react';
import { User, FeedbackRequest, FeedbackRequestStatus } from '../types';
import { db } from '../services/mockDataService';
import { MoreVertical, Mail, TrendingUp, Check, X, Shield, Loader2, UserCheck, MessageSquarePlus, Send, Clock, FileText } from 'lucide-react';

interface TeamProps {
  user: User;
}

const Team: React.FC<TeamProps> = ({ user }) => {
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  
  // Split requests into two buckets
  const [approvalRequests, setApprovalRequests] = useState<FeedbackRequest[]>([]);
  const [monitoringRequests, setMonitoringRequests] = useState<FeedbackRequest[]>([]);
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Quick Feedback State
  const [quickFeedbackId, setQuickFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    const allUsersData = await db.getUsers();
    setAllUsers(allUsersData);
    setTeamMembers(allUsersData.filter(u => u.id !== user.id));

    // Get all requests
    const allReqs = await db.getAllFeedbackRequests();
    const teamIds = allUsersData.filter(u => u.id !== user.id).map(u => u.id);
    
    // Filter 1: Needs Manager Approval
    setApprovalRequests(allReqs.filter(r => 
      r.status === FeedbackRequestStatus.PENDING_APPROVAL && teamIds.includes(r.targetUserId)
    ));

    // Filter 2: Waiting on Peer (Monitoring)
    setMonitoringRequests(allReqs.filter(r => 
      r.status === FeedbackRequestStatus.PENDING_FEEDBACK && teamIds.includes(r.targetUserId)
    ));
  };

  const getUserName = (id: string) => {
    const u = allUsers.find(u => u.id === id);
    return u ? u.name : 'Unknown User';
  };

  const handleApproval = async (req: FeedbackRequest, approved: boolean) => {
    setProcessingId(req.id);
    try {
      await db.updateFeedbackRequest({
        ...req,
        status: approved ? FeedbackRequestStatus.PENDING_FEEDBACK : FeedbackRequestStatus.REJECTED
      });
      await loadData();
    } catch (error) {
      console.error("Error updating request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const toggleQuickFeedback = (id: string) => {
    if (quickFeedbackId === id) {
      setQuickFeedbackId(null);
      setFeedbackText('');
    } else {
      setQuickFeedbackId(id);
      setFeedbackText('');
    }
  };

  const handleQuickSubmit = async (req: FeedbackRequest) => {
    if (!feedbackText.trim()) return;
    setProcessingId(req.id);
    try {
      await db.updateFeedbackRequest({
        ...req,
        status: FeedbackRequestStatus.COMPLETED,
        content: feedbackText,
        reviewerId: user.id // Manager takes over the review
      });
      setQuickFeedbackId(null);
      setFeedbackText('');
      await loadData();
    } catch (error) {
      console.error("Error updating request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Team Performance</h1>
        <p className="text-slate-500">Overview of your direct reports and feedback governance.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Section 1: Governance / Approvals */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <Shield className="text-blue-600 mr-2" size={20} />
            Needs Approval
            {approvalRequests.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{approvalRequests.length}</span>
            )}
          </h2>
          
          {approvalRequests.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
               <UserCheck className="mx-auto h-8 w-8 text-slate-300 mb-2" />
               <p className="text-slate-500 italic text-sm">No nominations awaiting approval.</p>
            </div>
          ) : (
            <div className="grid gap-3">
               {approvalRequests.map(req => (
                 <div key={req.id} className={`flex flex-col p-4 bg-slate-50 rounded-lg border transition-all ${quickFeedbackId === req.id ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-100 hover:border-blue-200'}`}>
                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="font-medium text-slate-900 mb-1 flex flex-wrap gap-1 items-baseline">
                           <span className="font-bold text-slate-800">{getUserName(req.requesterId)}</span>
                           <span className="text-slate-500 text-sm">nominated</span>
                           <span className="font-bold text-blue-600">{getUserName(req.reviewerId)}</span>
                           <span className="text-slate-500 text-sm">to review</span>
                           <span className="font-bold text-slate-800">{getUserName(req.targetUserId)}</span>
                        </div>
                        <div className="text-xs text-slate-400 mb-2">{req.createdAt}</div>
                        
                        {/* Explicit Questions Display */}
                        <div className="bg-white p-2.5 rounded border border-slate-200 text-sm text-slate-600">
                           <div className="flex items-center text-xs font-semibold text-slate-400 uppercase mb-1">
                             <FileText size={10} className="mr-1"/> Context / Questions
                           </div>
                           <p className="italic">"{req.questions || 'General Feedback Requested'}"</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200/50">
                        <button 
                          onClick={() => toggleQuickFeedback(req.id)}
                          disabled={processingId === req.id}
                          className={`flex items-center px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                            quickFeedbackId === req.id 
                              ? 'bg-blue-100 text-blue-700 border-blue-200' 
                              : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <MessageSquarePlus size={14} className="mr-1"/> 
                          Direct
                        </button>
                        
                        {!quickFeedbackId && (
                          <>
                            <button 
                              onClick={() => handleApproval(req, false)}
                              disabled={processingId === req.id}
                              className="flex items-center px-3 py-1.5 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {processingId === req.id ? <Loader2 className="animate-spin mr-1" size={14}/> : <X size={14} className="mr-1"/>} 
                              Reject
                            </button>
                            <button 
                              onClick={() => handleApproval(req, true)}
                              disabled={processingId === req.id}
                              className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                            >
                              {processingId === req.id ? <Loader2 className="animate-spin mr-1" size={14}/> : <Check size={14} className="mr-1"/>}
                              Approve
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline Feedback Form */}
                    {quickFeedbackId === req.id && (
                      <div className="mt-4 pt-3 border-t border-slate-200 w-full animate-fadeIn">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                          Provide Direct Feedback (Bypasses Peer Review)
                        </label>
                        <div className="flex flex-col gap-3">
                          <textarea
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            rows={3}
                            placeholder="Enter your feedback here to resolve this request immediately..."
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => toggleQuickFeedback(req.id)}
                              className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleQuickSubmit(req)}
                              disabled={!feedbackText.trim() || processingId === req.id}
                              className="flex items-center px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === req.id ? <Loader2 className="animate-spin mr-2" size={14}/> : <Send size={14} className="mr-2"/>}
                              Submit & Complete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                 </div>
               ))}
            </div>
          )}
        </section>

        {/* Section 2: Monitoring (Approved & Pending Peer Feedback) */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
           <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <Clock className="text-amber-500 mr-2" size={20} />
            Pending Peer Feedback
            {monitoringRequests.length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{monitoringRequests.length}</span>
            )}
          </h2>
          
          {monitoringRequests.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
               <Clock className="mx-auto h-8 w-8 text-slate-300 mb-2" />
               <p className="text-slate-500 italic text-sm">No active peer reviews in progress.</p>
            </div>
          ) : (
            <div className="grid gap-3">
               {monitoringRequests.map(req => (
                 <div key={req.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                       <span className="bg-amber-100 text-amber-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                         Waiting for Peer
                       </span>
                       <span className="text-xs text-slate-400">{req.createdAt}</span>
                    </div>
                    <div className="font-medium text-slate-900 text-sm mb-3">
                        <span className="font-bold text-blue-600">{getUserName(req.reviewerId)}</span>
                        <span className="text-slate-500 mx-1">is reviewing</span>
                        <span className="font-bold text-slate-800">{getUserName(req.targetUserId)}</span>
                    </div>
                     {/* Monitoring Context */}
                     <div className="text-sm text-slate-500 italic border-l-2 border-slate-200 pl-3">
                       "{req.questions || 'General Feedback'}"
                    </div>
                 </div>
               ))}
            </div>
          )}
        </section>
      </div>

      {/* Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map(member => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full bg-slate-100 object-cover" />
                  <div>
                    <h3 className="font-bold text-slate-900">{member.name}</h3>
                    <p className="text-sm text-slate-500">{member.jobTitle}</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Goals Status</span>
                  <span className="text-green-600 font-medium">On Track</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                   <div className="text-center flex-1 border-r border-slate-100">
                     <span className="block text-xl font-bold text-slate-800">4.2</span>
                     <span className="text-xs text-slate-500 uppercase">Avg Rating</span>
                   </div>
                   <div className="text-center flex-1">
                     <span className="block text-xl font-bold text-slate-800">92%</span>
                     <span className="text-xs text-slate-500 uppercase">Goal Comp.</span>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between">
              <button className="text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center space-x-2">
                <Mail size={16} />
                <span>Message</span>
              </button>
              <button className="text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center space-x-2">
                <TrendingUp size={16} />
                <span>View Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;