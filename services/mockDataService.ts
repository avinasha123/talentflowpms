import { User, Goal, Appraisal, Feedback, Role, GoalStatus, ReviewStatus, FeedbackRequest, FeedbackRequestStatus } from '../types';

// Initial Mock Data
const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alice Engineer',
    role: Role.EMPLOYEE,
    department: 'Engineering',
    jobTitle: 'Senior Frontend Dev',
    avatar: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: 'u2',
    name: 'Bob Manager',
    role: Role.MANAGER,
    department: 'Engineering',
    jobTitle: 'Engineering Manager',
    avatar: 'https://picsum.photos/200/200?random=2'
  },
  {
    id: 'u3',
    name: 'Charlie Designer',
    role: Role.EMPLOYEE,
    department: 'Design',
    jobTitle: 'Product Designer',
    avatar: 'https://picsum.photos/200/200?random=3'
  }
];

const MOCK_GOALS: Goal[] = [
  {
    id: 'g1',
    userId: 'u1',
    title: 'Migrate Legacy Dashboard',
    description: 'Convert the old dashboard from Angular to React.',
    metric: '100% components migrated',
    deadline: '2024-06-30',
    status: GoalStatus.IN_PROGRESS,
    progress: 65,
    createdAt: '2024-01-15'
  },
  {
    id: 'g2',
    userId: 'u1',
    title: 'Improve Accessibility Score',
    description: 'Ensure all public facing pages have a Lighthouse score of >90.',
    metric: 'Lighthouse Score > 90',
    deadline: '2024-04-01',
    status: GoalStatus.COMPLETED,
    progress: 100,
    createdAt: '2024-01-10'
  }
];

const MOCK_APPRAISALS: Appraisal[] = [
  {
    id: 'a1',
    employeeId: 'u1',
    managerId: 'u2',
    cycle: 'Q4 2023',
    status: ReviewStatus.FINALIZED,
    selfAssessment: {
      achievements: 'Delivered the new payment gateway integration ahead of schedule.',
      strengths: 'Technical deep dives, React proficiency.',
      areasForImprovement: 'Public speaking in town halls.',
      rating: 4
    },
    managerAssessment: {
      feedback: 'Alice consistently delivers high-quality code. She needs to work on visibility.',
      rating: 4.5,
      promotionRecommended: false
    },
    submittedAt: '2023-12-20'
  }
];

const MOCK_FEEDBACK: Feedback[] = [
  {
    id: 'f1',
    fromUserId: 'u2',
    toUserId: 'u1',
    message: 'Great job handling that production incident yesterday. Your calm communication helped everyone focus.',
    type: 'PRAISE',
    date: '2024-02-15',
    isPublic: true
  }
];

const MOCK_FEEDBACK_REQUESTS: FeedbackRequest[] = [
  {
    id: 'fr1',
    targetUserId: 'u1',
    reviewerId: 'u3',
    requesterId: 'u1', // Alice requested feedback from Charlie
    status: FeedbackRequestStatus.PENDING_FEEDBACK,
    isAnonymous: false,
    questions: 'How was my collaboration on the UI kit?',
    createdAt: '2024-03-01'
  },
  {
    id: 'fr2',
    targetUserId: 'u1',
    reviewerId: 'u2',
    requesterId: 'u1',
    status: FeedbackRequestStatus.COMPLETED,
    isAnonymous: false,
    content: 'Excellent leadership shown in the sprint planning.',
    createdAt: '2024-02-20'
  }
];

// Helper to simulate DB delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockDataService {
  private getStorage<T>(key: string, defaultData: T): T {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(data);
  }

  private setStorage<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  async getCurrentUser(): Promise<User> {
    await delay(300);
    // Simulating Alice logged in for demo purposes. Switch index to 1 for Bob (Manager)
    return MOCK_USERS[0]; 
  }

  async getUsers(): Promise<User[]> {
    await delay(300);
    return MOCK_USERS;
  }

  async getGoals(userId: string): Promise<Goal[]> {
    await delay(400);
    const goals = this.getStorage<Goal[]>('tf_goals', MOCK_GOALS);
    return goals.filter(g => g.userId === userId);
  }

  async createGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> {
    await delay(500);
    const goals = this.getStorage<Goal[]>('tf_goals', MOCK_GOALS);
    const newGoal: Goal = {
      ...goal,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    goals.push(newGoal);
    this.setStorage('tf_goals', goals);
    return newGoal;
  }

  async updateGoal(goal: Goal): Promise<Goal> {
    await delay(300);
    const goals = this.getStorage<Goal[]>('tf_goals', MOCK_GOALS);
    const index = goals.findIndex(g => g.id === goal.id);
    if (index !== -1) {
      goals[index] = goal;
      this.setStorage('tf_goals', goals);
    }
    return goal;
  }

  async getAppraisals(userId: string): Promise<Appraisal[]> {
    await delay(400);
    const apps = this.getStorage<Appraisal[]>('tf_appraisals', MOCK_APPRAISALS);
    return apps.filter(a => a.employeeId === userId || a.managerId === userId);
  }

  async createFeedback(feedback: Omit<Feedback, 'id'>): Promise<Feedback> {
    await delay(300);
    const feeds = this.getStorage<Feedback[]>('tf_feedback', MOCK_FEEDBACK);
    const newFeed: Feedback = {
      ...feedback,
      id: Math.random().toString(36).substr(2, 9)
    };
    feeds.push(newFeed);
    this.setStorage('tf_feedback', feeds);
    return newFeed;
  }

  async getFeedback(userId: string): Promise<Feedback[]> {
    await delay(300);
    const feeds = this.getStorage<Feedback[]>('tf_feedback', MOCK_FEEDBACK);
    return feeds.filter(f => f.toUserId === userId || f.fromUserId === userId);
  }

  // 360 Feedback Methods

  async getFeedbackRequests(userId: string): Promise<FeedbackRequest[]> {
    await delay(300);
    const reqs = this.getStorage<FeedbackRequest[]>('tf_feedback_reqs', MOCK_FEEDBACK_REQUESTS);
    // Return requests where user is the target (received feedback) OR the reviewer (needs to give feedback) OR requester (nominated someone)
    return reqs.filter(r => r.targetUserId === userId || r.reviewerId === userId || r.requesterId === userId);
  }

  async getAllFeedbackRequests(): Promise<FeedbackRequest[]> {
    // For managers to see all
    await delay(300);
    return this.getStorage<FeedbackRequest[]>('tf_feedback_reqs', MOCK_FEEDBACK_REQUESTS);
  }

  async createFeedbackRequest(request: Omit<FeedbackRequest, 'id' | 'createdAt'>): Promise<FeedbackRequest> {
    await delay(300);
    const reqs = this.getStorage<FeedbackRequest[]>('tf_feedback_reqs', MOCK_FEEDBACK_REQUESTS);
    const newReq: FeedbackRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toLocaleDateString()
    };
    reqs.push(newReq);
    this.setStorage('tf_feedback_reqs', reqs);
    return newReq;
  }

  async updateFeedbackRequest(request: FeedbackRequest): Promise<FeedbackRequest> {
    await delay(300);
    const reqs = this.getStorage<FeedbackRequest[]>('tf_feedback_reqs', MOCK_FEEDBACK_REQUESTS);
    const index = reqs.findIndex(r => r.id === request.id);
    if (index !== -1) {
      reqs[index] = request;
      this.setStorage('tf_feedback_reqs', reqs);
    }
    return request;
  }
}

export const db = new MockDataService();
