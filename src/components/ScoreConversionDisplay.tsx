import React, { useState } from 'react';
import { Award, Zap, HelpCircle, ArrowUpRight, CheckCircle, ShieldCheck } from 'lucide-react';

interface ScoreConversionDisplayProps {
  activeBadgeCount: number;
  totalBadgesCount: number;
  redeemedBadgesCount: number;
}

export const ScoreConversionDisplay: React.FC<ScoreConversionDisplayProps> = ({
  activeBadgeCount,
  totalBadgesCount,
  redeemedBadgesCount
}) => {
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Exact formula: RS = (B + 1) / 2
  // where B = unused, active badges count
  const rawScore = Number(((activeBadgeCount + 1) / 2).toFixed(2));
  const rawScoreRounded = Math.round(rawScore * 10) / 10;

  return (
    <div 
      className="bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 rounded-2xl border border-blue-500/30 p-5 shadow-xl relative overflow-hidden"
      id="score-conversion-card"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Metric Title & Badges count */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-display">
                  Current Raw Score (RS)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-slate-400 hover:text-blue-300 transition-colors"
                  title="How is this score calculated?"
                  id="score-formula-help-btn"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Calculated strictly from unused, active badges ($B$)
              </p>
            </div>
          </div>
        </div>

        {/* Right: Big Raw Score Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-blue-500/40 flex items-baseline gap-2 shadow-inner">
            <span className="text-3xl font-extrabold text-blue-400 font-display">
              {rawScore}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              RS pts
            </span>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
              <Award className="w-3.5 h-3.5" />
              {activeBadgeCount} Active {activeBadgeCount === 1 ? 'Badge' : 'Badges'}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {redeemedBadgesCount} Redeemed / {totalBadgesCount} Total
            </div>
          </div>
        </div>
      </div>

      {/* Formula Breakdown Banner */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-slate-400">Official Formula:</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-950 text-blue-300 border border-blue-900/60 font-bold">
            RS = (B + 1) / 2
          </span>
          <span className="text-slate-400">➔</span>
          <span className="text-white font-bold">
            ({activeBadgeCount} + 1) / 2 = <span className="text-blue-400">{rawScore}</span>
          </span>
        </div>

        <span className="text-[11px] text-slate-500 font-mono">
          *Used badges are excluded from active score
        </span>
      </div>

      {/* Expanded Explanation Dropdown */}
      {showExplanation && (
        <div className="mt-3 p-4 rounded-xl bg-slate-950/90 border border-blue-500/20 text-xs text-slate-300 space-y-2 animate-fade-in">
          <h4 className="font-bold text-blue-400 flex items-center gap-1.5 font-display">
            <ShieldCheck className="w-4 h-4" />
            CSS Laboratory Scoring Rule (DepEd TechVoc Standard)
          </h4>
          <p className="text-slate-300 leading-relaxed">
            Every technical badge earned in PC Assembly, Networking, Software, OHS Safety, or Conduct counts as <strong className="text-white">1 active badge unit ($B$)</strong>.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
            <li><strong className="text-slate-200">Active Badges ($B$):</strong> Badges currently in your trophy case that have not been redeemed for quiz/exam boosts.</li>
            <li><strong className="text-slate-200">Formula:</strong> <code className="text-blue-300 font-mono">RS = (Active Badges + 1) / 2</code></li>
            <li><strong className="text-slate-200">Example:</strong> 5 Active Badges ➔ (5 + 1) / 2 = <strong>3.0 Raw Score</strong></li>
            <li><strong className="text-slate-200">Redemption:</strong> When you redeem a badge for a quiz bonus, it remains preserved in your trophy case with a <span className="text-slate-300 font-semibold">"USED"</span> tag, while your active RS updates automatically in real-time.</li>
          </ul>
        </div>
      )}
    </div>
  );
};
