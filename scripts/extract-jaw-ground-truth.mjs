import fs from 'fs';
import path from 'path';

const GEOMETRY_DIR = path.resolve('./ground_truth/artisynth/src/artisynth/models/dynjaw/geometry');
const OUTPUT_FILE = path.resolve('./src/data/jawGroundTruth.json');

const CM_TO_MM = 10.0;

const MUSCLE_DEFS = [
  { code: 'sm', name: 'Superficial Masseter', group: 'Masseter', fmax: 190.4, originBody: 'maxilla', insertionBody: 'jaw' },
  { code: 'dm', name: 'Deep Masseter', group: 'Masseter', fmax: 81.6, originBody: 'maxilla', insertionBody: 'jaw' },
  { code: 'at', name: 'Anterior Temporalis', group: 'Temporalis', fmax: 158.0, originBody: 'cranium', insertionBody: 'jaw' },
  { code: 'mt', name: 'Middle Temporalis', group: 'Temporalis', fmax: 95.6, originBody: 'cranium', insertionBody: 'jaw' },
  { code: 'pt', name: 'Posterior Temporalis', group: 'Temporalis', fmax: 75.6, originBody: 'cranium', insertionBody: 'jaw' },
  { code: 'mp', name: 'Medial Pterygoid', group: 'Medial Pterygoid', fmax: 174.8, originBody: 'maxilla', insertionBody: 'jaw' },
  { code: 'ip', name: 'Inferior Lateral Pterygoid', group: 'Lateral Pterygoid', fmax: 66.9, originBody: 'maxilla', insertionBody: 'jaw' },
  { code: 'sp', name: 'Superior Lateral Pterygoid', group: 'Lateral Pterygoid', fmax: 28.67, originBody: 'maxilla', insertionBody: 'jaw' },
  { code: 'ad', name: 'Anterior Digastric', group: 'Digastric', fmax: 40.0, originBody: 'jaw', insertionBody: 'hyoid' },
];

function parseLandmarkFile(filepath) {
  if (!fs.existsSync(filepath)) {
    console.warn(`File not found: ${filepath}`);
    return null;
  }
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split(/\r?\n/);
  const dataIdx = lines.findIndex(l => l.trim() === '@1');
  if (dataIdx === -1) return null;

  const points = [];
  for (let i = dataIdx + 1; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/).map(Number);
    if (parts.length >= 3 && !parts.some(isNaN)) {
      points.push([
        parseFloat((parts[0] * CM_TO_MM).toFixed(3)),
        parseFloat((parts[1] * CM_TO_MM).toFixed(3)),
        parseFloat((parts[2] * CM_TO_MM).toFixed(3))
      ]);
    }
    if (points.length >= 2) break;
  }
  return points;
}

const extractedMuscles = [];

for (const m of MUSCLE_DEFS) {
  const lmFile = path.join(GEOMETRY_DIR, `l${m.code}.landmarkAscii`);
  const pts = parseLandmarkFile(lmFile);
  if (pts && pts.length >= 2) {
    const [lOrigin, lInsertion] = pts;
    
    // Left side (ArtiSynth native is left, X > 0 in ArtiSynth frame)
    extractedMuscles.push({
      id: `l_${m.code}`,
      name: `Left ${m.name}`,
      group: m.group,
      side: 'left',
      fmax: m.fmax,
      originBody: m.originBody,
      insertionBody: m.insertionBody,
      origin: lOrigin,
      insertion: lInsertion
    });

    // Right side (symmetrical reflection across sagittal X=0)
    const rOrigin = [-lOrigin[0], lOrigin[1], lOrigin[2]];
    const rInsertion = [-lInsertion[0], lInsertion[1], lInsertion[2]];
    extractedMuscles.push({
      id: `r_${m.code}`,
      name: `Right ${m.name}`,
      group: m.group,
      side: 'right',
      fmax: m.fmax,
      originBody: m.originBody,
      insertionBody: m.insertionBody,
      origin: rOrigin,
      insertion: rInsertion
    });
  } else {
    console.warn(`Could not parse points for ${m.name}`);
  }
}

const groundTruthData = {
  metadata: {
    source: 'ArtiSynth / SimTK Hannam & Stavness Jaw Model',
    paper: 'Peck et al. 2000 Arch Oral Biol, Hannam et al. 2008 J Biomech',
    units: {
      distance: 'millimeters (mm)',
      force: 'Newtons (N)',
      angles: 'degrees'
    }
  },
  kinematicDefaults: {
    condylarGuidanceAngleDeg: 35.0,
    bennettAngleDeg: 15.0,
    terminalHingeLimitMm: 20.0,
    maxIncisalOpeningMm: 50.0,
    maxProtrusionMm: 10.0,
    maxLateralExcursionMm: 10.0,
    bicondylarWidthMm: 110.0,
    condyleCenterOffset: [0.0, 15.0, -25.0]
  },
  referenceLandmarks: {
    incisalPoint: [0.0, -32.0, 48.0],
    leftMolarPoint: [24.8, -20.4, 15.0],
    rightMolarPoint: [-24.8, -20.4, 15.0],
    leftCaninePoint: [14.0, -26.0, 38.0],
    rightCaninePoint: [-14.0, -26.0, 38.0],
    leftCondylePole: [55.0, 15.0, -25.0],
    rightCondylePole: [-55.0, 15.0, -25.0]
  },
  muscles: extractedMuscles
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(groundTruthData, null, 2), 'utf8');
console.log(`Successfully extracted ${extractedMuscles.length} muscle heads to ${OUTPUT_FILE}`);
