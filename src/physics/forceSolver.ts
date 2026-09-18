import groundTruth from '../data/jawGroundTruth.json';

export type OcclusalContactSite = 'incisal' | 'canine_left' | 'canine_right' | 'molar_left' | 'molar_right';

export interface ForceSolverInputs {
  clenchIntensity: number; // 0.0 to 1.0 (0% to 100%)
  contactSite: OcclusalContactSite;
  openingMm: number;
  protrusionMm: number;
  lateralMm: number;
}

export interface MuscleActivation {
  id: string;
  name: string;
  group: string;
  side: 'left' | 'right';
  fmax: number;
  activation: number; // 0.0 to 1.0
  forceN: number;     // instantaneous force in Newtons
}

export interface ForceSolverResults {
  biteForceN: number;
  tmjCompressionLeftN: number;
  tmjCompressionRightN: number;
  totalElevatorForceN: number;
  mechanicalAdvantage: number;
  muscles: MuscleActivation[];
  leverClass: string;
  clinicalNote: string;
}

// Contact point moment arm definitions (distance along sagittal Z from condylar axis in mm)
// Real BodyParts3D Condylar axis is at Z = -23.5
const CONTACT_LOCATIONS: Record<OcclusalContactSite, { name: string; x: number; y: number; z: number; momentArmZ: number }> = {
  incisal: { name: 'Central Incisors', x: 0.0, y: -74.5, z: 52.0, momentArmZ: 75.5 },
  canine_left: { name: 'Left Canine (Tooth 33)', x: 12.2, y: -75.0, z: 48.5, momentArmZ: 72.0 },
  canine_right: { name: 'Right Canine (Tooth 43)', x: -12.5, y: -75.0, z: 48.5, momentArmZ: 72.0 },
  molar_left: { name: 'Left 1st Molar (Tooth 36)', x: 23.5, y: -67.1, z: 28.0, momentArmZ: 51.5 },
  molar_right: { name: 'Right 1st Molar (Tooth 46)', x: -23.8, y: -67.1, z: 28.0, momentArmZ: 51.5 }
};

// Muscle centroid moment arms along sagittal Z (from condylar hinge axis at Z = -25.0)
const MUSCLE_MOMENT_ARMS_Z: Record<string, number> = {
  Masseter: 45.0,        // Z ≈ 20.0
  Temporalis: 28.0,      // Z ≈ 3.0
  'Medial Pterygoid': 32.0, // Z ≈ 7.0
  'Lateral Pterygoid': 5.0, // Z ≈ -20.0
  Digastric: 65.0        // Z ≈ 40.0
};

