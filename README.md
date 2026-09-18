# Within · Stomatognathic Physiology (Masticatory Biomechanics & Posselt 3D Lab)

**Author:** Professor Ameet Vaman Revankar (`drameetr@gmail.com`)  
**Entity:** DenMed AI  
**Directory:** `d:\partof_BP3D_4.0_obj_99\physiology\`  
**Local Development:** [http://localhost:5174/](http://localhost:5174/)  

---

## 1. Project Overview

This project is an interactive 3D WebGL computational physiology and biomechanics lab modeling the human stomatognathic system. 

It couples craniomandibular skeletal geometry with validated biomechanical ground truth from **Hannam & Stavness (ArtiSynth / SimTK OpenSim Jaw Model)**.

---

## 2. Core Interactive Features

1. **Mandibular Kinematics Engine:**
   - Phase 1 (0–20 mm): Pure bicondylar terminal hinge rotation around the transverse axis.
   - Phase 2 (20–50 mm): Coupled anterior-inferior condylar translation along the articular eminence ($\alpha = 35^\circ$, $\beta = 15^\circ$).
   - Excursions: Working side Bennett shift and balancing side orbiting path.
2. **Posselt's 3D Envelope of Motion:**
   - 3D wireframe boundary volume at the lower central incisal point with real-time cursor tracking.
3. **Dynamic Muscle Lines of Action:**
   - 8 bilateral muscle pairs (Masseters, Temporalis, Medial Pterygoids, Lateral Pterygoids, Digastrics) that stretch, contract, and dynamically shift color from cyan (relaxed) to crimson (clench).
4. **Static Equilibrium & Joint Loads:**
   - Solves $\sum \vec{M} = 0$ and $\sum \vec{F} = 0$ to calculate occlusal bite force (N) and bilateral TMJ compressive loads (N).
5. **Interactive Modes:**
   - *Manual Sliders*: Opening (0–50mm), Protrusion (0–10mm), Lateral (-10 to +10mm), Guidance angle $\alpha$ (25°–55°), Bennett $\beta$ (5°–25°).
   - *Posselt 3D Envelope*: Quick-jump border trajectories (CR, MIP, Terminal Hinge, Max Opening, Protrusion, Lateral).
   - *Chewing Cycle*: Automated 1.2s tear-drop masticatory stroke.
   - *Bite Clench Sim*: Contact site selection (Incisors, Canines, Molars) and clench intensity (0–100%).

---

## 3. Development Commands

Run locally inside `physiology/`:
```bash
# Start Vite development server on port 5174
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```

---

*For Professor Revankar's Clinical Validation.*
