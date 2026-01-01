import React, { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { db } from './services/mockDataService';
import { User } from './types';

// Pages
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Appraisals from './pages/Appraisals';
import FeedbackPage from './pages/FeedbackPage';
import Team from './pages/Team';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const u = await db.getCurrentUser();
      setUser(u);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard user={user!} onNavigate={setActivePage} />;
      case 'goals':
        return <Goals user={user!} />;
      case 'appraisals':
        return <Appraisals user={user!} />;
      case 'feedback':
        return <FeedbackPage user={user!} />;
      case 'team':
        return <Team user={user!} />;
      default:
        return <Dashboard user={user!} onNavigate={setActivePage} />;
    }
  };

  return (
    <Layout user={user} activePage={activePage} onNavigate={setActivePage}>
      <div className="max-w-7xl mx-auto">
        {renderPage()}
      </div>
    </Layout>
  );
};

export default App;
