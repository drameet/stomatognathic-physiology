import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Viewport } from './components/canvas/Viewport';
import { Header } from './components/hud/Header';
import { TelemetryPanel } from './components/hud/TelemetryPanel';
import { MuscleBarChart } from './components/hud/MuscleBarChart';
import { ControlDeck, SimulationMode } from './components/hud/ControlDeck';
import { InfoModal } from './components/hud/InfoModal';
import { AnatomicalTooltip, InspectedAnatomy } from './components/hud/AnatomicalTooltip';

import { computeMandibularKinematics } from './physics/tmjKinematics';
import { solveMasticatoryForces, OcclusalContactSite } from './physics/forceSolver';
import { computeDynamicMuscleLines } from './physics/muscleVectors';
import { generatePosseltEnvelope } from './physics/posseltGeometry';

const CONTACT_COORDINATES: Record<OcclusalContactSite, [number, number, number]> = {
  incisal: [0.0, -74.5, 52.0],
  canine_left: [12.2, -75.0, 48.5],
  canine_right: [-12.5, -75.0, 48.5],
  molar_left: [23.5, -67.1, 28.0],
  molar_right: [-23.8, -67.1, 28.0]
};

const CONTACT_NAMES: Record<OcclusalContactSite, string> = {
  incisal: 'Central Incisors',
  canine_left: 'Left Canine',
  canine_right: 'Right Canine',
  molar_left: 'Left 1st Molar',
  molar_right: 'Right 1st Molar'
};

