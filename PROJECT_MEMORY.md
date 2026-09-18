# PROJECT MEMORY: Stomatognathic Biomechanics & TMJ Load Lab ("Within · Stomatognathic Physiology")

**Project Subdirectory:** `d:\partof_BP3D_4.0_obj_99\physiology\`  
**Author:** Professor Ameet Vaman Revankar (drameetr@gmail.com)  
**Entity:** DenMed AI  
**Dev Server:** [http://localhost:5174/](http://localhost:5174/)  
**Tech Stack:** React 18, TypeScript, Three.js, Tailwind CSS, Vite

---

## 1. System Overview & Core Capabilities

An interactive 3D WebGL computational physiology sandbox modeling the human stomatognathic system in real time, coupling real BodyParts3D bones and masticatory muscles with validated biomechanical ground truth.

### Key Features:
1. **Dual-Phase Mandibular Kinematics**:
   - **Phase 1 ($0\text{--}20\text{ mm}$):** Pure terminal hinge bicondylar rotation about the transverse axis ($[0.0, -11.4, -23.5]\text{ mm}$).
   - **Phase 2 ($20\text{--}50\text{ mm}$):** Symmetrical anterior-inferior condylar translation along the $35^\circ$ articular eminence slope.
   - **Posselt 3D Envelope of Motion:** Dynamic wireframe cage tracing the lower incisal path from CR to MIP, edge-to-edge protrusion, lateral Bennett excursions, and maximum opening.
2. **Two-Joint Dynamic Muscle Blend Skinning**:
   - 14 BodyParts3D masticatory muscle meshes (superficial & deep masseters, temporalis, medial & lateral pterygoids, anterior digastrics).
   - Cranial origins remain fixed to skull attachments; mandibular insertions follow jaw excursions; intermediate muscle bellies stretch and contract smoothly.
   - Digastric anterior attachment ($Z \ge 28\text{ mm}$) locked to $w = 1.0$ at the mandibular digastric fossa; hyoid end ($Z \le 8\text{ mm}$) anchored to $w = 0.0$.
3. **Biomechanical Force Solver & Telemetry**:
   - Dynamic moment and force equilibrium ($\sum \vec{M} = 0$, $\sum \vec{F} = 0$).
   - Computes bite force ($N$) and bilateral TMJ compressive reactions ($N$) across central incisors, canines, and first molars.
   - Real-time Class III lever mechanical advantage: incisal clenching ($0.46\times$) vs. molar clenching ($0.68\times$, $245+\text{ N}$).
4. **Interactive Raycast Inspection HUD**:
   - Hovering over any muscle, bone, or tooth reveals an inspection card with its official FMA ID, clinical action, instantaneous contractile tension ($N$), and fiber strain ($\% $).
   - Isolation Focus mode dims surrounding structures to $18\%$ opacity.
5. **Clinical TMJ Camera Presets**:
   - 3/4 Oblique, Right TMJ Sagittal, Left TMJ Sagittal, Frontal Occlusal, and Axial Submental Vertex.

---

## 2. Anatomical Models & Assets

- `public/models/skull_atlas.glb` (4.3 MB): 50 real BodyParts3D bones and individual teeth (FDI 11–47).
- `public/models/masticatory_muscles.glb` (1.61 MB): 14 authentic BodyParts3D masticatory muscles, cleaned of stray noise fragments.
- `public/stomatognathic_refinements_demo.mp4` (2.72 MB): Full HD H.264 video recording of the interactive simulation for LinkedIn/social feeds.

## 3. Key Bug Fixes & Refinements (September 2026)

1. **Async Mount Guarding & Elimination of Ghost Resting Outlines:**
   - Addressed React 18 development StrictMode race condition where concurrent GLTF loader callbacks instantiated duplicate muscle and bone meshes.
   - Introduced `isMounted` token guarding and pre-load group purges (`realMusclesGroupRef.current.clear()`) ensuring strictly 1 instance per muscle (14 units total).
   - Eliminated the static ghost muscle meshes that previously remained frozen at the resting position during mandibular opening.
2. **Exact 3D Euler 'XYZ' Vector Alignment:**
   - Upgraded `muscleVectors.ts` to transform jaw attachment coordinates (`dynamicIns` and `dynamicOrig`) using the exact 3D Euler 'XYZ' rotation matrix around the bicondylar hinge pivot ($[0.0, -11.4, -23.5]\text{ mm}$).
   - Synchronized line-of-action vector endpoints with the deforming 3D BodyParts3D muscle mesh insertions across all kinematic excursions.
3. **Anatomical Incisal Point Calibration:**
   - Re-aligned `REST_INCISAL_POINT` in `tmjKinematics.ts` and `posseltGeometry.ts` to the true BodyParts3D lower central incisal contact ($[0.0, -74.5, 52.0]\text{ mm}$).
   - Configured dynamic disclusion for the occlusal contact marker, automatically hiding the contact sphere during mouth opening ($> 0.5\text{ mm}$).

4. **Mobile & Touch Viewing Optimization (Android & iOS):**
   - Implemented responsive camera FOV ($50^\circ$ on portrait screens vs $40^\circ$ on desktop) and centered perspective coordinates `(0, 15, 340)` ensuring zero anatomical skull clipping on mobile viewports.
   - Configured touch gesture isolation (`touch-action: none`) with dual-touch OrbitControls: single-finger orbit (`TOUCH.ROTATE`) and two-finger pinch/drag (`TOUCH.DOLLY_PAN`).
   - Introduced a dual-mode Real-Time Telemetry HUD: persistent side-by-side aside on desktop ($\ge 1024\text{px}$) and a smooth slide-up bottom-sheet drawer on mobile triggered by an explicit `Telemetry` header button.
   - Designed a collapsible, touch-friendly bottom Control Deck with 1-tap minimize toggle (`ChevronUp`/`ChevronDown`), horizontal swipe chips for Posselt trajectories and mode switches, $\ge 40\text{px}$ touch targets, and `.safe-bottom` iOS home-indicator padding.
   - Maintained 100% desktop fidelity with zero compromise to side-by-side telemetry, floating EMG graphs, and full bottom deck controls.

5. **Functional Occlusal Clench Positioning & Neuromuscular Reflex Coupling:**
   - Transformed the `Bite Clench` sub-buttons (`Incisors`, `L-Canine`, `L-Molar`, `R-Canine`, `R-Molar`) into 1-click **Functional Occlusal Presets**:
     - **Incisors:** Mandible glides into protrusive edge-to-edge guidance ($1.5\text{ mm}$ opening, $2.4\text{ mm}$ protrusion) with posterior molar disclusion (Christensen's phenomenon). Periodontal mechanoreceptor reflex dampens elevator EMG recruitment to $55\%$; bite force = $75.9\text{ N}$ ($0.45\times$ mechanical advantage) with equal bilateral TMJ compression ($44.1\text{ N} / 44.1\text{ N}$).
     - **L-Canine / R-Canine:** Mandible shifts $\pm 2.8\text{ mm}$ laterally with $1.2\text{ mm}$ canine rise, creating immediate complete posterior and contralateral disclusion. The balancing lateral pterygoid fires, and the contralateral balancing condyle absorbs $68\%$ of joint compression ($69.8\text{ N}$ vs $32.9\text{ N}$ on the working condyle).
     - **L-Molar / R-Molar:** Mandible seats fully in Centric Maximum Intercuspation (MIP, $0.0\text{ mm}$ displacement). Unilateral molar fulcrum yields maximum bite force ($196.3\text{ N}$, $0.68\times$ mechanical advantage) with the contralateral condyle taking $68\%$ of the fulcrum load ($63.4\text{ N}$).
   - Contact marker sphere is maintained active at the biting tooth fulcrum across all functional postures.

6. **Patient Anatomical Left/Right Calibration (Medical/Gnathological Convention):**
   - Corrected coordinate mappings across the entire application from observer's screen perspective to **Patient's Anatomical Perspective**:
     - **Patient's Left ($+X$):** Shifting to the patient's anatomical left (screen right) corresponds to `lateralMm > 0`, activates the Left Canine contact ($X = +12.2\text{ mm}$ on tooth 33), recruits the contralateral Right balancing lateral pterygoid, and is labeled as `L` in the manual slider.
     - **Patient's Right ($-X$):** Shifting to the patient's anatomical right (screen left) corresponds to `lateralMm < 0`, activates the Right Canine contact ($X = -12.5\text{ mm}$ on tooth 43), recruits the contralateral Left balancing lateral pterygoid, and is labeled as `R` in the manual slider.
     - **Posselt Envelope Trajectories:** "Left Lateral" drives `lateralMm = +8.5` into the patient's left border pole (`pLL`); "Right Lateral" drives `lateralMm = -8.5` into the patient's right border pole (`pRL`).
     - **TMJ Camera Presets:** `R-TMJ` positions camera at $-X = -190$ to focus directly on the Patient's Right Condyle; `L-TMJ` positions camera at $+X = +190$ to focus on the Patient's Left Condyle.

7. **Documentation & Scientific Playbook Sanitization:**
   - Removed all external Plethscape references from `InfoModal.tsx`, `Viewport.tsx`, and project documentation, keeping theoretical ground-truth attributions focused strictly on **ArtiSynth / SimTK Dynamic Jaw Model** (Ian Stavness, Alan Hannam et al.) and **BodyParts3D v4.0** (DBCLS Japan).

8. **Author Attribution, LinkedIn & WhatsApp Group Community Integration:**
   - **High-Visibility LinkedIn Badge:** Rendered in solid official LinkedIn Blue (`#0077b5`) with white SVG icon, border highlight, and hover scale for crisp contrast against the dark background, linking to `https://www.linkedin.com/in/ameet-vaman-phd-314bbb94/`.
   - **WhatsApp Group Badge:** Rendered in solid official WhatsApp Green (`#25D366`) with white SVG icon, border highlight, and hover scale, directly linking to Professor Revankar's community group (`https://chat.whatsapp.com/E6HyXAAuu0fERXlLh0TDiV?s=cl&p=i&mlu=4&ilr=4`).
   - Integrated on both desktop and mobile headers (`Header.tsx`) as well as inside the **Scientific Playbook** modal footer (`InfoModal.tsx`).

