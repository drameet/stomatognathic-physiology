import React, { useState } from 'react';
import { OcclusalContactSite } from '../../physics/forceSolver';
import { Play, Pause, RotateCcw, Box, Layers, Eye, Camera, ChevronDown, ChevronUp, Sliders } from 'lucide-react';

export type SimulationMode = 'manual' | 'posselt' | 'chewing' | 'clench';

interface ControlDeckProps {
  mode: SimulationMode;
  setMode: (mode: SimulationMode) => void;
  // Kinematic state
  openingMm: number;
  setOpeningMm: (val: number) => void;
  protrusionMm: number;
  setProtrusionMm: (val: number) => void;
  lateralMm: number;
  setLateralMm: (val: number) => void;
  condylarGuidanceDeg: number;
  setCondylarGuidanceDeg: (val: number) => void;
  bennettAngleDeg: number;
  setBennettAngleDeg: (val: number) => void;
  // Clenching state
  clenchIntensity: number;
  setClenchIntensity: (val: number) => void;
  contactSite: OcclusalContactSite;
  setContactSite: (site: OcclusalContactSite) => void;
  // Chewing animation state
  isPlayingChew: boolean;
  setIsPlayingChew: (val: boolean) => void;
  // Visual toggles
  showMuscles: boolean;
  setShowMuscles: (val: boolean) => void;
  showPosselt: boolean;
  setShowPosselt: (val: boolean) => void;
  showBones: boolean;
  setShowBones: (val: boolean) => void;
  // Reset
  onReset: () => void;
  // Camera Presets
  cameraPreset?: string | null;
  setCameraPreset?: (preset: string) => void;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  mode,
  setMode,
  openingMm,
  setOpeningMm,
  protrusionMm,
  setProtrusionMm,
  lateralMm,
  setLateralMm,
  condylarGuidanceDeg,
  setCondylarGuidanceDeg,
  bennettAngleDeg,
  setBennettAngleDeg,
  clenchIntensity,
  setClenchIntensity,
  contactSite,
  setContactSite,
  isPlayingChew,
  setIsPlayingChew,
  showMuscles,
  setShowMuscles,
  showPosselt,
  setShowPosselt,
  showBones,
  setShowBones,
  onReset,
  cameraPreset,
  setCameraPreset
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <footer className="w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 p-2.5 sm:p-4 text-slate-200 shadow-2xl z-20 safe-bottom transition-all duration-200">
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
        {/* Top Control Bar: Mode Selectors + Collapse Button */}
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Mode Selector Buttons (Horizontally scrollable on mobile) */}
          <div className="overflow-x-auto no-scrollbar flex items-center space-x-1.5 bg-slate-950 p-1 sm:p-1.5 rounded-xl border border-slate-800 shrink-0 max-w-[calc(100%-48px)] sm:max-w-none">
            <button
              onClick={() => { setMode('manual'); setIsPlayingChew(false); }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                mode === 'manual'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Manual Sliders
            </button>
            <button
              onClick={() => { setMode('posselt'); setIsPlayingChew(false); setShowPosselt(true); }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                mode === 'posselt'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Posselt Envelope
            </button>
            <button
              onClick={() => { setMode('chewing'); setIsPlayingChew(true); }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                mode === 'chewing'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isPlayingChew ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>Chewing Cycle</span>
            </button>
            <button
              onClick={() => { setMode('clench'); setIsPlayingChew(false); }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                mode === 'clench'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bite Clench
            </button>
          </div>

          {/* Quick Collapse / Expand Toggle Button for Mobile Screen Estate */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center justify-center p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all text-xs"
              title={isCollapsed ? 'Expand Control Sliders' : 'Collapse Control Sliders'}
            >
              {isCollapsed ? (
                <span className="flex items-center gap-1 font-mono text-[11px] text-cyan-400">
                  <Sliders className="w-3.5 h-3.5" />
                  <ChevronUp className="w-3.5 h-3.5" />
                </span>
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Controls based on selected Mode (Collapsible on mobile) */}
        {!isCollapsed && (
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 text-xs pt-1 border-t border-slate-800/60 md:border-none md:pt-0">
            <div className="flex-1 w-full flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs">
              {mode === 'manual' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center justify-center gap-2.5 sm:gap-4 w-full">
                  {/* Opening Slider */}
                  <div className="flex items-center justify-between sm:justify-start space-x-2 bg-slate-950/50 lg:bg-transparent px-2.5 py-1.5 lg:p-0 rounded-lg border border-slate-800/80 lg:border-none">
                    <span className="text-slate-400 font-mono text-[11px] w-20 shrink-0">Opening:</span>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="0.5"
                      value={openingMm}
                      onChange={e => setOpeningMm(parseFloat(e.target.value))}
                      className="flex-1 lg:w-28 accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                    />
                    <span className="font-mono text-cyan-300 w-14 text-right shrink-0">{openingMm.toFixed(1)}mm</span>
                  </div>

                  {/* Protrusion Slider */}
                  <div className="flex items-center justify-between sm:justify-start space-x-2 bg-slate-950/50 lg:bg-transparent px-2.5 py-1.5 lg:p-0 rounded-lg border border-slate-800/80 lg:border-none">
                    <span className="text-slate-400 font-mono text-[11px] w-20 shrink-0">Protrusion:</span>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.2"
                      value={protrusionMm}
                      onChange={e => setProtrusionMm(parseFloat(e.target.value))}
                      className="flex-1 lg:w-24 accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                    />
                    <span className="font-mono text-cyan-300 w-14 text-right shrink-0">{protrusionMm.toFixed(1)}mm</span>
                  </div>

                  {/* Lateral Shift Slider */}
                  <div className="flex items-center justify-between sm:justify-start space-x-2 bg-slate-950/50 lg:bg-transparent px-2.5 py-1.5 lg:p-0 rounded-lg border border-slate-800/80 lg:border-none">
                    <span className="text-slate-400 font-mono text-[11px] w-20 sm:w-14 shrink-0">Lateral:</span>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="0.2"
                      value={lateralMm}
                      onChange={e => setLateralMm(parseFloat(e.target.value))}
                      className="flex-1 lg:w-20 accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                    />
                    <span className="font-mono text-cyan-300 w-14 text-right shrink-0">
                      {lateralMm > 0 ? `L ${lateralMm.toFixed(1)}` : lateralMm < 0 ? `R ${Math.abs(lateralMm).toFixed(1)}` : '0.0'}mm
                    </span>
                  </div>

                  {/* Condylar Guidance Angle Slider */}
                  <div className="flex items-center justify-between sm:justify-start space-x-2 bg-slate-950/50 lg:bg-transparent px-2.5 py-1.5 lg:p-0 rounded-lg border border-slate-800/80 lg:border-none">
                    <span className="text-slate-400 font-mono text-[11px] w-20 shrink-0">Guidance α:</span>
                    <input
                      type="range"
                      min="25"
                      max="55"
                      step="1"
                      value={condylarGuidanceDeg}
                      onChange={e => setCondylarGuidanceDeg(parseFloat(e.target.value))}
                      className="flex-1 lg:w-20 accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                    />
                    <span className="font-mono text-sky-300 w-10 text-right shrink-0">{condylarGuidanceDeg}°</span>
                  </div>

                  {/* Bennett Angle Slider */}
                  <div className="flex items-center justify-between sm:justify-start space-x-2 bg-slate-950/50 lg:bg-transparent px-2.5 py-1.5 lg:p-0 rounded-lg border border-slate-800/80 lg:border-none">
                    <span className="text-slate-400 font-mono text-[11px] w-20 sm:w-16 shrink-0">Bennett β:</span>
                    <input
                      type="range"
                      min="5"
                      max="25"
                      step="1"
                      value={bennettAngleDeg}
                      onChange={e => setBennettAngleDeg(parseFloat(e.target.value))}
                      className="flex-1 lg:w-20 accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                    />
                    <span className="font-mono text-sky-300 w-10 text-right shrink-0">{bennettAngleDeg}°</span>
                  </div>
                </div>
              )}

              {mode === 'posselt' && (
                <div className="flex items-center gap-2 text-xs font-mono overflow-x-auto no-scrollbar w-full py-1">
                  <span className="text-slate-400 shrink-0 text-[11px]">Border Trajectory:</span>
                  <button
                    onClick={() => { setOpeningMm(0); setProtrusionMm(0); setLateralMm(0); }}
                    className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 text-cyan-300 whitespace-nowrap"
                  >
                    MIP (0mm)
                  </button>
                  <button
                    onClick={() => { setOpeningMm(20); setProtrusionMm(0); setLateralMm(0); }}
                    className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 text-cyan-300 whitespace-nowrap"
                  >
                    Terminal Hinge (20mm)
                  </button>
                  <button
                    onClick={() => { setOpeningMm(48); setProtrusionMm(0); setLateralMm(0); }}
                    className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 text-cyan-300 whitespace-nowrap"
                  >
                    Max Opening (48mm)
                  </button>
                  <button
                    onClick={() => { setOpeningMm(1.5); setProtrusionMm(8.5); setLateralMm(0); }}
                    className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 text-cyan-300 whitespace-nowrap"
                  >
                    Protrusion (8.5mm)
                  </button>
                  <button
                    onClick={() => { setOpeningMm(2); setProtrusionMm(1); setLateralMm(8.5); }}
                    className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 text-cyan-300 whitespace-nowrap"
                  >
                    Left Lateral
                  </button>
                  <button
                    onClick={() => { setOpeningMm(2); setProtrusionMm(1); setLateralMm(-8.5); }}
                    className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 text-cyan-300 whitespace-nowrap"
                  >
                    Right Lateral
                  </button>
                </div>
              )}

              {mode === 'chewing' && (
                <div className="flex flex-wrap items-center justify-center gap-3 py-1">
                  <span className="text-slate-300 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Tear-Drop Chewing Stroke: Left Masticatory Cycle
                  </span>
                  <button
                    onClick={() => setIsPlayingChew(!isPlayingChew)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-slate-950 font-semibold text-xs transition-all"
                  >
                    {isPlayingChew ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingChew ? 'Pause' : 'Resume'}</span>
                  </button>
                </div>
              )}

              {mode === 'clench' && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full">
                  {/* Contact Site selector (Horizontally scrollable) */}
                  <div className="overflow-x-auto no-scrollbar flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 max-w-full">
                    {(['incisal', 'canine_left', 'molar_left', 'canine_right', 'molar_right'] as OcclusalContactSite[]).map(site => {
                      const labels: Record<OcclusalContactSite, { name: string; title: string }> = {
                        incisal: { name: 'Incisors', title: 'Protrusive Edge-to-Edge Guidance (1.5mm Open, 2.4mm Protrusion)' },
                        canine_left: { name: 'L-Canine', title: 'Left Canine-Guided Rise (1.2mm Open, -2.8mm Lateral Shift)' },
                        molar_left: { name: 'L-Molar', title: 'Left Molar Centric Stop (Maximum Intercuspation 0mm)' },
                        canine_right: { name: 'R-Canine', title: 'Right Canine-Guided Rise (1.2mm Open, +2.8mm Lateral Shift)' },
                        molar_right: { name: 'R-Molar', title: 'Right Molar Centric Stop (Maximum Intercuspation 0mm)' }
                      };
                      return (
                        <button
                          key={site}
                          onClick={() => setContactSite(site)}
                          title={labels[site].title}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-all ${
                            contactSite === site
                              ? 'bg-rose-500 text-white font-semibold shadow'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {labels[site].name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Clench Intensity Slider */}
                  <div className="flex items-center justify-between sm:justify-start space-x-2 bg-slate-950/50 lg:bg-transparent px-2.5 py-1 rounded-lg border border-slate-800/80 lg:border-none w-full sm:w-auto">
                    <span className="text-slate-400 font-mono text-[11px] shrink-0">Clench:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.02"
                      value={clenchIntensity}
                      onChange={e => setClenchIntensity(parseFloat(e.target.value))}
                      className="flex-1 sm:w-28 accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                    />
                    <span className="font-mono text-rose-400 w-10 text-right shrink-0">{Math.round(clenchIntensity * 100)}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Presets & Layer Toggles Row */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full md:w-auto border-t border-slate-800/60 md:border-none pt-2 md:pt-0">
              {/* Camera Perspective Presets */}
              <div className="overflow-x-auto no-scrollbar flex items-center space-x-1 shrink-0 md:border-l md:border-slate-800 md:pl-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1 mr-1">
                  <Camera className="w-3 h-3 text-cyan-400" /> View:
                </span>
                <button
                  onClick={() => setCameraPreset?.('default')}
                  className={`px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap transition-all ${
                    !cameraPreset || cameraPreset === 'default'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                  title="Standard 3/4 Clinical Oblique Perspective"
                >
                  3/4
                </button>
                <button
                  onClick={() => setCameraPreset?.('right_tmj')}
                  className={`px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap transition-all ${
                    cameraPreset === 'right_tmj'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                  title="Right TMJ Lateral / Sagittal Condyle View"
                >
                  R-TMJ
                </button>
                <button
                  onClick={() => setCameraPreset?.('left_tmj')}
                  className={`px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap transition-all ${
                    cameraPreset === 'left_tmj'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                  title="Left TMJ Lateral / Sagittal Condyle View"
                >
                  L-TMJ
                </button>
                <button
                  onClick={() => setCameraPreset?.('frontal')}
                  className={`px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap transition-all ${
                    cameraPreset === 'frontal'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                  title="Frontal Occlusal & Incisal Guidance View"
                >
                  Frontal
                </button>
                <button
                  onClick={() => setCameraPreset?.('submental')}
                  className={`px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap transition-all ${
                    cameraPreset === 'submental'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                  title="Submental Vertex / Axial Bennett Angle View"
                >
                  Axial
                </button>
              </div>

              {/* Visual Layer Toggles & Reset */}
              <div className="flex items-center space-x-1.5 shrink-0 border-l border-slate-800 pl-2 sm:pl-3">
                <button
                  onClick={() => setShowMuscles(!showMuscles)}
                  title="Toggle Muscle Force Vectors"
                  className={`p-1.5 sm:p-2 rounded-lg border text-xs transition-all ${
                    showMuscles ? 'bg-cyan-950 border-cyan-700 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <button
                  onClick={() => setShowPosselt(!showPosselt)}
                  title="Toggle Posselt 3D Wireframe Cage"
                  className={`p-1.5 sm:p-2 rounded-lg border text-xs transition-all ${
                    showPosselt ? 'bg-cyan-950 border-cyan-700 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <button
                  onClick={() => setShowBones(!showBones)}
                  title="Toggle Bones Visibility"
                  className={`p-1.5 sm:p-2 rounded-lg border text-xs transition-all ${
                    showBones ? 'bg-cyan-950 border-cyan-700 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <button
                  onClick={onReset}
                  title="Reset to Physiological Rest Position"
                  className="p-1.5 sm:p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};
