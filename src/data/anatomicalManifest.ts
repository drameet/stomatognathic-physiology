export interface AnatomyMetadata {
  id: string;
  name: string;
  fma: string;
  category: 'muscle' | 'bone' | 'tooth' | 'joint';
  side?: 'left' | 'right' | 'bilateral' | 'midline';
  action?: string;
  origin?: string;
  insertion?: string;
  groundTruthId?: string; // Links to jawGroundTruth.json muscle ID
}

export const ANATOMICAL_MANIFEST: Record<string, AnatomyMetadata> = {
  // --- Masticatory Muscles ---
  'superficial_masseter_r': {
    id: 'superficial_masseter_r',
    name: 'Right Superficial Masseter',
    fma: 'FMA 49001',
    category: 'muscle',
    side: 'right',
    action: 'Powerful mandibular elevation (jaw closing & incisal/molar crushing) with slight protrusion.',
    origin: 'Anterior two-thirds of the inferior border of the zygomatic arch and maxillary process.',
    insertion: 'Angle of the mandible and inferior lateral surface of the mandibular ramus.',
    groundTruthId: 'r_sm'
  },
  'superficial_masseter_l': {
    id: 'superficial_masseter_l',
    name: 'Left Superficial Masseter',
    fma: 'FMA 49002',
    category: 'muscle',
    side: 'left',
    action: 'Powerful mandibular elevation (jaw closing & incisal/molar crushing) with slight protrusion.',
    origin: 'Anterior two-thirds of the inferior border of the zygomatic arch and maxillary process.',
    insertion: 'Angle of the mandible and inferior lateral surface of the mandibular ramus.',
    groundTruthId: 'l_sm'
  },
  'deep_masseter_r': {
    id: 'deep_masseter_r',
    name: 'Right Deep Masseter',
    fma: 'FMA 49004',
    category: 'muscle',
    side: 'right',
    action: 'Mandibular elevation, retrusion, and vertical stabilization of the condylar head in the glenoid fossa.',
    origin: 'Posterior one-third of the inferior border and entire medial surface of the zygomatic arch.',
    insertion: 'Upper lateral surface of the mandibular ramus up to the coronoid process.',
    groundTruthId: 'r_dm'
  },
  'deep_masseter_l': {
    id: 'deep_masseter_l',
    name: 'Left Deep Masseter',
    fma: 'FMA 49005',
    category: 'muscle',
    side: 'left',
    action: 'Mandibular elevation, retrusion, and vertical stabilization of the condylar head in the glenoid fossa.',
    origin: 'Posterior one-third of the inferior border and entire medial surface of the zygomatic arch.',
    insertion: 'Upper lateral surface of the mandibular ramus up to the coronoid process.',
    groundTruthId: 'l_dm'
  },
  'temporalis_r': {
    id: 'temporalis_r',
    name: 'Right Temporalis',
    fma: 'FMA 49007',
    category: 'muscle',
    side: 'right',
    action: 'Rapid mandibular elevation (anterior vertical fibers) and powerful retrusion/positioning (posterior horizontal fibers).',
    origin: 'Temporal fossa of cranium and deep layer of temporal fascia.',
    insertion: 'Apex and medial surface of the coronoid process and anterior border of the mandibular ramus.',
    groundTruthId: 'r_at'
  },
  'temporalis_l': {
    id: 'temporalis_l',
    name: 'Left Temporalis',
    fma: 'FMA 49008',
    category: 'muscle',
    side: 'left',
    action: 'Rapid mandibular elevation (anterior vertical fibers) and powerful retrusion/positioning (posterior horizontal fibers).',
    origin: 'Temporal fossa of cranium and deep layer of temporal fascia.',
    insertion: 'Apex and medial surface of the coronoid process and anterior border of the mandibular ramus.',
    groundTruthId: 'l_at'
  },
  'medial_pterygoid_r': {
    id: 'medial_pterygoid_r',
    name: 'Right Medial Pterygoid',
    fma: 'FMA 49012',
    category: 'muscle',
    side: 'right',
    action: 'Mandibular elevation and mediolateral grinding excursion. Forms the pterygomasseteric sling with the masseter.',
    origin: 'Medial surface of the lateral pterygoid plate, pyramidal process of palatine bone, and maxillary tuberosity.',
    insertion: 'Medial pterygoid tuberosities on the medial/inner surface of the mandibular angle.',
    groundTruthId: 'r_mp'
  },
  'medial_pterygoid_l': {
    id: 'medial_pterygoid_l',
    name: 'Left Medial Pterygoid',
    fma: 'FMA 49013',
    category: 'muscle',
    side: 'left',
    action: 'Mandibular elevation and mediolateral grinding excursion. Forms the pterygomasseteric sling with the masseter.',
    origin: 'Medial surface of the lateral pterygoid plate, pyramidal process of palatine bone, and maxillary tuberosity.',
    insertion: 'Medial pterygoid tuberosities on the medial/inner surface of the mandibular angle.',
    groundTruthId: 'l_mp'
  },
  'upper_lateral_pterygoid_r': {
    id: 'upper_lateral_pterygoid_r',
    name: 'Right Upper Lateral Pterygoid',
    fma: 'FMA 49024',
    category: 'muscle',
    side: 'right',
    action: 'Active during jaw closing, clenching, and power stroke to stabilize the articular disc against the articular eminence.',
    origin: 'Infratemporal surface and infratemporal crest of the greater wing of the sphenoid bone.',
    insertion: 'Anteromedial aspect of the TMJ capsule, articular disc, and upper condylar neck.',
    groundTruthId: 'r_slp'
  },
  'upper_lateral_pterygoid_l': {
    id: 'upper_lateral_pterygoid_l',
    name: 'Left Upper Lateral Pterygoid',
    fma: 'FMA 49025',
    category: 'muscle',
    side: 'left',
    action: 'Active during jaw closing, clenching, and power stroke to stabilize the articular disc against the articular eminence.',
    origin: 'Infratemporal surface and infratemporal crest of the greater wing of the sphenoid bone.',
    insertion: 'Anteromedial aspect of the TMJ capsule, articular disc, and upper condylar neck.',
    groundTruthId: 'l_slp'
  },
  'lower_lateral_pterygoid_r': {
    id: 'lower_lateral_pterygoid_r',
    name: 'Right Lower Lateral Pterygoid',
    fma: 'FMA 49022',
    category: 'muscle',
    side: 'right',
    action: 'Primary driver of condylar anterior translation during Phase 2 opening and protrusion. Contralateral lateral excursion when firing unilaterally.',
    origin: 'Lateral surface of the lateral pterygoid plate of the sphenoid bone.',
    insertion: 'Pterygoid fovea on the anterior neck of the condyloid process of the mandible.',
    groundTruthId: 'r_ilp'
  },
  'lower_lateral_pterygoid_l': {
    id: 'lower_lateral_pterygoid_l',
    name: 'Left Lower Lateral Pterygoid',
    fma: 'FMA 49023',
    category: 'muscle',
    side: 'left',
    action: 'Primary driver of condylar anterior translation during Phase 2 opening and protrusion. Contralateral lateral excursion when firing unilaterally.',
    origin: 'Lateral surface of the lateral pterygoid plate of the sphenoid bone.',
    insertion: 'Pterygoid fovea on the anterior neck of the condyloid process of the mandible.',
    groundTruthId: 'l_ilp'
  },
  'anterior_digastric_r': {
    id: 'anterior_digastric_r',
    name: 'Right Anterior Digastric',
    fma: 'FMA 46304',
    category: 'muscle',
    side: 'right',
    action: 'Depresses the mandible to assist jaw opening and retrudes the chin when hyoid bone is fixed by infrahyoid muscles.',
    origin: 'Digastric fossa on the inner inferior border of the mandibular symphysis near the midline.',
    insertion: 'Intermediate tendon anchored by a fascial sling to the greater cornu and body of the hyoid bone.',
    groundTruthId: 'r_ad'
  },
  'anterior_digastric_l': {
    id: 'anterior_digastric_l',
    name: 'Left Anterior Digastric',
    fma: 'FMA 46305',
    category: 'muscle',
    side: 'left',
    action: 'Depresses the mandible to assist jaw opening and retrudes the chin when hyoid bone is fixed by infrahyoid muscles.',
    origin: 'Digastric fossa on the inner inferior border of the mandibular symphysis near the midline.',
    insertion: 'Intermediate tendon anchored by a fascial sling to the greater cornu and body of the hyoid bone.',
    groundTruthId: 'l_ad'
  },

  // --- Craniofacial Bones ---
  'mandible': {
    id: 'mandible',
    name: 'Mandible (Lower Jaw)',
    fma: 'FMA 52748',
    category: 'bone',
    side: 'midline',
    action: 'The only mobile bone of the skull. Carries the lower dental arch and articulates bilaterally at the TMJ to enable mastication and speech.'
  },
  'maxilla': {
    id: 'maxilla',
    name: 'Maxillae (Upper Jaw)',
    fma: 'FMA 52749',
    category: 'bone',
    side: 'bilateral',
    action: 'Forms the upper dental arch, palate, floor of the nasal cavity and orbits. Serves as the fixed occlusal foundation.'
  },
  'temporal_r': {
    id: 'temporal_r',
    name: 'Right Temporal Bone',
    fma: 'FMA 52737',
    category: 'bone',
    side: 'right',
    action: 'Houses the mandibular glenoid fossa, articular eminence, and postglenoid tubercle forming the cranial component of the right TMJ.'
  },
  'temporal_l': {
    id: 'temporal_l',
    name: 'Left Temporal Bone',
    fma: 'FMA 52737',
    category: 'bone',
    side: 'left',
    action: 'Houses the mandibular glenoid fossa, articular eminence, and postglenoid tubercle forming the cranial component of the left TMJ.'
  },
  'sphenoid': {
    id: 'sphenoid',
    name: 'Sphenoid Bone',
    fma: 'FMA 52735',
    category: 'bone',
    side: 'midline',
    action: 'Keystone craniofacial bone providing origins for both heads of the lateral pterygoid and medial pterygoid muscles.'
  }
};

export function lookupAnatomy(meshName: string): AnatomyMetadata | null {
  const cleanName = meshName.toLowerCase().trim();
  if (ANATOMICAL_MANIFEST[cleanName]) {
    return ANATOMICAL_MANIFEST[cleanName];
  }

  // Handle teeth
  if (cleanName.startsWith('tooth_')) {
    const fdi = cleanName.replace('tooth_', '');
    const isUpper = fdi.startsWith('1') || fdi.startsWith('2');
    const isRight = fdi.startsWith('1') || fdi.startsWith('4');
    return {
      id: cleanName,
      name: `Permanent Tooth ${fdi} (${isUpper ? 'Maxillary' : 'Mandibular'} ${isRight ? 'Right' : 'Left'})`,
      fma: `FMA ${55680 + parseInt(fdi) || 55700}`,
      category: 'tooth',
      side: isRight ? 'right' : 'left',
      action: isUpper ? 'Fixed occlusal crushing/shearing surface.' : 'Articulating mandibular contact unit.'
    };
  }

  return null;
}
