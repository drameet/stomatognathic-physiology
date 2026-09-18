import { REST_INCISAL_POINT } from './tmjKinematics';

export interface PosseltPoint {
  id: string;
  name: string;
  pos: [number, number, number];
}

export interface PosseltEnvelopeData {
  keyPoints: PosseltPoint[];
  sagittalBorderPoints: [number, number, number][];
  frontalBorderPoints: [number, number, number][];
  horizontalBorderPoints: [number, number, number][];
  gridLines: [number, number, number][][];
}

export function generatePosseltEnvelope(): PosseltEnvelopeData {
  const [x0, y0, z0] = REST_INCISAL_POINT; // [0.0, -74.5, 52.0]

  // Key border landmark coordinates (relative to resting incisal tip)
  // CR: Centric Relation (~1mm posterior and slightly inferior to MIP)
  const pCR: [number, number, number] = [x0, y0 - 0.5, z0 - 1.2];
  // MIP: Maximum Intercuspation (the anatomical resting occlusion)
  const pMIP: [number, number, number] = [x0, y0, z0];
  // P: Maximum Protrusion (~8.5mm anterior, edge-to-edge slide with slight downward glide)
  const pPR: [number, number, number] = [x0, y0 - 1.5, z0 + 8.5];
  // H: Terminal Hinge Opening (~20mm opening arc along posterior border, pure rotation)
  const pH: [number, number, number] = [x0, y0 - 20.0, z0 - 5.5];
  // MO: Maximum Opening (~48mm inferior, ~8mm anterior due to condylar translation)
  const pMO: [number, number, number] = [x0, y0 - 48.0, z0 + 8.0];

  // Lateral excursion peaks at MIP level (~10mm left and right, with slight incisal rise)
  const pLL: [number, number, number] = [x0 + 10.0, y0 - 1.8, z0 + 1.5];
  const pRL: [number, number, number] = [x0 - 10.0, y0 - 1.8, z0 + 1.5];

  // Lateral excursion peaks at mid-opening (20mm)
  const pLL_mid: [number, number, number] = [x0 + 6.5, y0 - 22.0, z0 + 2.0];
  const pRL_mid: [number, number, number] = [x0 - 6.5, y0 - 22.0, z0 + 2.0];

  const keyPoints: PosseltPoint[] = [
    { id: 'CR', name: 'Centric Relation (CR)', pos: pCR },
    { id: 'MIP', name: 'Maximum Intercuspation (MIP)', pos: pMIP },
    { id: 'PR', name: 'Maximum Protrusion', pos: pPR },
    { id: 'H', name: 'Terminal Hinge Limit (20mm)', pos: pH },
    { id: 'MO', name: 'Maximum Opening (48mm)', pos: pMO },
    { id: 'LL', name: 'Left Lateral Excursion', pos: pLL },
    { id: 'RL', name: 'Right Lateral Excursion', pos: pRL }
  ];

  // Generate smooth sagittal border curve (B-spline / sampled points)
  const sagittalBorderPoints: [number, number, number][] = [];

  // 1. CR to MIP (Retrusive glide)
  for (let t = 0; t <= 1; t += 0.2) {
    sagittalBorderPoints.push([
      x0,
      pCR[1] + (pMIP[1] - pCR[1]) * t,
      pCR[2] + (pMIP[2] - pCR[2]) * t
    ]);
  }

  // 2. MIP to Protrusion (Incisal guidance slide)
  for (let t = 0; t <= 1; t += 0.1) {
    // slight initial dip over incisal edge
    const dip = Math.sin(t * Math.PI) * -0.8;
    sagittalBorderPoints.push([
      x0,
      pMIP[1] + (pPR[1] - pMIP[1]) * t + dip,
      pMIP[2] + (pPR[2] - pMIP[2]) * t
    ]);
  }

  // 3. Protrusion to Maximum Opening (Anterior border)
  for (let t = 0; t <= 1; t += 0.08) {
    sagittalBorderPoints.push([
      x0,
      pPR[1] + (pMO[1] - pPR[1]) * t,
      pPR[2] + (pMO[2] - pPR[2]) * t
    ]);
  }

  // 4. Maximum Opening to Terminal Hinge (Translatory closure)
  for (let t = 0; t <= 1; t += 0.08) {
    sagittalBorderPoints.push([
      x0,
      pMO[1] + (pH[1] - pMO[1]) * t,
      pMO[2] + (pH[2] - pMO[2]) * t
    ]);
  }

  // 5. Terminal Hinge to CR (Posterior rotational arc)
  for (let t = 0; t <= 1; t += 0.08) {
    // Circular arc around condylar axis (R ≈ 73mm)
    const arcZ = Math.sin(t * Math.PI) * -1.5;
    sagittalBorderPoints.push([
      x0,
      pH[1] + (pCR[1] - pH[1]) * t,
      pH[2] + (pCR[2] - pH[2]) * t + arcZ
    ]);
  }

  // Frontal shield (Gothic arch projection): MIP -> LL -> MO -> RL -> MIP
  const frontalBorderPoints: [number, number, number][] = [
    pMIP,
    pLL,
    pLL_mid,
    pMO,
    pRL_mid,
    pRL,
    pMIP
  ];

  // Horizontal rhomboid / diamond border at occlusal table level
  const horizontalBorderPoints: [number, number, number][] = [
    pCR,
    pLL,
    pPR,
    pRL,
    pCR
  ];

  // Cage grid lines connecting borders into a full 3D envelope
  const gridLines: [number, number, number][][] = [
    // Sagittal loop
    sagittalBorderPoints,
    // Horizontal occlusal diamond
    horizontalBorderPoints,
    // Frontal shield
    frontalBorderPoints,
    // Lateral ribs
    [pPR, pLL, pMO],
    [pPR, pRL, pMO],
    [pCR, pLL_mid, pMO],
    [pCR, pRL_mid, pMO],
    [pH, pLL_mid],
    [pH, pRL_mid]
  ];

  return {
    keyPoints,
    sagittalBorderPoints,
    frontalBorderPoints,
    horizontalBorderPoints,
    gridLines
  };
}
