import React from 'react';
import { ForceSolverResults } from '../../physics/forceSolver';
import { MandibularKinematics } from '../../physics/tmjKinematics';
import { Activity, ShieldAlert, Cpu, Compass, X } from 'lucide-react';

interface TelemetryPanelProps {
  forceResults: ForceSolverResults;
  kinematics: MandibularKinematics;
  contactSiteName: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  forceResults,
  kinematics,
  contactSiteName,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const {
    biteForceN,
    tmjCompressionLeftN,
    tmjCompressionRightN,
    totalElevatorForceN,
    mechanicalAdvantage,
    clinicalNote
  } = forceResults;

  const leftDisp = kinematics.condyleDispLeft;
  const rightDisp = kinematics.condyleDispRight;

  const renderCards = () => (
    <>
      {/* Occlusal Bite Force Card */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 shadow-inner">
        <div className="flex justify-between items-center text-slate-400 mb-1">
          <span className="font-mono uppercase text-[10px] tracking-wider">Occlusal Bite Force</span>
          <span className="text-[11px] text-cyan-300 font-semibold">{contactSiteName}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-extrabold tracking-tight font-mono text-cyan-300">
            {biteForceN.toFixed(1)} <span className="text-sm font-normal text-slate-400">N</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Mech. Advantage</div>
            <div className="font-mono text-xs font-semibold text-emerald-400">{mechanicalAdvantage}x</div>
          </div>
        </div>
        {/* Progress gauge */}
        <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-100"
            style={{ width: `${Math.min(100, (biteForceN / 650) * 100)}%` }}
          />
        </div>
      </div>

      {/* Bilateral TMJ Compressive Joint Load Card */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 shadow-inner">
        <div className="flex justify-between items-center text-slate-400 mb-2">
          <span className="font-mono uppercase text-[10px] tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            Bilateral TMJ Compressive Load
          </span>
          <span className="text-[10px] text-slate-400">F_joint (N)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* Left TMJ */}
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-750">
            <div className="text-[10px] text-slate-400 mb-0.5">Left Condyle (Disc)</div>
            <div className="font-mono text-lg font-bold text-amber-300">
              {tmjCompressionLeftN.toFixed(1)} <span className="text-xs font-normal text-slate-500">N</span>
            </div>
            <div className="w-full bg-slate-950 h-1 rounded mt-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-100"
                style={{ width: `${Math.min(100, (tmjCompressionLeftN / 300) * 100)}%` }}
              />
            </div>
          </div>

          {/* Right TMJ */}
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-750">
            <div className="text-[10px] text-slate-400 mb-0.5">Right Condyle (Disc)</div>
            <div className="font-mono text-lg font-bold text-amber-300">
              {tmjCompressionRightN.toFixed(1)} <span className="text-xs font-normal text-slate-500">N</span>
            </div>
            <div className="w-full bg-slate-950 h-1 rounded mt-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-100"
                style={{ width: `${Math.min(100, (tmjCompressionRightN / 300) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Condylar 3D Trajectory Displacement Card */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 shadow-inner">
        <div className="flex justify-between items-center text-slate-400 mb-2">
          <span className="font-mono uppercase text-[10px] tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            Condylar Translation Vector
          </span>
          <span className="text-[10px] text-sky-400 font-mono">ΔX / ΔY / ΔZ</span>
        </div>

        <div className="space-y-2 font-mono text-[11px]">
          {/* Left Condyle Vector */}
          <div className="bg-slate-900/60 px-2 py-1.5 rounded flex justify-between items-center border border-slate-800">
            <span className="text-slate-400 font-sans">L-Condyle:</span>
            <span className="text-sky-300">
              [{leftDisp.dx >= 0 ? '+' : ''}{leftDisp.dx.toFixed(1)}, {leftDisp.dy >= 0 ? '+' : ''}{leftDisp.dy.toFixed(1)}, {leftDisp.dz >= 0 ? '+' : ''}{leftDisp.dz.toFixed(1)}] mm
            </span>
            <span className="text-slate-400 text-[10px] font-semibold">|{leftDisp.total.toFixed(1)}| mm</span>
          </div>

          {/* Right Condyle Vector */}
          <div className="bg-slate-900/60 px-2 py-1.5 rounded flex justify-between items-center border border-slate-800">
            <span className="text-slate-400 font-sans">R-Condyle:</span>
            <span className="text-sky-300">
              [{rightDisp.dx >= 0 ? '+' : ''}{rightDisp.dx.toFixed(1)}, {rightDisp.dy >= 0 ? '+' : ''}{rightDisp.dy.toFixed(1)}, {rightDisp.dz >= 0 ? '+' : ''}{rightDisp.dz.toFixed(1)}] mm
            </span>
            <span className="text-slate-400 text-[10px] font-semibold">|{rightDisp.total.toFixed(1)}| mm</span>
          </div>
        </div>
      </div>

      {/* Lever Mechanics Breakdown */}
      <div className="bg-slate-800/40 border border-slate-750 rounded-xl p-3">
        <div className="text-[10px] text-slate-400 uppercase font-mono mb-1">System Equilibrium</div>
        <div className="flex justify-between text-slate-300 py-0.5">
          <span>Total Elevator Tension:</span>
          <span className="font-mono font-semibold">{totalElevatorForceN.toFixed(1)} N</span>
        </div>
        <div className="flex justify-between text-slate-300 py-0.5">
          <span>Lever Classification:</span>
          <span className="font-mono text-cyan-300">Class III Mandibular</span>
        </div>
      </div>

      {/* Clinical Consultation Alert */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-slate-200 mb-0.5">Clinical Biomechanics Note:</div>
          <p className="text-slate-400 leading-relaxed">{clinicalNote}</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (>= 1024px) */}
      <aside className="hidden lg:flex w-80 md:w-96 flex-col gap-3 p-4 bg-slate-900/90 backdrop-blur-xl border-l border-slate-800 text-slate-100 shadow-2xl overflow-y-auto max-h-screen text-xs select-none">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="font-semibold tracking-wide uppercase text-slate-100 text-sm">Real-Time Telemetry</h2>
          </div>
          <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
            ArtiSynth Live
          </span>
        </div>
        {renderCards()}
      </aside>

      {/* Mobile / Tablet Bottom Sheet Drawer (< 1024px) */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-40 lg:hidden"
            onClick={onCloseMobile}
          />
          <div className="fixed bottom-0 left-0 right-0 max-h-[82vh] bg-slate-900/95 backdrop-blur-2xl border-t border-slate-700 p-4 rounded-t-2xl shadow-2xl z-50 overflow-y-auto flex flex-col gap-3 safe-bottom text-xs select-none lg:hidden animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-1 shrink-0" />
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h2 className="font-semibold tracking-wide uppercase text-slate-100 text-sm">Real-Time Telemetry</h2>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
                title="Close Telemetry Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderCards()}
          </div>
        </>
      )}
    </>
  );
};