export function solveMasticatoryForces(inputs: ForceSolverInputs): ForceSolverResults {
  const { clenchIntensity, contactSite, openingMm, lateralMm } = inputs;
  const contact = CONTACT_LOCATIONS[contactSite];

  // Base muscle activations depending on functional context
  const activations: MuscleActivation[] = groundTruth.muscles.map(m => {
    let act = 0.0;
    const isElevator = m.group === 'Masseter' || m.group === 'Temporalis' || m.group === 'Medial Pterygoid';

    if (clenchIntensity > 0.01) {
      if (isElevator) {
        act = clenchIntensity;
        // Asymmetric recruitment during unilateral lateral clenches
        if (contactSite === 'molar_left' || contactSite === 'canine_left') {
          if (m.side === 'left') act *= 1.05; // ipsilateral dominance
          else act *= 0.85; // contralateral balancing
        } else if (contactSite === 'molar_right' || contactSite === 'canine_right') {
          if (m.side === 'right') act *= 1.05;
          else act *= 0.85;
        }
        // Neuromuscular anterior guidance inhibition (Williamson & Lundquist 1983; Okeson)
        if (contactSite === 'incisal') {
          act *= 0.55; // Periodontal mechanoreceptor reflex dampens elevators by ~45%
        } else if (contactSite === 'canine_left' || contactSite === 'canine_right') {
          act *= 0.70; // Canine guidance disclusion dampens elevators by ~30%
        }
      } else if (m.group === 'Lateral Pterygoid') {
        // Lateral pterygoid stabilization & active eccentric translation
        act = clenchIntensity * 0.20;
        if (contactSite === 'incisal') {
          act = Math.max(act, clenchIntensity * 0.45); // Bilateral protrusion
        } else if (contactSite === 'canine_left' && m.side === 'right') {
          act = Math.max(act, clenchIntensity * 0.55); // Right balancing pterygoid drives left canine rise
        } else if (contactSite === 'canine_right' && m.side === 'left') {
          act = Math.max(act, clenchIntensity * 0.55); // Left balancing pterygoid drives right canine rise
        }
      }
    } else {
      // Resting / Opening tone
      if (openingMm > 5.0) {
        if (m.group === 'Digastric') act = Math.min(1.0, (openingMm / 50.0) * 0.85);
        if (m.group === 'Lateral Pterygoid') act = Math.min(1.0, (openingMm / 50.0) * 0.90);
      } else {
        act = 0.04; // passive resting tone
      }
    }

    // Adjust for lateral excursion recruitment (contralateral balancing pterygoid drives excursion)
    if (Math.abs(lateralMm) > 1.0 && m.group === 'Lateral Pterygoid') {
      if (lateralMm > 0 && m.side === 'right') act = Math.max(act, Math.abs(lateralMm) / 10.0 * 0.7); // Right pterygoid drives Left excursion
      if (lateralMm < 0 && m.side === 'left') act = Math.max(act, Math.abs(lateralMm) / 10.0 * 0.7);  // Left pterygoid drives Right excursion
    }

    act = Math.min(1.0, Math.max(0.0, act));
    return {
      id: m.id,
      name: m.name,
      group: m.group,
      side: m.side as 'left' | 'right',
      fmax: m.fmax,
      activation: act,
      forceN: parseFloat((act * m.fmax).toFixed(1))
    };
  });

  // Calculate total vertical elevator muscle force (Masseter + Temporalis + Medial Pterygoid)
  let totalElevatorForceN = 0.0;
  let totalMuscleMomentNm = 0.0;

  activations.forEach(m => {
    if (m.group === 'Masseter' || m.group === 'Temporalis' || m.group === 'Medial Pterygoid') {
      totalElevatorForceN += m.forceN;
      const armM = (MUSCLE_MOMENT_ARMS_Z[m.group] || 35.0) / 1000.0; // mm to meters
      totalMuscleMomentNm += m.forceN * armM;
    }
  });

  // Moment equilibrium around condylar hinge axis:
  // ΣM_condyle = 0 => F_bite * arm_bite = totalMuscleMoment
  // F_bite = totalMuscleMoment / arm_bite
  const biteArmM = contact.momentArmZ / 1000.0;
  let biteForceN = totalMuscleMomentNm / Math.max(0.02, biteArmM);

  // Apply non-linear efficiency loss if jaw is widely separated
  const openingEfficiencyFactor = Math.max(0.2, 1.0 - (openingMm / 50.0) * 0.65);
  biteForceN *= openingEfficiencyFactor;

  // Vertical force equilibrium:
  // ΣF_vertical = 0 => F_elevators - F_bite - F_TMJ = 0
  // F_TMJ = totalElevatorForce - F_bite
  const totalJointLoad = Math.max(0, totalElevatorForceN * openingEfficiencyFactor - biteForceN);

  // Bilateral joint force distribution based on contact eccentricity
  let tmjCompressionLeftN = totalJointLoad * 0.5;
  let tmjCompressionRightN = totalJointLoad * 0.5;

  if (contactSite === 'molar_left' || contactSite === 'canine_left') {
    // Unilateral left clench: fulcrum shifts to left teeth.
    // The contralateral (right) balancing condyle experiences higher compressive reaction!
    tmjCompressionRightN = totalJointLoad * 0.68;
    tmjCompressionLeftN = totalJointLoad * 0.32;
  } else if (contactSite === 'molar_right' || contactSite === 'canine_right') {
    tmjCompressionLeftN = totalJointLoad * 0.68;
    tmjCompressionRightN = totalJointLoad * 0.32;
  }

  const mechanicalAdvantage = parseFloat((biteForceN / Math.max(1, totalElevatorForceN)).toFixed(2));

  let clinicalNote = '';
  if (contactSite === 'molar_left' || contactSite === 'molar_right') {
    clinicalNote = 'Molar Clench (Centric MIP): Zero displacement (0mm). Short load arm maximizes bite force efficiency (0.68x). Contralateral condyle absorbs 68% of joint compression.';
  } else if (contactSite === 'incisal') {
    clinicalNote = 'Incisal Clench (Protrusive Edge-to-Edge): Jaw glides 1.5mm down and 2.4mm forward. Posterior teeth disclude (Christensen phenomenon); periodontal reflex dampens elevators to ~55%.';
  } else {
    clinicalNote = `${contactSite === 'canine_left' ? 'Left' : 'Right'} Canine Guidance (Lateral Rise): Mandible shifts 2.8mm laterally with 1.2mm canine rise. Immediate posterior disclusion protects molars and inhibits elevator hyperactivation.`;
  }

  return {
    biteForceN: parseFloat(biteForceN.toFixed(1)),
    tmjCompressionLeftN: parseFloat(tmjCompressionLeftN.toFixed(1)),
    tmjCompressionRightN: parseFloat(tmjCompressionRightN.toFixed(1)),
    totalElevatorForceN: parseFloat(totalElevatorForceN.toFixed(1)),
    mechanicalAdvantage,
    muscles: activations,
    leverClass: 'Class III Mandibular Lever System',
    clinicalNote
  };
}
