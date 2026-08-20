import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trophy, 
  Shield, 
  Calculator, 
  Download, 
  Radio, 
  Lock, 
  Unlock, 
  GraduationCap, 
  Sparkles,
  RefreshCw,
  Layers
} from 'lucide-react';
import { RubricConverterModal } from './RubricConverterModal';

interface NavbarProps {
  currentView: 'student' | 'teacher';
  setCurrentView: (view: 'student' | 'teacher') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const { 
    isTeacherAuthenticated, 
    syncStatus, 
    isFirebaseConnected,
    teacherSettings 
  } = useApp();

  const [showRubricModal, setShowRubricModal] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);

  // Capture PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3" id="app-header-navbar">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Brand Logo & Meta */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold text-white tracking-tight font-display">
                    CSS BADGE AWARD SYSTEM
                  </h1>
                  <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    PWA • Grades 8-10
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Computer Systems Servicing • Trophy Case & Attendance Tracker
                </p>
              </div>
            </div>

            {/* Firestore Live Status Indicator (Mobile) */}
            <div className="sm:hidden flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            {/* Real-time Firestore Sync Badge (Desktop) */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300">
              <Radio className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'text-blue-400 animate-spin' : isFirebaseConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span>{syncStatus === 'syncing' ? 'Syncing...' : isFirebaseConnected ? 'Firestore Live' : 'Offline Cache'}</span>
            </div>

            {/* Quick Rubric Converter Button */}
            <button
              type="button"
              onClick={() => setShowRubricModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-all border border-slate-700/60 flex items-center gap-1.5 shadow-sm"
              title="Open 4.00-Scale Rubric to Raw Score Converter"
              id="nav-rubric-converter-btn"
            >
              <Calculator className="w-3.5 h-3.5 text-blue-400" />
              <span>Rubric (4.00 ➔ 25)</span>
            </button>

            {/* PWA Install Button if supported and available */}
            {installPrompt && !isAppInstalled && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                title="Install PWA to Home Screen"
                id="nav-pwa-install-btn"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {/* View Switcher: Student Trophy Case vs. Teacher Dashboard */}
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setCurrentView('student')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'student'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="view-switch-student-btn"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span>Student Trophy Case</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('teacher')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'teacher'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="view-switch-teacher-btn"
              >
                {isTeacherAuthenticated ? (
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Teacher Portal</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Standalone Rubric Converter Modal */}
      <RubricConverterModal
        isOpen={showRubricModal}
        onClose={() => setShowRubricModal(false)}
        isEmbedded={false}
      />
    </>
  );
};
