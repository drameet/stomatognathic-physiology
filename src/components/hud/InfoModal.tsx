import React from 'react';
import { X, BookOpen, Activity, Compass, Cpu, CheckCircle2 } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md text-slate-100 select-none">
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-xs text-slate-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-800 mb-4">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-100 font-mono">
            Scientific Playbook & Biomechanical Foundations
          </h2>
        </div>

        {/* Content Sections */}
        <div className="space-y-4 leading-relaxed">
          {/* Section 1 */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <h3 className="font-semibold text-cyan-300 text-sm mb-1.5 flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              1. Theoretical & Ground-Truth Heritage
            </h3>
            <p className="text-slate-400 mb-2">
              This interactive lab models the human masticatory apparatus by coupling high-fidelity 3D spatial
              coordinates with validated mathematical ground truth:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>
                <strong className="text-slate-200">ArtiSynth / SimTK Dynamic Jaw Model</strong> (Ian Stavness, Alan Hannam et al.): Point-to-point lines of action, attachment coordinates, and maximum isometric force values (F_max) derived from Peck et al. 2000 (<em>Arch Oral Biol</em>).
              </li>
              <li>
                <strong className="text-slate-200">BodyParts3D v4.0</strong> (DBCLS Japan, CC BY-SA 2.1): Normalized craniomandibular skeletal framework anchored at the bicondylar hinge axis.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <h3 className="font-semibold text-sky-300 text-sm mb-1.5 flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              2. Posselt's 3D Envelope of Motion
            </h3>
            <p className="text-slate-400 mb-2">
              The translucent 3D wireframe cage positioned at the lower central incisal tip maps out the absolute outer boundaries of mandibular movement:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                <span className="text-cyan-400 font-bold">Phase 1 Opening (0–20mm):</span> Pure terminal hinge bicondylar rotation around the transverse axis.
              </div>
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                <span className="text-cyan-400 font-bold">Phase 2 Opening (20–50mm):</span> Coupled anterior-inferior condylar translation along the articular eminence.
              </div>
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                <span className="text-cyan-400 font-bold">Maximum Protrusion:</span> 8–10mm anterior glide guided by incisal inclination and eminence slope.
              </div>
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                <span className="text-cyan-400 font-bold">Lateral Excursion:</span> Working condyle minor Bennett shift; balancing condyle orbits downward and inward.
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <h3 className="font-semibold text-amber-300 text-sm mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              3. Class III Lever Mechanics & TMJ Reaction Loads
            </h3>
            <p className="text-slate-400 mb-2">
              The human mandible operates as a Class III lever where the fulcrum is the temporomandibular joint (TMJ), the input force is exerted by the elevator muscles (Masseter, Temporalis, Medial Pterygoid), and the load resistance occurs at the occlusal contacts:
            </p>
            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 space-y-1.5 text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Molar Clench (Short Load Arm):</strong> Yields high mechanical advantage (&gt;0.65x), generating maximal bite forces up to 600N while distributing compressive load.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Incisal Clench (Long Load Arm):</strong> Mechanical advantage drops to ~0.35x. Bite force is limited (~200N), causing elevated bilateral TMJ compressive reactions.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Unilateral Occlusal Contact:</strong> The fulcrum shifts eccentrically, resulting in elevated compressive loading on the <em>contralateral balancing condyle</em> (the primary mechanical trigger in non-working side TMD pathologies).</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3 justify-between items-center text-slate-400 text-[11px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-amber-400/90 font-semibold font-mono">© DenMed AI</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-200 font-medium">Professor Ameet Vaman Revankar</span>
            <span className="text-slate-600">·</span>
            <a
              href="mailto:drameetr@gmail.com"
              className="text-slate-400 hover:text-cyan-400 font-mono transition-colors underline decoration-slate-700 hover:decoration-cyan-400"
              title="Email drameetr@gmail.com"
            >
              drameetr@gmail.com
            </a>
            {/* High-visibility LinkedIn Button */}
            <a
              href="https://www.linkedin.com/in/ameet-vaman-phd-314bbb94/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center text-white bg-[#0077b5] hover:bg-[#005e93] border border-[#38a0dc]/60 rounded px-1.5 py-0.5 transition-all shadow-md shadow-[#0077b5]/30 hover:scale-105"
              title="Connect with Ameet Vaman (PhD) on LinkedIn"
              aria-label="LinkedIn Profile"
            >
              <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>

            {/* High-visibility WhatsApp Community Button */}
            <a
              href="https://chat.whatsapp.com/E6HyXAAuu0fERXlLh0TDiV?s=cl&p=i&mlu=4&ilr=4"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center text-white bg-[#25D366] hover:bg-[#20ba59] border border-[#4be382]/60 rounded px-1.5 py-0.5 transition-all shadow-md shadow-[#25D366]/30 hover:scale-105"
              title="Join WhatsApp Group"
              aria-label="Join WhatsApp Group"
            >
              <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.74-.66-1.25-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.71 4.3 3.79.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.3z"/>
              </svg>
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all text-xs shrink-0"
          >
            Close & Continue Lab
          </button>
        </div>
      </div>
    </div>
  );
};
