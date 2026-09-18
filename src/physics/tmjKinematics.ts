export interface MandibularState {
  openingMm: number;           // 0 to 50 mm
  protrusionMm: number;        // 0 to 10 mm
  lateralMm: number;           // -10 mm (Left) to +10 mm (Right)
  condylarGuidanceDeg: number; // 25° to 55° (default: 35°)
  bennettAngleDeg: number;     // 5° to 25° (default: 15°)
}

export interface MandibularKinematics {
  // Global translation of mandible origin in mm [x, y, z]
  translation: [number, number, number];
  // Euler angles [pitch, yaw, roll] in radians
  rotation: [number, number, number];
  // Instantaneous lower incisal point coordinate in mm
  incisalPoint: [number, number, number];
  // Instantaneous condylar positions in mm
  condyleLeft: [number, number, number];
  condyleRight: [number, number, number];
  // Condylar translation displacements in mm
  condyleDispLeft: { dx: number; dy: number; dz: number; total: number };
  condyleDispRight: { dx: number; dy: number; dz: number; total: number };
}

export const REST_INCISAL_POINT: [number, number, number] = [0.0, -74.5, 52.0];
export const REST_CONDYLE_LEFT: [number, number, number] = [44.0, -11.4, -23.5];
export const REST_CONDYLE_RIGHT: [number, number, number] = [-44.0, -11.4, -23.5];
export const BICONDYLAR_PIVOT: [number, number, number] = [0.0, -11.4, -23.5];

export function computeMandibularKinematics(state: MandibularState): MandibularKinematics {
  const { openingMm, protrusionMm, lateralMm, condylarGuidanceDeg, bennettAngleDeg } = state;
  const condylarAngleRad = (condylarGuidanceDeg * Math.PI) / 180;
  const bennettAngleRad = (bennettAngleDeg * Math.PI) / 180;

  // Phase 1: Pure bicondylar terminal hinge rotation (first 20mm incisal separation)
  const hingeLimitMm = 20.0;
  const hingeRatio = Math.min(openingMm, hingeLimitMm) / hingeLimitMm;
  // POSITIVE pitch rotates chin downward (-Y) and backward (-Z) along the terminal hinge arc
  const hingePitchRad = hingeRatio * (12.5 * Math.PI / 180); // ~12.5° max pure rotation

  // Phase 2: Coupled condylar anterior-inferior translation (beyond 20mm up to 50mm)
  const transRatio = Math.max(0, openingMm - hingeLimitMm) / (50.0 - hingeLimitMm);
  // Additional rotational opening depression during translation
  const secondaryPitchRad = transRatio * (16.0 * Math.PI / 180);

  // Symmetrical translation distance along the articular eminence (mm)
  const openingTransDistance = transRatio * 14.0; // up to 14mm slide
  const totalSymmetricTrans = openingTransDistance + protrusionMm;

  // Translation vector along eminence (anterior +Z, inferior -Y in standard maxillofacial frame)
  const baseTransY = -Math.sin(condylarAngleRad) * totalSymmetricTrans;
  const baseTransZ = Math.cos(condylarAngleRad) * totalSymmetricTrans;

  // Asymmetric lateral excursions (Bennett movement)
  // Working condyle: minor lateral shift & rotation
  // Balancing condyle: orbits anteriorly, inferiorly, and medially (Bennett angle)
  const lateralShiftX = lateralMm * 0.45;
  const yawRad = (lateralMm / 10.0) * (4.5 * Math.PI / 180);
  const rollRad = (lateralMm / 10.0) * (1.8 * Math.PI / 180);

  // Balancing condyle additional excursion
  const balancingExtraSlide = Math.abs(lateralMm) * 0.8;
  const balancingY = -Math.sin(condylarAngleRad) * balancingExtraSlide;
  const balancingZ = Math.cos(condylarAngleRad) * balancingExtraSlide;
  const balancingMedialX = -Math.sin(bennettAngleRad) * balancingExtraSlide * (lateralMm > 0 ? 1 : -1);

  const leftCondyleY = baseTransY + (lateralMm > 0 ? 0 : balancingY);
  const leftCondyleZ = baseTransZ + (lateralMm > 0 ? 0 : balancingZ);
  const leftCondyleX = lateralMm > 0 ? lateralShiftX : balancingMedialX;

  const rightCondyleY = baseTransY + (lateralMm < 0 ? 0 : balancingY);
  const rightCondyleZ = baseTransZ + (lateralMm < 0 ? 0 : balancingZ);
  const rightCondyleX = lateralMm < 0 ? lateralShiftX : balancingMedialX;

  const pitchRad = hingePitchRad + secondaryPitchRad;

  // Rigid transformation of lower central incisor tip
  // Incisal tip relative to condylar hinge axis (origin at condylar midpoint BICONDYLAR_PIVOT)
  const rx0 = REST_INCISAL_POINT[0] - BICONDYLAR_PIVOT[0];
  const ry0 = REST_INCISAL_POINT[1] - BICONDYLAR_PIVOT[1];
  const rz0 = REST_INCISAL_POINT[2] - BICONDYLAR_PIVOT[2];

  // Rotate by pitch around X
  const cosP = Math.cos(pitchRad);
  const sinP = Math.sin(pitchRad);
  const ryP = ry0 * cosP - rz0 * sinP;
  const rzP = ry0 * sinP + rz0 * cosP;

  // Rotate by yaw around Y
  const cosY = Math.cos(yawRad);
  const sinY = Math.sin(yawRad);
  const rxY = rx0 * cosY + rzP * sinY;
  const rzY = -rx0 * sinY + rzP * cosY;

  const incisalX = rxY + BICONDYLAR_PIVOT[0] + lateralShiftX;
  const incisalY = ryP + BICONDYLAR_PIVOT[1] + baseTransY;
  const incisalZ = rzY + BICONDYLAR_PIVOT[2] + baseTransZ;

  const leftCondylePos: [number, number, number] = [
    REST_CONDYLE_LEFT[0] + leftCondyleX,
    REST_CONDYLE_LEFT[1] + leftCondyleY,
    REST_CONDYLE_LEFT[2] + leftCondyleZ
  ];

  const rightCondylePos: [number, number, number] = [
    REST_CONDYLE_RIGHT[0] + rightCondyleX,
    REST_CONDYLE_RIGHT[1] + rightCondyleY,
    REST_CONDYLE_RIGHT[2] + rightCondyleZ
  ];

  return {
    translation: [lateralShiftX, baseTransY, baseTransZ],
    rotation: [pitchRad, yawRad, rollRad],
    incisalPoint: [incisalX, incisalY, incisalZ],
    condyleLeft: leftCondylePos,
    condyleRight: rightCondylePos,
    condyleDispLeft: {
      dx: leftCondyleX,
      dy: leftCondyleY,
      dz: leftCondyleZ,
      total: Math.sqrt(leftCondyleX ** 2 + leftCondyleY ** 2 + leftCondyleZ ** 2)
    },
    condyleDispRight: {
      dx: rightCondyleX,
      dy: rightCondyleY,
      dz: rightCondyleZ,
      total: Math.sqrt(rightCondyleX ** 2 + rightCondyleY ** 2 + rightCondyleZ ** 2)
    }
  };
}
