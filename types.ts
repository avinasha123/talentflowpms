export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN'
}

export enum GoalStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum ReviewStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  REVIEWED = 'Reviewed',
  FINALIZED = 'Finalized'
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  department: string;
  jobTitle: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  metric: string; // The "M" in SMART
  deadline: string; // The "T" in SMART
  status: GoalStatus;
  progress: number; // 0-100
  createdAt: string;
  feedback?: string[]; // Manager comments
}

export interface Appraisal {
  id: string;
  employeeId: string;
  managerId: string;
  cycle: string; // e.g., "Q1 2024"
  status: ReviewStatus;
  selfAssessment: {
    achievements: string;
    strengths: string;
    areasForImprovement: string;
    rating: number; // 1-5
  };
  managerAssessment?: {
    feedback: string;
    rating: number; // 1-5
    promotionRecommended: boolean;
  };
  submittedAt?: string;
}

export interface Feedback {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  type: 'PRAISE' | 'COACHING' | 'GENERAL';
  date: string;
  isPublic: boolean;
}

// 360 Feedback Types
export enum FeedbackRequestStatus {
  PENDING_APPROVAL = 'Pending Approval', // Manager must approve nomination
  PENDING_FEEDBACK = 'Pending Feedback', // Waiting for peer to write
  COMPLETED = 'Completed',
  REJECTED = 'Rejected'
}

export interface FeedbackRequest {
  id: string;
  targetUserId: string; // Who is this feedback about?
  reviewerId: string;   // Who writes the feedback?
  requesterId: string;  // Who initiated? (Self or Manager)
  status: FeedbackRequestStatus;
  content?: string;     // The feedback text
  questions?: string;   // Specific questions (optional)
  isAnonymous: boolean;
  createdAt: string;
}
