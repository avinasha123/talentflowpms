import React, { useEffect, useState } from 'react';
import { User, Feedback, FeedbackRequest, FeedbackRequestStatus } from '../types';
import { db } from '../services/mockDataService';
import { MessageSquare, ThumbsUp, Users, Send, CheckCircle2, XCircle, Shield, Sparkles } from 'lucide-react';

interface FeedbackPageProps {
  user: User;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'continuous' | '360'>('continuous');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [requests, setRequests] = useState<FeedbackRequest[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  // Modal States
  const [isNominateOpen, setIsNominateOpen] = useState(false);
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FeedbackRequest | null>(null);
  
  // Form States
  const [nominatePeerId, setNominatePeerId] = useState('');
  const [nominateMessage, setNominateMessage] = useState('');
  const [responseContent, setResponseContent] = useState('');

  useEffect(() => {
    loadData();
  }, [user.id, activeTab]);

  const loadData = async () => {
    if (activeTab === 'continuous') {
      const data = await db.getFeedback(user.id);
      setFeedbacks(data);
    } else {
      const [reqData, usersData] = await Promise.all([
        db.getFeedbackRequests(user.id),
        db.getUsers()
      ]);
      setRequests(reqData);
      setAllUsers(usersData);
    }
  };

  const getUserName = (id: string) => {
    const u = allUsers.find(u => u.id === id);
    return u ? u.name : 'Unknown User';
  };

  const handleNominate = async () => {
    if (!nominatePeerId) return;
    
    // Status is PENDING_APPROVAL if user is employee, PENDING_FEEDBACK if manager initiates
    const initialStatus = user.role === 'MANAGER' 
      ? FeedbackRequestStatus.PENDING_FEEDBACK 
      : FeedbackRequestStatus.PENDING_APPROVAL;

    await db.createFeedbackRequest({
      targetUserId: user.id, // Nominating peer to review ME
      reviewerId: nominatePeerId,
      requesterId: user.id,
      status: initialStatus,
      isAnonymous: true, // Defaulting to true for peer reviews
      questions: nominateMessage,
    });
    
    // Simulate notification
    if (user.role !== 'MANAGER') {
      alert("Nomination submitted! A notification has been sent to your manager for approval.");
    } else {
      alert("Nomination sent! The peer has been notified.");
    }

    setIsNominateOpen(false);
    setNominatePeerId('');
    setNominateMessage('');
    loadData();
  };

  const handleSubmitResponse = async () => {
    if (!selectedRequest || !responseContent) return;
    
    await db.updateFeedbackRequest({
      ...selectedRequest,
      status: FeedbackRequestStatus.COMPLETED,
      content: responseContent
    });
    
    setIsResponseOpen(false);
    setSelectedRequest(null);
    setResponseContent('');
    loadData();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Feedback Hub</h1>
          <p className="text-slate-500">Manage continuous feedback and 360-degree reviews.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('continuous')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'continuous' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Continuous
          </button>
          <button
            onClick={() => setActiveTab('360')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === '360' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            360 / Peer Reviews
          </button>
        </div>
      </div>

      {/* CONTINUOUS FEEDBACK TAB */}
      {activeTab === 'continuous' && (
        <div className="space-y-6">
          {feedbacks.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex gap-4">
              <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                item.type === 'PRAISE' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {item.type === 'PRAISE' ? <ThumbsUp size={20} /> : <MessageSquare size={20} />}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-sm text-slate-500 mb-1">
                        <span className="font-semibold text-slate-900">{item.fromUserId === user.id ? 'You' : 'Manager'}</span> 
                        {item.fromUserId === user.id ? ' sent feedback to ' : ' sent feedback to '}
                        <span className="font-semibold text-slate-900">{item.toUserId === user.id ? 'You' : 'Manager'}</span>
                      </p>
                      <span className="text-xs text-slate-400">{item.date}</span>
                   </div>
                   <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                     item.type === 'PRAISE' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                   }`}>
                     {item.type}
                   </span>
                </div>
                
                <div className="mt-3 text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg rounded-tl-none">
                  {item.message}
                </div>
              </div>
            </div>
          ))}

          {feedbacks.length === 0 && (
             <div className="text-center py-12">
               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                 <MessageSquare className="text-slate-400" />
               </div>
               <h3 className="text-lg font-medium text-slate-900">No feedback yet</h3>
               <p className="text-slate-500">Feedback helps us grow. Don't be afraid to ask for it!</p>
             </div>
          )}
        </div>
      )}

      {/* 360 REVIEWS TAB */}
      {activeTab === '360' && (
        <div className="space-y-8">
          {/* Section 1: Pending Requests (Action Required) */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <span className="bg-amber-100 p-1.5 rounded-lg text-amber-600 mr-2"><MessageSquare size={18}/></span>
              Requests for You
            </h2>
            <div className="grid gap-4">
              {requests.filter(r => r.reviewerId === user.id && r.status === FeedbackRequestStatus.PENDING_FEEDBACK).length === 0 ? (
                <p className="text-slate-500 text-sm italic">You have no pending feedback requests.</p>
              ) : (
                requests
                  .filter(r => r.reviewerId === user.id && r.status === FeedbackRequestStatus.PENDING_FEEDBACK)
                  .map(req => (
                    <div key={req.id} className="bg-white border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-900">Feedback for {getUserName(req.targetUserId)}</p>
                        <p className="text-sm text-slate-500">{req.questions || "General performance feedback requested."}</p>
                        <div className="mt-1 flex items-center space-x-2">
                           <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Requested by {getUserName(req.requesterId)}</span>
                           {req.isAnonymous && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded flex items-center"><Shield size={10} className="mr-1"/> Anonymous</span>}
                        </div>
                      </div>
                      <button 
                        onClick={() => { setSelectedRequest(req); setIsResponseOpen(true); }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                      >
                        Give Feedback
                      </button>
                    </div>
                  ))
              )}
            </div>
          </section>

          {/* Section 2: My Nominations & Incoming Feedback */}
          <section>
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-bold text-slate-900 flex items-center">
                 <span className="bg-blue-100 p-1.5 rounded-lg text-blue-600 mr-2"><Users size={18}/></span>
                 My 360 Dashboard
               </h2>
               <button 
                 onClick={() => setIsNominateOpen(true)}
                 className="text-sm bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg flex items-center"
               >
                 <Send size={16} className="mr-2" />
                 Nominate Peer for Review
               </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                     <tr>
                       <th className="px-6 py-3 font-medium">Reviewer / Peer</th>
                       <th className="px-6 py-3 font-medium">Status</th>
                       <th className="px-6 py-3 font-medium">Date</th>
                       <th className="px-6 py-3 font-medium">Feedback</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {requests
                       .filter(r => r.targetUserId === user.id)
                       .map(req => (
                         <tr key={req.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4 font-medium text-slate-900">
                             {req.isAnonymous && req.status === FeedbackRequestStatus.COMPLETED ? (
                               <div className="flex items-center text-slate-500"><Shield size={14} className="mr-1"/> Anonymous Peer</div>
                             ) : (
                               getUserName(req.reviewerId)
                             )}
                           </td>
                           <td className="px-6 py-4">
                             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                               ${req.status === FeedbackRequestStatus.COMPLETED ? 'bg-green-100 text-green-700' : 
                                 req.status === FeedbackRequestStatus.PENDING_APPROVAL ? 'bg-amber-100 text-amber-700' :
                                 req.status === FeedbackRequestStatus.REJECTED ? 'bg-red-100 text-red-700' :
                                 'bg-blue-100 text-blue-700'
                               }`}>
                               {req.status}
                             </span>
                           </td>
                           <td className="px-6 py-4 text-slate-500">{req.createdAt}</td>
                           <td className="px-6 py-4">
                             {req.status === FeedbackRequestStatus.COMPLETED ? (
                               <div className="text-slate-700 italic max-w-xs truncate" title={req.content}>
                                 "{req.content}"
                               </div>
                             ) : (
                               <span className="text-slate-400">-</span>
                             )}
                           </td>
                         </tr>
                       ))}
                     {requests.filter(r => r.targetUserId === user.id).length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                            <p className="mb-3">You haven't requested any peer feedback yet.</p>
                            <button 
                              onClick={() => setIsNominateOpen(true)}
                              className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg inline-flex items-center transition-colors"
                            >
                              <Send size={14} className="mr-2" />
                              Start a Nomination
                            </button>
                          </td>
                        </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          </section>
        </div>
      )}

