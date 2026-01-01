import React, { useEffect, useState } from 'react';
import { User, FeedbackRequest, FeedbackRequestStatus } from '../types';
import { db } from '../services/mockDataService';
import { MoreVertical, Mail, TrendingUp, Check, X, Shield, Users } from 'lucide-react';

interface TeamProps {
  user: User;
}

const Team: React.FC<TeamProps> = ({ user }) => {
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FeedbackRequest[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    const allUsersData = await db.getUsers();
    setAllUsers(allUsersData);
    setTeamMembers(allUsersData.filter(u => u.id !== user.id));

    // Get all requests and filter for those needing approval (where target is in my team)
    // In a real app, query by managerId. Here, we filter.
    const allReqs = await db.getAllFeedbackRequests();
    const teamIds = allUsersData.filter(u => u.id !== user.id).map(u => u.id);
    
    setPendingRequests(allReqs.filter(r => 
      r.status === FeedbackRequestStatus.PENDING_APPROVAL && teamIds.includes(r.targetUserId)
    ));
  };

  const getUserName = (id: string) => {
    const u = allUsers.find(u => u.id === id);
    return u ? u.name : 'Unknown User';
  };

  const handleApproval = async (req: FeedbackRequest, approved: boolean) => {
    await db.updateFeedbackRequest({
      ...req,
      status: approved ? FeedbackRequestStatus.PENDING_FEEDBACK : FeedbackRequestStatus.REJECTED
    });
    loadData();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Team Performance</h1>
        <p className="text-slate-500">Overview of your direct reports and feedback governance.</p>
      </div>

      {/* Governance Section */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <Shield className="text-blue-600 mr-2" size={20} />
          Feedback Approvals
          {pendingRequests.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
          )}
        </h2>
        
        {pendingRequests.length === 0 ? (
          <p className="text-slate-500 italic text-sm">No pending feedback nominations to review.</p>
        ) : (
          <div className="grid gap-3">
             {pendingRequests.map(req => (
               <div key={req.id} className="flex flex-col sm:flex-row justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="mb-3 sm:mb-0">
                    <p className="font-medium text-slate-900">
                      <span className="font-bold">{getUserName(req.requesterId)}</span> wants to nominate 
                      <span className="font-bold text-blue-600"> {getUserName(req.reviewerId)}</span> for feedback.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Request Date: {req.createdAt} • Context: "{req.questions || 'General'}"</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleApproval(req, false)}
                      className="flex items-center px-3 py-1.5 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm font-medium transition-colors"
                    >
                      <X size={14} className="mr-1"/> Reject
                    </button>
                    <button 
                      onClick={() => handleApproval(req, true)}
                      className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors"
                    >
                      <Check size={14} className="mr-1"/> Approve
                    </button>
                  </div>
               </div>
             ))}
          </div>
        )}
      </section>

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
