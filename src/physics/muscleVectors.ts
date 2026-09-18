import groundTruth from '../data/jawGroundTruth.json';
import { MandibularKinematics } from './tmjKinematics';

export interface DynamicMuscleLine {
  id: string;
  name: string;
  group: string;
  side: 'left' | 'right';
  origin: [number, number, number];      // Fixed to cranium/maxilla
  insertion: [number, number, number];   // Dynamic, moving with mandible
  restingLengthMm: number;
  currentLengthMm: number;
  strain: number;                        // (L - L0) / L0
  forceN: number;
  activation: number;                    // 0.0 to 1.0
  colorHex: string;
}

export function computeDynamicMuscleLines(
  kinematics: MandibularKinematics,
  muscleActivations: Record<string, number> = {}
): DynamicMuscleLine[] {
  const { translation, rotation } = kinematics;
  const [pitch, yaw, roll] = rotation;
  const [tx, ty, tz] = translation;

  // Condylar hinge pivot offset matching BodyParts3D mandible hinge axis
  const pivotX = 0.0;
  const pivotY = -11.4;
  const pivotZ = -23.5;

  // Exact Three.js Euler 'XYZ' rotation matrix matching mandibular bone
  const c1 = Math.cos(pitch), s1 = Math.sin(pitch);
  const c2 = Math.cos(yaw), s2 = Math.sin(yaw);
  const c3 = Math.cos(roll), s3 = Math.sin(roll);

  const r00 = c2 * c3;
  const r01 = -c2 * s3;
  const r02 = s2;
  const r10 = c1 * s3 + c3 * s1 * s2;
  const r11 = c1 * c3 - s1 * s2 * s3;
  const r12 = -c2 * s1;
  const r20 = s1 * s3 - c1 * c3 * s2;
  const r21 = c3 * s1 + c1 * s2 * s3;
  const r22 = c1 * c2;

  const transformPointOnJaw = (pt: [number, number, number]): [number, number, number] => {
    const dx = pt[0] - pivotX;
    const dy = pt[1] - pivotY;
    const dz = pt[2] - pivotZ;

    const rx = r00 * dx + r01 * dy + r02 * dz;
    const ry = r10 * dx + r11 * dy + r12 * dz;
    const rz = r20 * dx + r21 * dy + r22 * dz;

    return [
      rx + pivotX + tx,
      ry + pivotY + ty,
      rz + pivotZ + tz
    ];
  };

  return groundTruth.muscles.map((m) => {
    const dynamicOrig: [number, number, number] = m.originBody === 'jaw'
      ? transformPointOnJaw(m.origin as [number, number, number])
      : [m.origin[0], m.origin[1], m.origin[2]];

    const dynamicIns: [number, number, number] = m.insertionBody === 'jaw'
      ? transformPointOnJaw(m.insertion as [number, number, number])
      : [m.insertion[0], m.insertion[1], m.insertion[2]];

    const dx0 = m.insertion[0] - m.origin[0];
    const dy0 = m.insertion[1] - m.origin[1];
    const dz0 = m.insertion[2] - m.origin[2];
    const L0 = Math.sqrt(dx0 * dx0 + dy0 * dy0 + dz0 * dz0);

    const dx = dynamicIns[0] - dynamicOrig[0];
    const dy = dynamicIns[1] - dynamicOrig[1];
    const dz = dynamicIns[2] - dynamicOrig[2];
    const L = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const strain = (L - L0) / Math.max(1, L0);
    const act = muscleActivations[m.id] ?? 0.05;
    const force = act * m.fmax;

    // Color gradient based on activation:
    // 0.0: Cyan (#06b6d4)
    // 0.5: Amber (#f59e0b)
    // 1.0: Crimson (#ef4444)
    let colorHex = '#06b6d4';
    if (act > 0.6) {
      colorHex = '#ef4444';
    } else if (act > 0.25) {
      colorHex = '#f59e0b';
    } else if (act > 0.1) {
      colorHex = '#38bdf8';
    }

    return {
      id: m.id,
      name: m.name,
      group: m.group,
      side: m.side as 'left' | 'right',
      origin: dynamicOrig,
      insertion: dynamicIns,
      restingLengthMm: parseFloat(L0.toFixed(2)),
      currentLengthMm: parseFloat(L.toFixed(2)),
      strain: parseFloat(strain.toFixed(3)),
      forceN: parseFloat(force.toFixed(1)),
      activation: act,
      colorHex
    };
  });
}