9. **Multi-Device Cross-Platform & Touch Compatibility Audit (Desktop, iOS, Android):**
   - **Desktop (1440x900):** Validated persistent two-column spatial layout (interactive 3D canvas on left + live 320px telemetry HUD card on right), full expanded header with author email, solid LinkedIn and WhatsApp badges, bottom Control Deck with kinematic sliders, mode chips, and camera presets.
   - **Mobile iOS (390x844 - iPhone 12/13/14/15 Pro):** Validated single-finger orbit (`TOUCH.ROTATE`) and two-finger pinch-zoom (`TOUCH.DOLLY_PAN`) with `touch-action: none`. Verified slide-up telemetry drawer (`max-h-[82vh]` backdrop blur sheet) triggered by the header button, Control Deck minimize toggle to reclaim full viewport real estate, and safe-bottom iOS home-indicator padding.
   - **Mobile Android (412x915 - Pixel / Samsung Galaxy):** Verified horizontal swipeability of Posselt and Bite Clench chips with zero viewport clipping, smooth modal scrolling, and touch target accessibility ($\ge 44\text{px}$).

10. **LinkedIn Showcase MP4 Video Production (7.5s with Ambient Instrumental Track):**
   - Converted browser recording to a high-density 7.53-second MP4 video (`stomatognathic_physiology_demo.mp4`, 1.69 MB) optimized for LinkedIn feed engagement algorithms (3x speedup, 30 fps, 1904x810 resolution, H.264 High profile, yuv420p).
   - Showcases craniomandibular 3D mechanics, Posselt 3D envelope excursions (Left & Right Lateral), canine guidance clench with periodontal reflex disclusion, and real-time TMJ load distribution.
   - Synthesized and mixed an ambient instrumental backing track (Ab maj9 - Bb add9 - Cm7 - Eb maj9 progression, warm analog pad, plucked acoustic overtones, subtle stereo panning, and soft fade-in/fade-out) encoded at 192 kbps AAC stereo.
   - Saved to `physiology/public/stomatognathic_physiology_demo.mp4` and copied to artifacts for download and sharing.

---

*For Professor Revankar's Clinical Validation.*