      {/* NOMINATION MODAL */}
      {isNominateOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Nominate a Peer</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Peer</label>
                <select 
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={nominatePeerId}
                  onChange={(e) => setNominatePeerId(e.target.value)}
                >
                  <option value="">Choose a colleague...</option>
                  {allUsers.filter(u => u.id !== user.id).map(u => (
                    <option key={u.id} value={u.id}>{u.name} - {u.jobTitle}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message / Specific Questions</label>
                <textarea 
                  className="w-full p-2 border border-slate-300 rounded-lg h-24"
                  placeholder="e.g., Please provide feedback on my project management skills during the Q1 launch."
                  value={nominateMessage}
                  onChange={(e) => setNominateMessage(e.target.value)}
                />
              </div>
              <div className="flex items-start bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                <Shield size={16} className="mt-0.5 mr-2 shrink-0"/>
                <p>This request will be sent to your manager for approval first. Once approved, the peer will be notified. Feedback will be anonymous.</p>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button onClick={() => setIsNominateOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button onClick={handleNominate} disabled={!nominatePeerId} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">Send Request</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESPONSE MODAL */}
      {isResponseOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
             <div className="mb-4">
               <h3 className="text-lg font-bold">Provide Feedback</h3>
               <p className="text-slate-500 text-sm">For: {getUserName(selectedRequest.targetUserId)}</p>
             </div>
             
             <div className="mb-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
               <span className="text-xs font-bold text-slate-500 uppercase">Context</span>
               <p className="text-slate-800 mt-1">{selectedRequest.questions || "Please provide constructive feedback."}</p>
             </div>

             <div className="space-y-4">
                <textarea 
                  className="w-full p-4 border border-slate-300 rounded-lg h-40 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Share your honest, constructive feedback here..."
                  value={responseContent}
                  onChange={(e) => setResponseContent(e.target.value)}
                />
                
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <div className="flex items-center">
                    {selectedRequest.isAnonymous ? <Shield size={14} className="mr-1 text-green-600"/> : <Users size={14} className="mr-1"/>}
                    {selectedRequest.isAnonymous ? "Your feedback is anonymous" : "Your name will be visible"}
                  </div>
                  <div className="flex items-center space-x-1 text-blue-600 cursor-pointer hover:underline">
                    <Sparkles size={14}/>
                    <span>AI Writing Assist</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button onClick={() => setIsResponseOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button onClick={handleSubmitResponse} disabled={!responseContent} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">Submit Feedback</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;