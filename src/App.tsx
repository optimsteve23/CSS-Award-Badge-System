import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { GradeSectionFilter } from './components/GradeSectionFilter';
import { StudentTrophyCase } from './components/StudentTrophyCase';
import { TeacherDashboard } from './components/TeacherDashboard';
import { 
  Trophy, 
  ShieldCheck, 
  Cpu, 
  Network, 
  HardDriveDownload, 
  Sparkles, 
  Calculator, 
  Clock, 
  Users,
  CheckCircle2
} from 'lucide-react';

const MainContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'student' | 'teacher'>('student');
  const { selectedStudentId, setSelectedStudentId, students } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white" id="css-pwa-app-root">
      {/* Top Navbar */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Quick Breadcrumb / Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 bg-slate-900/50 rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>
              <strong>Computer Systems Servicing (CSS)</strong> • Grades 8 (Exploratory), 9 (Intermediate), 10 (NC II Pre-Assessment)
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Raw Score: <strong className="text-blue-400 font-bold">$RS = (B + 1) / 2$</strong></span>
            <span>•</span>
            <span>Attendance: <strong className="text-amber-400 font-bold">10 Medals Start</strong></span>
          </div>
        </div>

        {/* Dynamic Views */}
        {currentView === 'student' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Filter Column */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-4">
              <GradeSectionFilter />
            </div>

            {/* Right Trophy Case Area */}
            <div className="lg:col-span-8 xl:col-span-9">
              <StudentTrophyCase />
            </div>
          </div>
        ) : (
          <div>
            <TeacherDashboard />
          </div>
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Junior High School • TechVoc / CSS Department • Firestore Real-Time Synchronized</span>
          <span>Progressive Web App (PWA) Ready • Works Offline</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
