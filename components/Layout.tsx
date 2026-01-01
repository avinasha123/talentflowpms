import React, { ReactNode } from 'react';
import { Target, UserCheck, BarChart3, MessageSquare, LayoutDashboard, LogOut, Menu } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: ReactNode;
  user: User | null;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, activePage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ page, icon: Icon, label }: { page: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
        activePage === page 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full">
        <div className="p-6 flex items-center space-x-2 border-b border-slate-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Target className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-slate-800">TalentFlow</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem page="goals" icon={Target} label="My Goals" />
          <NavItem page="appraisals" icon={UserCheck} label="Appraisals" />
          <NavItem page="feedback" icon={MessageSquare} label="Feedback" />
          {user?.role === 'MANAGER' && (
            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Management</p>
              <NavItem page="team" icon={BarChart3} label="Team Performance" />
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center space-x-3 px-4 py-2">
            <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full bg-slate-200" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.jobTitle}</p>
            </div>
            <LogOut size={16} className="text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center z-20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Target className="text-white" size={20} />
            </div>
            <span className="text-lg font-bold text-slate-800">TalentFlow</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="text-slate-600" />
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 bg-white z-10 pt-16 p-4">
             <nav className="space-y-2">
              <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem page="goals" icon={Target} label="My Goals" />
              <NavItem page="appraisals" icon={UserCheck} label="Appraisals" />
              <NavItem page="feedback" icon={MessageSquare} label="Feedback" />
              {user?.role === 'MANAGER' && (
                <NavItem page="team" icon={BarChart3} label="Team Performance" />
              )}
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
