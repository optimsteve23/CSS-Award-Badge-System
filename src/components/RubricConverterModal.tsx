import React, { useState } from 'react';
import { DEFAULT_RUBRIC_MAPPINGS } from '../data/defaultData';
import { Calculator, Copy, Check, ArrowRight, BookOpen, Sparkles, Sliders } from 'lucide-react';

interface RubricConverterProps {
  isOpen?: boolean;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const RubricConverterModal: React.FC<RubricConverterProps> = ({ 
  isOpen = true, 
  onClose,
  isEmbedded = false 
}) => {
  const [rubricInput, setRubricInput] = useState<number>(4.00);
  const [baseMaxScore, setBaseMaxScore] = useState<number>(25);
  const [copied, setCopied] = useState<boolean>(false);

  // Exact standard calculation based on prompt mapping: 4.00=25, 3.50=21, 2.75=13, 1.00=1
  // Formula or interpolation for custom intermediate points
  const calculateRawScore = (score: number, base: number = 25): { rawScore: number; percentage: number; descriptor: string; level: string } => {
    // Clamp score between 1.00 and 4.00
    const clamped = Math.max(1.0, Math.min(4.0, score));

    // Standard DepEd / TVET JHS CSS Rubric scale interpolation
    // Exact checkpoints:
    // 4.00 -> 25 (100%)
    // 3.75 -> 23 (92%)
    // 3.50 -> 21 (84%)
    // 3.25 -> 18 (72%)
    // 3.00 -> 16 (64%)
    // 2.75 -> 13 (52%)
    // 2.50 -> 10 (40%)
    // 2.00 -> 7 (28%)
    // 1.50 -> 4 (16%)
    // 1.00 -> 1 (4%)
    
    // Find closest exact match if exact
    const exact = DEFAULT_RUBRIC_MAPPINGS.find(m => Math.abs(m.rubricScore - clamped) < 0.01);
    
    let raw25: number;
    let desc = '';
    let level = '';

    if (exact) {
      raw25 = exact.rawScore;
      desc = exact.descriptor;
      level = exact.label;
    } else {
      // Linear piecewise interpolation between standard anchors
      const anchors = DEFAULT_RUBRIC_MAPPINGS.slice().sort((a, b) => a.rubricScore - b.rubricScore);
      let lower = anchors[0];
      let upper = anchors[anchors.length - 1];

      for (let i = 0; i < anchors.length - 1; i++) {
        if (clamped >= anchors[i].rubricScore && clamped <= anchors[i + 1].rubricScore) {
          lower = anchors[i];
          upper = anchors[i + 1];
          break;
        }
      }

      const ratio = (clamped - lower.rubricScore) / (upper.rubricScore - lower.rubricScore || 1);
      raw25 = Math.round(lower.rawScore + ratio * (upper.rawScore - lower.rawScore));
      desc = clamped >= 3.5 ? 'Very Satisfactory to Exemplary proficiency' : clamped >= 2.5 ? 'Approaching to Satisfactory performance' : 'Developing skill; requires practice';
      level = `${clamped.toFixed(2)} / 4.00`;
    }

    // Scale to custom base if not 25
    const scaledScore = base === 25 ? raw25 : Math.round((raw25 / 25) * base);
    const percentage = Math.round((scaledScore / base) * 100);

    return { rawScore: scaledScore, percentage, descriptor: desc, level };
  };

  const currentResult = calculateRawScore(rubricInput, baseMaxScore);

  const handleCopy = () => {
    const text = `Rubric Score: ${rubricInput.toFixed(2)}/4.00 => Raw Score: ${currentResult.rawScore}/${baseMaxScore} (${currentResult.percentage}%) [${currentResult.level}]`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const content = (
    <div className="space-y-6" id="rubric-converter-panel">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-display">
                CSS 4.00-Scale Rubric to Raw Score Converter
              </h3>
              <p className="text-xs text-slate-400">
                Standard technical scoring matrix for Computer Systems Servicing laboratory tasks
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Base Max Score:</label>
          <select 
            value={baseMaxScore} 
            onChange={(e) => setBaseMaxScore(Number(e.target.value))}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
            id="rubric-base-max-select"
          >
            <option value={25}>25 Pts (Standard JHS Lab)</option>
            <option value={50}>50 Pts (Summative Assessment)</option>
            <option value={100}>100 Pts (Quarterly Exam)</option>
            <option value={20}>20 Pts (Daily Practical)</option>
            <option value={10}>10 Pts (Quick Drill)</option>
          </select>
        </div>
      </div>

      {/* Interactive Input & Output Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Input Column */}
        <div className="md:col-span-6 bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              Rubric Score Input (4.00 Scale)
            </label>
            <div className="flex items-center gap-1.5">
              <input 
                type="number"
                step="0.05"
                min="1.00"
                max="4.00"
                value={rubricInput}
                onChange={(e) => setRubricInput(Number(e.target.value))}
                className="w-20 px-2.5 py-1 text-center font-mono font-bold text-base rounded-lg bg-slate-950 border border-blue-500/40 text-blue-400 focus:outline-none focus:border-blue-400"
                id="rubric-number-input"
              />
              <span className="text-xs text-slate-500 font-mono">/ 4.00</span>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-2 pt-2">
            <input 
              type="range"
              min="1.00"
              max="4.00"
              step="0.05"
              value={rubricInput}
              onChange={(e) => setRubricInput(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              id="rubric-range-slider"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-500 px-1">
              <span>1.00 (Min)</span>
              <span>2.00</span>
              <span>3.00</span>
              <span>4.00 (Max)</span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="pt-2">
            <p className="text-xs text-slate-400 mb-2">Standard Benchmarks:</p>
            <div className="grid grid-cols-5 gap-1.5">
              {[4.00, 3.50, 3.00, 2.75, 1.00].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRubricInput(val)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    Math.abs(rubricInput - val) < 0.02
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {val.toFixed(2)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Computed Box */}
        <div className="md:col-span-6 bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/30 rounded-xl p-5 border border-blue-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Computed Raw Score
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                title="Copy conversion text"
                id="rubric-copy-button"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <div className="text-4xl font-extrabold text-white font-display tracking-tight">
                {currentResult.rawScore}
              </div>
              <span className="text-base text-slate-400 font-mono">
                / {baseMaxScore} pts
              </span>
              <span className="ml-auto px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {currentResult.percentage}%
              </span>
            </div>

            <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-xs font-semibold text-slate-300">
                {currentResult.level}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {currentResult.descriptor}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Scale mapping: 4.00 ➔ 25 pts</span>
            <span>Step: (4.00=25, 3.50=21, 2.75=13, 1.00=1)</span>
          </div>
        </div>
      </div>

      {/* Reference Lookup Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            CSS Standard Laboratory Conversion Table
          </h4>
          <span className="text-[11px] text-slate-500">
            Based on JHS DepEd / TESDA Rubric Equivalencies
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="px-3.5 py-2.5 font-semibold">Rubric (4.00)</th>
                <th className="px-3.5 py-2.5 font-semibold">Raw Score (25)</th>
                <th className="px-3.5 py-2.5 font-semibold">Equiv %</th>
                <th className="px-3.5 py-2.5 font-semibold">Qualitative Descriptor</th>
                <th className="px-3.5 py-2.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {DEFAULT_RUBRIC_MAPPINGS.map((item) => {
                const isSelected = Math.abs(rubricInput - item.rubricScore) < 0.02;
                return (
                  <tr 
                    key={item.rubricScore}
                    className={`transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-950/50 text-blue-200 font-semibold' 
                        : 'hover:bg-slate-800/40'
                    }`}
                    onClick={() => setRubricInput(item.rubricScore)}
                  >
                    <td className="px-3.5 py-2 text-blue-400 font-bold">
                      {item.rubricScore.toFixed(2)}
                    </td>
                    <td className="px-3.5 py-2 font-bold text-white">
                      {item.rawScore} pts
                    </td>
                    <td className="px-3.5 py-2 text-slate-400">
                      {Math.round((item.rawScore / 25) * 100)}%
                    </td>
                    <td className="px-3.5 py-2 font-sans text-slate-300 text-xs">
                      {item.descriptor}
                    </td>
                    <td className="px-3.5 py-2 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRubricInput(item.rubricScore);
                        }}
                        className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        Apply
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl shadow-blue-950/40"
        id="rubric-modal-container"
      >
        <div className="flex justify-end pb-2">
          {onClose && (
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition-colors"
              id="rubric-close-btn"
            >
              ✕ Close
            </button>
          )}
        </div>
        {content}
      </div>
    </div>
  );
};