export const App: React.FC = () => {
  // Mode
  const [mode, setMode] = useState<SimulationMode>('manual');

  // Kinematic parameters
  const [openingMm, setOpeningMm] = useState<number>(0.0);
  const [protrusionMm, setProtrusionMm] = useState<number>(0.0);
  const [lateralMm, setLateralMm] = useState<number>(0.0);
  const [condylarGuidanceDeg, setCondylarGuidanceDeg] = useState<number>(35.0);
  const [bennettAngleDeg, setBennettAngleDeg] = useState<number>(15.0);

  // Clench parameters
  const [clenchIntensity, setClenchIntensity] = useState<number>(0.0);
  const [contactSite, setContactSite] = useState<OcclusalContactSite>('incisal');

  // Chewing animation
  const [isPlayingChew, setIsPlayingChew] = useState<boolean>(false);
  const chewAnimRef = useRef<number | null>(null);

  // Visual toggles
  const [showMuscles, setShowMuscles] = useState<boolean>(true);
  const [showPosselt, setShowPosselt] = useState<boolean>(true);
  const [showBones, setShowBones] = useState<boolean>(true);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);

  // Raycast Anatomical Inspection Tooltip Card & Mobile HUD Drawer
  const [inspectedAnatomy, setInspectedAnatomy] = useState<InspectedAnatomy | null>(null);
  const [isolatedId, setIsolatedId] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<string>('default');
  const [isMobileTelemetryOpen, setIsMobileTelemetryOpen] = useState<boolean>(false);

  // Reset to physiological resting position
  const handleReset = () => {
    setOpeningMm(0.0);
    setProtrusionMm(0.0);
    setLateralMm(0.0);
    setClenchIntensity(0.0);
    setCondylarGuidanceDeg(35.0);
    setBennettAngleDeg(15.0);
    setIsPlayingChew(false);
  };

  // Handle Functional Occlusal Clench Positioning
  const handleSelectContactSite = (site: OcclusalContactSite) => {
    setContactSite(site);
    if (clenchIntensity < 0.2) {
      setClenchIntensity(0.70);
    }
    switch (site) {
      case 'incisal':
        // Protrusive edge-to-edge incisal guidance
        setOpeningMm(1.5);
        setProtrusionMm(2.4);
        setLateralMm(0.0);
        break;
      case 'canine_left':
        // Patient's Left canine guidance (shifts jaw to +X toward tooth 33)
        setOpeningMm(1.2);
        setProtrusionMm(0.4);
        setLateralMm(2.8);
        break;
      case 'canine_right':
        // Patient's Right canine guidance (shifts jaw to -X toward tooth 43)
        setOpeningMm(1.2);
        setProtrusionMm(0.4);
        setLateralMm(-2.8);
        break;
      case 'molar_left':
      case 'molar_right':
        // Molar centric occlusal stops in Maximum Intercuspation (MIP)
        setOpeningMm(0.0);
        setProtrusionMm(0.0);
        setLateralMm(0.0);
        break;
    }
  };

  const handleSetMode = (newMode: SimulationMode) => {
    setMode(newMode);
    if (newMode === 'clench') {
      setIsPlayingChew(false);
      handleSelectContactSite(contactSite);
    }
  };

  // Chewing Cycle Animated Stroke (Tear-drop path)
  useEffect(() => {
    if (!isPlayingChew || mode !== 'chewing') {
      if (chewAnimRef.current) cancelAnimationFrame(chewAnimRef.current);
      return;
    }

    let startTime = performance.now();
    const cycleDurationMs = 1200; // 1.2s per chewing stroke

    const animateChew = (time: number) => {
      const elapsed = (time - startTime) % cycleDurationMs;
      const progress = elapsed / cycleDurationMs; // 0.0 to 1.0

      if (progress < 0.45) {
        // Phase 1: Opening & lateral prep toward working side (Left)
        const p = progress / 0.45;
        setOpeningMm(Math.sin(p * Math.PI * 0.5) * 18.0);
        setLateralMm(-Math.sin(p * Math.PI * 0.5) * 5.5);
        setProtrusionMm(Math.sin(p * Math.PI * 0.5) * 1.5);
        setClenchIntensity(0.05);
      } else if (progress < 0.85) {
        // Phase 2: Crushing closure stroke toward Maximum Intercuspation (MIP)
        const p = (progress - 0.45) / 0.40;
        setOpeningMm((1.0 - p) * 18.0);
        setLateralMm(-5.5 * (1.0 - p));
        setProtrusionMm(1.5 * (1.0 - p));
        setClenchIntensity(Math.sin(p * Math.PI) * 0.75); // peak clench on closure
      } else {
        // Phase 3: Occlusal grinding pause at MIP
        setOpeningMm(0.0);
        setLateralMm(0.0);
        setProtrusionMm(0.0);
        setClenchIntensity(0.25);
      }

      chewAnimRef.current = requestAnimationFrame(animateChew);
    };

    chewAnimRef.current = requestAnimationFrame(animateChew);

    return () => {
      if (chewAnimRef.current) cancelAnimationFrame(chewAnimRef.current);
    };
  }, [isPlayingChew, mode]);

  // Compute Mandibular Kinematics
  const kinematics = useMemo(() => {
    return computeMandibularKinematics({
      openingMm,
      protrusionMm,
      lateralMm,
      condylarGuidanceDeg,
      bennettAngleDeg
    });
  }, [openingMm, protrusionMm, lateralMm, condylarGuidanceDeg, bennettAngleDeg]);

  // Solve Masticatory Forces & Joint Reactions
  const forceResults = useMemo(() => {
    return solveMasticatoryForces({
      clenchIntensity,
      contactSite,
      openingMm,
      protrusionMm,
      lateralMm
    });
  }, [clenchIntensity, contactSite, openingMm, protrusionMm, lateralMm]);

  // Dynamic Muscle Vector Lines
  const muscleActivationsMap = useMemo(() => {
    const map: Record<string, number> = {};
    forceResults.muscles.forEach(m => {
      map[m.id] = m.activation;
    });
    return map;
  }, [forceResults]);

  const muscleLines = useMemo(() => {
    return computeDynamicMuscleLines(kinematics, muscleActivationsMap);
  }, [kinematics, muscleActivationsMap]);

  // Posselt 3D Envelope Data
  const posseltData = useMemo(() => {
    return generatePosseltEnvelope();
  }, []);

  const activeContactPoint = CONTACT_COORDINATES[contactSite];

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        onOpenInfo={() => setIsInfoOpen(true)}
        onToggleTelemetry={() => setIsMobileTelemetryOpen((prev) => !prev)}
        isTelemetryOpen={isMobileTelemetryOpen}
      />

      {/* Main Interactive Stage */}
      <div className="relative flex-1 flex w-full h-full pt-14 overflow-hidden">
        {/* 3D WebGL Viewport */}
        <div className="flex-1 relative h-full">
          <Viewport
            kinematics={kinematics}
            muscleLines={muscleLines}
            posseltData={posseltData}
            showMuscles={showMuscles}
            showPosselt={showPosselt}
            showBones={showBones}
            activeContactPoint={activeContactPoint}
            onHoverAnatomy={setInspectedAnatomy}
            isolatedId={isolatedId}
            cameraPreset={cameraPreset}
            mode={mode}
          />

          {/* Floating Muscle EMG Panel (Top Right inside Viewport) */}
          <div className="absolute top-4 right-4 z-10 w-72 md:w-80 hidden sm:block">
            <MuscleBarChart muscles={forceResults.muscles} />
          </div>

          {/* Raycast Anatomical Inspection Tooltip Card (from ashemag/human-atlas) */}
          <AnatomicalTooltip
            item={inspectedAnatomy}
            onClose={() => setInspectedAnatomy(null)}
            onToggleIsolate={(id) => setIsolatedId((prev) => (prev === id ? null : id))}
            isIsolated={isolatedId === inspectedAnatomy?.id}
          />
        </div>

        {/* Right Telemetry Sidebar & Mobile HUD Drawer */}
        <TelemetryPanel
          forceResults={forceResults}
          kinematics={kinematics}
          contactSiteName={CONTACT_NAMES[contactSite]}
          isMobileOpen={isMobileTelemetryOpen}
          onCloseMobile={() => setIsMobileTelemetryOpen(false)}
        />
      </div>

      {/* Bottom Control Deck */}
      <ControlDeck
        mode={mode}
        setMode={handleSetMode}
        openingMm={openingMm}
        setOpeningMm={setOpeningMm}
        protrusionMm={protrusionMm}
        setProtrusionMm={setProtrusionMm}
        lateralMm={lateralMm}
        setLateralMm={setLateralMm}
        condylarGuidanceDeg={condylarGuidanceDeg}
        setCondylarGuidanceDeg={setCondylarGuidanceDeg}
        bennettAngleDeg={bennettAngleDeg}
        setBennettAngleDeg={setBennettAngleDeg}
        clenchIntensity={clenchIntensity}
        setClenchIntensity={setClenchIntensity}
        contactSite={contactSite}
        setContactSite={handleSelectContactSite}
        isPlayingChew={isPlayingChew}
        setIsPlayingChew={setIsPlayingChew}
        showMuscles={showMuscles}
        setShowMuscles={setShowMuscles}
        showPosselt={showPosselt}
        setShowPosselt={setShowPosselt}
        showBones={showBones}
        setShowBones={setShowBones}
        onReset={handleReset}
        cameraPreset={cameraPreset}
        setCameraPreset={setCameraPreset}
      />

      {/* Clinical Playbook Modal */}
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </div>
  );
};
export default App;
