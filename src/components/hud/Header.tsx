import React from 'react';
import { Skull, Info, Activity } from 'lucide-react';

interface HeaderProps {
  onOpenInfo: () => void;
  onToggleTelemetry?: () => void;
  isTelemetryOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInfo, onToggleTelemetry, isTelemetryOpen }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 text-slate-100 select-none safe-top">
      {/* Title & Branding */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center shadow-lg shadow-cyan-950/50 shrink-0">
          <Skull className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <h1 className="font-bold text-xs sm:text-sm tracking-wide uppercase text-slate-100 font-mono truncate">
              Within · Stomatognathic <span className="hidden sm:inline">Physiology</span>
            </h1>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-400 border border-cyan-800 font-mono shrink-0">
              Hannam & Stavness
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 truncate hidden md:block">
            Interactive Masticatory Biomechanics, Posselt 3D Envelope & TMJ Joint Load Lab
          </p>
        </div>
      </div>

      {/* Actions & Mobile Telemetry Toggle */}
      <div className="flex items-center space-x-2 text-xs shrink-0">
        {/* Author Attribution with Email, LinkedIn & WhatsApp */}
        <div className="hidden lg:flex items-center space-x-2 text-slate-300 text-[11px] border-r border-slate-800 pr-3 select-auto">
          <span className="text-amber-400 font-semibold font-mono text-[10.5px]">© DenMed AI</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-200 font-medium">Ameet Vaman Revankar</span>
          <span className="text-slate-600">·</span>
          <a
            href="mailto:drameetr@gmail.com"
            className="text-slate-300 hover:text-cyan-400 font-mono text-[10.5px] transition-colors underline decoration-slate-700 hover:decoration-cyan-400"
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

        {/* Mobile Author Links */}
        <div className="flex lg:hidden items-center space-x-1.5 border-r border-slate-800 pr-2">
          <a
            href="mailto:drameetr@gmail.com"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Email drameetr@gmail.com"
            aria-label="Email Author"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/ameet-vaman-phd-314bbb94/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center text-white bg-[#0077b5] hover:bg-[#005e93] border border-[#38a0dc]/60 rounded p-1.5 transition-colors shadow-sm"
            title="Connect with Ameet Vaman (PhD) on LinkedIn"
            aria-label="LinkedIn Profile"
          >
            <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
          </a>
          <a
            href="https://chat.whatsapp.com/E6HyXAAuu0fERXlLh0TDiV?s=cl&p=i&mlu=4&ilr=4"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center text-white bg-[#25D366] hover:bg-[#20ba59] border border-[#4be382]/60 rounded p-1.5 transition-colors shadow-sm"
            title="Join WhatsApp Group"
            aria-label="Join WhatsApp Group"
          >
            <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.74-.66-1.25-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.71 4.3 3.79.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.3z"/>
            </svg>
          </a>
        </div>

        {/* Mobile Telemetry Toggle Button */}
        <button
          onClick={onToggleTelemetry}
          className={`lg:hidden flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
            isTelemetryOpen
              ? 'bg-cyan-500 text-slate-950 font-semibold border-cyan-400 shadow-md shadow-cyan-950/50'
              : 'bg-slate-900/90 text-cyan-300 border-cyan-800/80 hover:bg-slate-800'
          }`}
          title="Toggle Real-Time Telemetry HUD"
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-[11px]">Telemetry</span>
        </button>

        <button
          onClick={onOpenInfo}
          className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all text-xs"
        >
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="hidden sm:inline">Clinical Playbook</span>
          <span className="sm:hidden text-[11px]">Playbook</span>
        </button>
      </div>
    </header>
  );
};
