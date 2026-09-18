import React from 'react';
import { MuscleActivation } from '../../physics/forceSolver';

interface MuscleBarChartProps {
  muscles: MuscleActivation[];
}

export const MuscleBarChart: React.FC<MuscleBarChartProps> = ({ muscles }) => {
  // Group muscles by functional pair (e.g. Masseter, Temporalis, Medial Pterygoid, Lateral Pterygoid, Digastric)
  const groupedMuscles = [
    { name: 'Superficial Masseter', leftId: 'l_sm', rightId: 'r_sm' },
    { name: 'Deep Masseter', leftId: 'l_dm', rightId: 'r_dm' },
    { name: 'Anterior Temporalis', leftId: 'l_at', rightId: 'r_at' },
    { name: 'Posterior Temporalis', leftId: 'l_pt', rightId: 'r_pt' },
    { name: 'Medial Pterygoid', leftId: 'l_mp', rightId: 'r_mp' },
    { name: 'Inferior Lateral Pterygoid', leftId: 'l_ip', rightId: 'r_ip' },
    { name: 'Superior Lateral Pterygoid', leftId: 'l_sp', rightId: 'r_sp' },
    { name: 'Anterior Digastric', leftId: 'l_ad', rightId: 'r_ad' }
  ];

  const getMuscle = (id: string) => muscles.find(m => m.id === id);

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-xs text-slate-200 shadow-xl max-h-60 overflow-y-auto">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
        <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
          Masticatory Muscle Recruitment (EMG %)
        </span>
        <div className="flex gap-4 text-[10px] font-mono text-slate-400">
          <span className="text-cyan-400">● Left Side</span>
          <span className="text-indigo-400">● Right Side</span>
        </div>
      </div>

      <div className="space-y-2">
        {groupedMuscles.map(gm => {
          const lM = getMuscle(gm.leftId);
          const rM = getMuscle(gm.rightId);
          const lPct = lM ? Math.round(lM.activation * 100) : 0;
          const rPct = rM ? Math.round(rM.activation * 100) : 0;

          return (
            <div key={gm.name} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 truncate max-w-[150px]">{gm.name}</span>
                <span className="font-mono text-[10px] text-slate-400">
                  L: <span className="text-cyan-300 font-semibold">{lPct}%</span> ({lM?.forceN ?? 0}N) | R:{' '}
                  <span className="text-indigo-300 font-semibold">{rPct}%</span> ({rM?.forceN ?? 0}N)
                </span>
              </div>

              {/* Dual bilateral bar */}
              <div className="grid grid-cols-2 gap-1.5 h-1.5 bg-slate-950 rounded-full p-0.5 overflow-hidden">
                <div className="bg-slate-900 rounded-full flex justify-end overflow-hidden">
                  <div
                    className="bg-gradient-to-l from-cyan-400 to-sky-600 h-full rounded-full transition-all duration-100"
                    style={{ width: `${lPct}%` }}
                  />
                </div>
                <div className="bg-slate-900 rounded-full flex justify-start overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-400 to-violet-600 h-full rounded-full transition-all duration-100"
                    style={{ width: `${rPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
