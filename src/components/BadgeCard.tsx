import React, { useState } from 'react';
import { AwardedBadge } from '../types';
import { IconHelper } from './IconHelper';
import { Shield, Sparkles, CheckCircle2, AlertCircle, Calendar, Award, User, Tag, Lock, ArrowRight } from 'lucide-react';

interface BadgeCardProps {
  badge: AwardedBadge;
  onRedeemClick?: (badge: AwardedBadge) => void;
  showRedeemAction?: boolean;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ 
  badge, 
  onRedeemClick,
  showRedeemAction = false 
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const isRedeemed = badge.status === 'redeemed';

  // Rarity color mappings
  const rarityConfig = {
    bronze: {
      border: 'border-amber-700/60',
      badgeBg: 'bg-amber-950/40',
      glow: 'shadow-amber-900/20',
      text: 'text-amber-400',
      pill: 'bg-amber-900/30 text-amber-300 border-amber-700/40',
      label: 'Bronze'
    },
    silver: {
      border: 'border-slate-400/60',
      badgeBg: 'bg-slate-800/40',
      glow: 'shadow-slate-400/20',
      text: 'text-slate-200',
      pill: 'bg-slate-700/40 text-slate-200 border-slate-500/40',
      label: 'Silver'
    },
    gold: {
      border: 'border-yellow-500/70',
      badgeBg: 'bg-yellow-950/40',
      glow: 'shadow-yellow-500/30',
      text: 'text-yellow-400',
      pill: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      label: 'Gold'
    },
    diamond: {
      border: 'border-cyan-400/70',
      badgeBg: 'bg-cyan-950/40',
      glow: 'shadow-cyan-400/30',
      text: 'text-cyan-300',
      pill: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40',
      label: 'Diamond'
    },
    master: {
      border: 'border-purple-500/80',
      badgeBg: 'bg-purple-950/40',
      glow: 'shadow-purple-500/40',
      text: 'text-purple-300',
      pill: 'bg-purple-500/25 text-purple-200 border-purple-400/50',
      label: 'Master NC-II'
    }
  }[badge.rarity || 'bronze'];

  const categoryLabels = {
    hardware: { label: 'Hardware', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    networking: { label: 'Networking', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    software: { label: 'Software', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    safety: { label: 'OHS Safety', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    conduct: { label: 'Conduct & 5S', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    achievement: { label: 'Achievement', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' }
  }[badge.category || 'hardware'];

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className={`group relative rounded-2xl p-4 transition-all duration-300 cursor-pointer overflow-hidden border ${
          isRedeemed
            ? 'bg-slate-900/40 border-slate-800/80 grayscale opacity-65 hover:grayscale-0 hover:opacity-100 hover:border-slate-700'
            : `bg-slate-900/90 ${rarityConfig.border} shadow-lg ${rarityConfig.glow} hover:-translate-y-1 hover:shadow-xl`
        }`}
        id={`badge-card-${badge.id}`}
      >
        {/* Shimmer Effect for Active Gold/Diamond/Master Badges */}
        {!isRedeemed && (badge.rarity === 'gold' || badge.rarity === 'diamond' || badge.rarity === 'master') && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
        )}

        {/* Redeemed Stamp Badge */}
        {isRedeemed && (
          <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-slate-800/95 border border-slate-700 text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-slate-400" />
            USED / REDEEMED
          </div>
        )}

        {/* Top Chips */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${categoryLabels.color}`}>
            {categoryLabels.label}
          </span>
          
          {!isRedeemed && (
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${rarityConfig.pill}`}>
              {rarityConfig.label}
            </span>
          )}
        </div>

        {/* Badge Icon Medallion */}
        <div className="my-2 flex flex-col items-center justify-center text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center relative transition-transform duration-300 group-hover:scale-110 ${
            isRedeemed 
              ? 'bg-slate-800 text-slate-500 border border-slate-700'
              : `${rarityConfig.badgeBg} ${rarityConfig.text} border-2 ${rarityConfig.border} shadow-inner`
          }`}>
            <IconHelper name={badge.iconName} size={32} />
            {!isRedeemed && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            )}
          </div>

          <h4 className={`mt-3 text-sm font-bold font-display leading-snug line-clamp-1 ${
            isRedeemed ? 'text-slate-400' : 'text-slate-100 group-hover:text-blue-300'
          }`}>
            {badge.title}
          </h4>

          {badge.competencyCode && (
            <span className="text-[10px] font-mono text-slate-500 mt-0.5">
              {badge.competencyCode}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 mt-1 text-center min-h-[32px]">
          {badge.description}
        </p>

        {/* Card Footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(badge.awardedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>

          <span className={`font-semibold ${isRedeemed ? 'text-slate-500' : 'text-emerald-400'}`}>
            {isRedeemed ? 'Redeemed' : 'Active (RS +0.5)'}
          </span>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                isRedeemed ? 'bg-slate-800 text-slate-400' : `${rarityConfig.badgeBg} ${rarityConfig.text} border-2 ${rarityConfig.border}`
              }`}>
                <IconHelper name={badge.iconName} size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-display">
                  {badge.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${categoryLabels.color}`}>
                    {categoryLabels.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${rarityConfig.pill}`}>
                    {rarityConfig.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-1">
              <p className="font-medium">{badge.description}</p>
              {badge.competencyCode && (
                <p className="text-[11px] text-blue-400 font-mono">
                  Competency Code: {badge.competencyCode}
                </p>
              )}
            </div>

            {/* Details Grid */}
            <div className="space-y-2 text-xs text-slate-400 font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-500" /> Awarded Date:</span>
                <span className="text-slate-200">{new Date(badge.awardedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-500" /> Awarded By:</span>
                <span className="text-slate-200">{badge.awardedBy || 'Teacher'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-slate-500" /> Status:</span>
                <span className={`font-bold ${isRedeemed ? 'text-slate-400' : 'text-emerald-400'}`}>
                  {isRedeemed ? 'REDEEMED (Used for Score)' : 'ACTIVE (Counts toward Raw Score)'}
                </span>
              </div>
            </div>

            {/* Teacher Remarks if any */}
            {badge.remarks && (
              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/50 text-xs">
                <span className="font-bold text-blue-400 block mb-0.5">Teacher Remarks:</span>
                <p className="text-slate-300 italic">"{badge.remarks}"</p>
              </div>
            )}

            {/* If Redeemed, show redemption details */}
            {isRedeemed && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Redemption History:
                </span>
                <p className="text-slate-300">
                  Purpose: <span className="text-white font-medium">{badge.redemptionReason || 'Score conversion'}</span>
                </p>
                {badge.redeemedAt && (
                  <p className="text-slate-500 text-[11px]">
                    Date: {new Date(badge.redeemedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Close
              </button>

              {!isRedeemed && showRedeemAction && onRedeemClick && (
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    onRedeemClick(badge);
                  }}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/30 flex items-center justify-center gap-1"
                >
                  Redeem Badge <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
