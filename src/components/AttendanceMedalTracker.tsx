import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Clock, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, History, ShieldAlert, FileText } from 'lucide-react';

interface AttendanceMedalTrackerProps {
  studentId: string;
}

export const AttendanceMedalTracker: React.FC<AttendanceMedalTrackerProps> = ({ studentId }) => {
  const { getStudentAttendanceSummary } = useApp();
  const summary = getStudentAttendanceSummary(studentId);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(false);

  const {
    startingMedals,
    medalsRemaining,
    unexcusedAbsences,
    excusedAbsences,
    unexcusedLates,
    excusedLates,
    latePenaltyDeduction,
    unexcusedCuttings,
    excusedCuttings,
    totalDeductions,
    allRecords
  } = summary;

  return (
    <div 
      className="bg-slate-900/85 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-4"
      id="attendance-medal-tracker"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-display flex items-center gap-2">
              Quarter Attendance Medals
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                medalsRemaining >= 8 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                medalsRemaining >= 5 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {medalsRemaining} / {startingMedals} Medals
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              10 starting medals • 1 medal deducted per absence, per 2 lates, or per cutting
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors self-start sm:self-auto bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/60"
          id="attendance-toggle-history-btn"
        >
          <History className="w-3.5 h-3.5" />
          <span>History ({allRecords.length})</span>
          {isHistoryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Visual Medals Row (10 Medallions) */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Medal Status Bar:</span>
          <span className="font-mono text-[11px]">
            {totalDeductions === 0 ? '✨ Perfect Attendance' : `${totalDeductions} Medal${totalDeductions > 1 ? 's' : ''} Deducted`}
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {Array.from({ length: startingMedals }).map((_, index) => {
            const isRetained = index < medalsRemaining;
            return (
              <div
                key={index}
                className={`relative rounded-xl p-2.5 flex flex-col items-center justify-center transition-all duration-300 ${
                  isRetained
                    ? 'bg-gradient-to-b from-amber-500/20 to-yellow-600/10 border-2 border-amber-500/60 shadow-md shadow-amber-500/10 scale-100 hover:scale-105'
                    : 'bg-slate-950/60 border border-dashed border-slate-800 text-slate-600 grayscale opacity-40'
                }`}
                title={isRetained ? `Medal #${index + 1}: Active & Retained` : `Medal #${index + 1}: Deducted`}
              >
                <Award className={`w-5 h-5 ${isRetained ? 'text-amber-400 fill-amber-400/20' : 'text-slate-600'}`} />
                <span className={`text-[10px] font-mono font-bold mt-1 ${isRetained ? 'text-amber-300' : 'text-slate-600'}`}>
                  M{index + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Penalty Breakdown Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
        {/* Unexcused Absences */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
          unexcusedAbsences > 0 ? 'bg-rose-950/30 border-rose-500/30 text-rose-200' : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
        }`}>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span>Absences</span>
            <span className="font-bold font-mono">-{unexcusedAbsences}</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            {unexcusedAbsences} unexcused (-1 each)
          </p>
        </div>

        {/* Unexcused Lates */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
          latePenaltyDeduction > 0 ? 'bg-amber-950/30 border-amber-500/30 text-amber-200' : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
        }`}>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span>Tardiness / Late</span>
            <span className="font-bold font-mono">-{latePenaltyDeduction}</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            {unexcusedLates} lates (-1 per 2)
          </p>
        </div>

        {/* Cuttings */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
          unexcusedCuttings > 0 ? 'bg-red-950/30 border-red-500/30 text-red-200' : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
        }`}>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span>Cutting Class</span>
            <span className="font-bold font-mono">-{unexcusedCuttings}</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            {unexcusedCuttings} unexcused (-1 each)
          </p>
        </div>

        {/* Excused Records */}
        <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Excused</span>
            <span className="font-bold font-mono text-emerald-400">0 Ded.</span>
          </div>
          <p className="text-[10px] text-emerald-400/70 font-mono">
            {excusedAbsences + excusedLates + excusedCuttings} verified excuse(s)
          </p>
        </div>
      </div>

      {/* Expanded Attendance Logs */}
      {isHistoryExpanded && (
        <div className="pt-2 border-t border-slate-800 space-y-2 animate-fade-in">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            Detailed Attendance Records
          </h4>

          {allRecords.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
              No absence or tardiness records for this student. Perfect record!
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {allRecords.map((record) => (
                <div 
                  key={record.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    record.isExcused 
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                      : record.type === 'absent' 
                      ? 'bg-rose-950/20 border-rose-800/40 text-rose-200' 
                      : record.type === 'cutting'
                      ? 'bg-red-950/20 border-red-800/40 text-red-200'
                      : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-300">
                      {record.date}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      record.type === 'absent' ? 'bg-rose-500/20 text-rose-300' :
                      record.type === 'late' ? 'bg-amber-500/20 text-amber-300' :
                      record.type === 'cutting' ? 'bg-red-500/20 text-red-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {record.type}
                    </span>
                    {record.isExcused && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Excused (No Deduction)
                      </span>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-400">
                    {record.remarks ? record.remarks : (record.isExcused ? 'Verified excuse' : 'Unexcused')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
