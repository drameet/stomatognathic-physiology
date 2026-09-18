import React from 'react';
import { ShieldCheck, Zap, X } from 'lucide-react';

export interface InspectedAnatomy {
  id: string;
  name: string;
  fma: string;
  category: 'muscle' | 'bone' | 'tooth' | 'joint';
  side?: 'left' | 'right' | 'bilateral' | 'midline';
  action?: string;
  origin?: string;
  insertion?: string;
  forceN?: number;
  maxForceN?: number;
  strainPct?: number;
  activationPct?: number;
}

interface AnatomicalTooltipProps {
  item: InspectedAnatomy | null;
  onClose: () => void;
  onToggleIsolate?: (id: string) => void;
  isIsolated?: boolean;
}

export const AnatomicalTooltip: React.FC<AnatomicalTooltipProps> = ({
  item,
  onClose,
  onToggleIsolate,
  isIsolated
}) => {
  if (!item) return null;

  const isMuscle = item.category === 'muscle';
  const forcePct = item.forceN && item.maxForceN ? Math.round((item.forceN / item.maxForceN) * 100) : 0;

  return (
    <div className="absolute top-16 right-4 z-20 w-80 bg-slate-950/92 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl p-4 text-slate-200 animate-in fade-in slide-in-from-right-2 duration-200">
      {/* Card Header */}
      <div className="flex items-start justify-between border-b border-slate-800/80 pb-2.5 mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`inline-block w-2 h-2 rounded-full ${isMuscle ? 'bg-rose-500 animate-pulse' : 'bg-cyan-400'}`}></span>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
              {item.category.toUpperCase()} {item.side ? `· ${item.side.toUpperCase()}` : ''}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-slate-100 mt-0.5 leading-snug">{item.name}</h4>
          <span className="inline-block mt-1 px-1.5 py-0.5 bg-slate-800/80 text-slate-400 text-[10px] font-mono rounded border border-slate-700/50">
            {item.fma}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          title="Close inspection card"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Clinical Description / Action */}
      {item.action && (
        <div className="mb-3 text-xs text-slate-300 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed">
          <span className="text-[10px] font-mono text-cyan-400/80 uppercase block mb-1">Functional Action</span>
          {item.action}
        </div>
      )}

      {/* Origin & Insertion (for Muscles) */}
      {(item.origin || item.insertion) && (
        <div className="space-y-1.5 mb-3 text-[11px] text-slate-400">
          {item.origin && (
            <div className="flex items-start space-x-1.5">
              <span className="font-mono text-slate-500 text-[10px] uppercase shrink-0 w-14">Origin:</span>
              <span className="text-slate-300">{item.origin}</span>
            </div>
          )}
          {item.insertion && (
            <div className="flex items-start space-x-1.5">
              <span className="font-mono text-slate-500 text-[10px] uppercase shrink-0 w-14">Insert:</span>
              <span className="text-slate-300">{item.insertion}</span>
            </div>
          )}
        </div>
      )}

      {/* Live Biomechanical Telemetry (if Muscle) */}
      {isMuscle && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2.5 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-mono">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Contractile Load
            </span>
            <span className="font-mono font-bold text-amber-300">
              {item.forceN !== undefined ? `${item.forceN.toFixed(1)} N` : '0.0 N'}
              <span className="text-[10px] text-slate-500 font-normal ml-1">/ {item.maxForceN} N</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-150"
              style={{ width: `${Math.min(100, Math.max(0, forcePct))}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px] font-mono uppercase">Activation</span>
              <span className="font-mono font-semibold text-slate-200">
                {item.activationPct !== undefined ? `${item.activationPct.toFixed(0)}%` : '5%'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-mono uppercase">Fiber Strain</span>
              <span className="font-mono font-semibold text-cyan-300">
                {item.strainPct !== undefined ? `${item.strainPct > 0 ? '+' : ''}${item.strainPct.toFixed(1)}%` : '0.0%'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      {onToggleIsolate && (
        <button
          onClick={() => onToggleIsolate(item.id)}
          className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            isIsolated
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          {isIsolated ? 'Reset Anatomy Transparency' : 'Isolate Anatomical Focus'}
        </button>
      )}
    </div>
  );
};
