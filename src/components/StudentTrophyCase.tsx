import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BadgeCard } from './BadgeCard';
import { AttendanceMedalTracker } from './AttendanceMedalTracker';
import { ScoreConversionDisplay } from './ScoreConversionDisplay';
import { AwardedBadge, BadgeCategory } from '../types';
import { Trophy, Award, Search, Sparkles, User, Filter, CheckCircle2, History, AlertCircle } from 'lucide-react';

export const StudentTrophyCase: React.FC = () => {
  const { 
    students, 
    selectedStudentId, 
    getStudentAllBadges, 
    getStudentActiveBadges,
    redemptionHistory
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [badgeSearch, setBadgeSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'trophy' | 'redemptions'>('trophy');

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const allStudentBadges = currentStudent ? getStudentAllBadges(currentStudent.id) : [];
  const activeStudentBadges = currentStudent ? getStudentActiveBadges(currentStudent.id) : [];
  const redeemedStudentBadges = allStudentBadges.filter(b => b.status === 'redeemed');

  // Student specific redemption history
  const studentRedemptions = useMemo(() => {
    if (!currentStudent) return [];
    return redemptionHistory.filter(r => r.studentId === currentStudent.id);
  }, [redemptionHistory, currentStudent]);

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return allStudentBadges.filter(badge => {
      // Category / State filters
      let matchesFilter = true;
      if (categoryFilter === 'active') {
        matchesFilter = badge.status === 'active';
      } else if (categoryFilter === 'redeemed') {
        matchesFilter = badge.status === 'redeemed';
      } else if (categoryFilter !== 'all') {
        matchesFilter = badge.category === categoryFilter;
      }

      // Search filter
      const matchesSearch = !badgeSearch || 
        badge.title.toLowerCase().includes(badgeSearch.toLowerCase()) ||
        badge.description.toLowerCase().includes(badgeSearch.toLowerCase()) ||
        (badge.competencyCode && badge.competencyCode.toLowerCase().includes(badgeSearch.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [allStudentBadges, categoryFilter, badgeSearch]);

  if (!currentStudent) {
    return (
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
        <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-base font-semibold text-slate-300">No student selected</p>
        <p className="text-xs text-slate-500 mt-1">Please select a student from the filter above to view their Trophy Case.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="student-trophy-case-view">
      {/* Student Profile Card Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-3xl">
              {currentStudent.avatar || '👨‍🎓'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white font-display">
                {currentStudent.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Grade {currentStudent.grade}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentStudent.section} {currentStudent.lrn ? `• LRN: ${currentStudent.lrn}` : ''}
            </p>
            {currentStudent.notes && (
              <p className="text-xs text-slate-500 italic mt-1">
                "{currentStudent.notes}"
              </p>
            )}
          </div>
        </div>

        {/* Quick Badges Stats Pills */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <div className="text-lg font-extrabold text-emerald-400 font-display">
              {activeStudentBadges.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Active Badges
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <div className="text-lg font-extrabold text-slate-400 font-display">
              {redeemedStudentBadges.length}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Used Badges
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <div className="text-lg font-extrabold text-amber-400 font-display">
              {allStudentBadges.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Total Earned
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Raw Score Conversion Display */}
      <ScoreConversionDisplay
        activeBadgeCount={activeStudentBadges.length}
        totalBadgesCount={allStudentBadges.length}
        redeemedBadgesCount={redeemedStudentBadges.length}
      />

      {/* Row 2: Attendance 10-Medal Tracker */}
      <AttendanceMedalTracker studentId={currentStudent.id} />

      {/* Row 3: Digital Trophy Case Cabinet */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5" id="trophy-case-cabinet">
        {/* Cabinet Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
              <Trophy className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                Digital Trophy Case
                <span className="text-xs font-mono font-normal text-slate-400">
                  ({filteredBadges.length} of {allStudentBadges.length} Badges)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Badges awarded for demonstrated hands-on technical competencies in CSS
              </p>
            </div>
          </div>

          {/* Search bar inside trophy case */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search earned badges..."
              value={badgeSearch}
              onChange={(e) => setBadgeSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              id="trophy-badge-search"
            />
          </div>
        </div>

        {/* Filter Categories Bar */}
        <div className="flex flex-wrap gap-1.5 pb-2">
          {[
            { id: 'all', label: 'All Badges' },
            { id: 'active', label: `Active (${activeStudentBadges.length})` },
            { id: 'redeemed', label: `Used (${redeemedStudentBadges.length})` },
            { id: 'hardware', label: 'Hardware' },
            { id: 'networking', label: 'Networking' },
            { id: 'software', label: 'Software' },
            { id: 'safety', label: 'OHS Safety' },
            { id: 'conduct', label: 'Conduct & 5S' },
            { id: 'achievement', label: 'NC-II / Milestones' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                categoryFilter === cat.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-slate-950/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
              id={`trophy-filter-${cat.id}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        {filteredBadges.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 space-y-3">
            <Award className="w-10 h-10 text-slate-600 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-slate-300">
                {allStudentBadges.length === 0 ? 'No badges awarded yet' : 'No badges matching this filter'}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {allStudentBadges.length === 0
                  ? 'Complete your upcoming PC assembly, crimping, or OS installation lab exercises to unlock your first CSS badge!'
                  : 'Try selecting "All Badges" or clearing the search query.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="badges-grid-container">
            {filteredBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        )}

        {/* Redemption History Section if any */}
        {studentRedemptions.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-400" />
              Badge Redemption Log
            </h4>

            <div className="space-y-2">
              {studentRedemptions.map((red) => (
                <div 
                  key={red.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-200">{red.badgeTitle}</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Used for: <span className="text-blue-300 font-medium">{red.purpose}</span>
                    </p>
                  </div>
                  <div className="text-right font-mono text-slate-400 text-[11px]">
                    <div className="text-emerald-400 font-bold">+{red.rawScoreEquiv} Score Pt</div>
                    <div>{new Date(red.redeemedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
