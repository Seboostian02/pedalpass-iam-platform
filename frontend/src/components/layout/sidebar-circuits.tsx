export function SidebarCircuits() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="h-full w-full"
        viewBox="0 0 240 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMinYMin slice"
      >
        <defs>
          {/* Neon glow filter */}
          <filter id="neon" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ===== MAIN TRUNK — left side, full height ===== */}
        <path
          d="M 25 60 Q 28 130 24 200 Q 20 270 28 340 Q 35 410 24 480 Q 16 550 28 620 Q 36 690 24 760 Q 16 830 25 900 L 25 1000"
          stroke="#7c3aed"
          strokeWidth="1.5"
          strokeOpacity="0.18"
          strokeLinecap="round"
          filter="url(#neon)"
        />
        {/* Main trunk — animated pulse */}
        <path
          d="M 25 60 Q 28 130 24 200 Q 20 270 28 340 Q 35 410 24 480 Q 16 550 28 620 Q 36 690 24 760 Q 16 830 25 900 L 25 1000"
          stroke="#a855f7"
          strokeWidth="2.5"
          strokeOpacity="0.5"
          strokeLinecap="round"
          strokeDasharray="60 140"
          filter="url(#neon)"
          style={{ animation: 'vein-flow-200 6s linear infinite' }}
        />

        {/* ===== SECONDARY TRUNK — mid-left ===== */}
        <path
          d="M 75 140 Q 72 210 78 280 Q 84 350 74 420 Q 66 490 78 560"
          stroke="#7c3aed"
          strokeWidth="1"
          strokeOpacity="0.14"
          strokeLinecap="round"
          filter="url(#neon)"
        />
        <path
          d="M 75 140 Q 72 210 78 280 Q 84 350 74 420 Q 66 490 78 560"
          stroke="#a855f7"
          strokeWidth="2"
          strokeOpacity="0.4"
          strokeLinecap="round"
          strokeDasharray="40 160"
          filter="url(#neon)"
          style={{ animation: 'vein-flow-200 8s linear infinite' }}
        />

        {/* ===== RIGHT TRUNK — further right ===== */}
        <path
          d="M 150 220 Q 146 290 152 360 Q 158 430 148 500"
          stroke="#7c3aed"
          strokeWidth="0.8"
          strokeOpacity="0.1"
          strokeLinecap="round"
          filter="url(#neon)"
        />
        <path
          d="M 150 220 Q 146 290 152 360 Q 158 430 148 500"
          stroke="#a855f7"
          strokeWidth="1.5"
          strokeOpacity="0.35"
          strokeLinecap="round"
          strokeDasharray="30 170"
          filter="url(#neon)"
          style={{ animation: 'vein-flow-200 10s linear infinite' }}
        />

        {/* ===== FAR TRUNK — right edge, subtle ===== */}
        <path
          d="M 200 300 Q 196 380 202 460 Q 208 540 198 620"
          stroke="#7c3aed"
          strokeWidth="0.6"
          strokeOpacity="0.07"
          strokeLinecap="round"
          filter="url(#neon)"
        />
        <path
          d="M 200 300 Q 196 380 202 460 Q 208 540 198 620"
          stroke="#a855f7"
          strokeWidth="1.2"
          strokeOpacity="0.25"
          strokeLinecap="round"
          strokeDasharray="25 175"
          filter="url(#neon)"
          style={{ animation: 'vein-flow-200 12s linear infinite' }}
        />

        {/* ===== HORIZONTAL BRANCHES (connecting trunks) ===== */}

        {/* Main → Secondary at y≈160 */}
        <path d="M 25 160 C 40 158 55 164 75 160" stroke="#7c3aed" strokeWidth="1" strokeOpacity="0.15" strokeLinecap="round" filter="url(#neon)" />
        <path d="M 25 160 C 40 158 55 164 75 160" stroke="#a855f7" strokeWidth="1.8" strokeOpacity="0.45" strokeLinecap="round" strokeDasharray="15 85" filter="url(#neon)" style={{ animation: 'vein-flow-100 4s linear infinite' }} />

        {/* Main → Secondary at y≈320 */}
        <path d="M 28 320 C 42 318 58 324 75 320" stroke="#7c3aed" strokeWidth="1" strokeOpacity="0.15" strokeLinecap="round" filter="url(#neon)" />
        <path d="M 28 320 C 42 318 58 324 75 320" stroke="#a855f7" strokeWidth="1.8" strokeOpacity="0.45" strokeLinecap="round" strokeDasharray="12 88" filter="url(#neon)" style={{ animation: 'vein-flow-100 5s linear infinite' }} />

        {/* Main → Secondary at y≈480 */}
        <path d="M 24 480 C 38 478 56 484 75 480" stroke="#7c3aed" strokeWidth="0.8" strokeOpacity="0.12" strokeLinecap="round" filter="url(#neon)" />
        <path d="M 24 480 C 38 478 56 484 75 480" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" strokeDasharray="18 82" filter="url(#neon)" style={{ animation: 'vein-flow-100 6s linear infinite' }} />

        {/* Secondary → Right at y≈250 */}
        <path d="M 78 250 C 100 248 120 254 150 250" stroke="#7c3aed" strokeWidth="0.8" strokeOpacity="0.1" strokeLinecap="round" filter="url(#neon)" />
        <path d="M 78 250 C 100 248 120 254 150 250" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.35" strokeLinecap="round" strokeDasharray="20 80" filter="url(#neon)" style={{ animation: 'vein-flow-100 5s linear infinite' }} />

        {/* Secondary → Right at y≈400 */}
        <path d="M 74 400 C 95 398 118 404 150 400" stroke="#7c3aed" strokeWidth="0.8" strokeOpacity="0.1" strokeLinecap="round" filter="url(#neon)" />
        <path d="M 74 400 C 95 398 118 404 150 400" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.35" strokeLinecap="round" strokeDasharray="15 85" filter="url(#neon)" style={{ animation: 'vein-flow-100 7s linear infinite' }} />

        {/* Right → Far at y≈350 */}
        <path d="M 152 350 C 168 348 182 354 200 350" stroke="#7c3aed" strokeWidth="0.6" strokeOpacity="0.08" strokeLinecap="round" filter="url(#neon)" />
        <path d="M 152 350 C 168 348 182 354 200 350" stroke="#a855f7" strokeWidth="1.2" strokeOpacity="0.3" strokeLinecap="round" strokeDasharray="12 88" filter="url(#neon)" style={{ animation: 'vein-flow-100 6s linear infinite' }} />

        {/* Right → Far at y≈480 */}
        <path d="M 148 480 C 165 478 180 484 200 480" stroke="#7c3aed" strokeWidth="0.6" strokeOpacity="0.08" strokeLinecap="round" filter="url(#neon)" />
        <path d="M 148 480 C 165 478 180 484 200 480" stroke="#a855f7" strokeWidth="1.2" strokeOpacity="0.25" strokeLinecap="round" strokeDasharray="10 90" filter="url(#neon)" style={{ animation: 'vein-flow-100 8s linear infinite' }} />

        {/* ===== SHORT STUBS (capillary branches) ===== */}
        <path d="M 25 240 C 34 238 42 242 52 240" stroke="#7c3aed" strokeWidth="0.7" strokeOpacity="0.1" strokeLinecap="round" filter="url(#neon)" />
        <path d="M 28 560 C 38 558 46 562 56 560" stroke="#7c3aed" strokeWidth="0.7" strokeOpacity="0.1" strokeLinecap="round" filter="url(#neon)" />
        <path d="M 24 700 C 34 698 44 702 55 700" stroke="#7c3aed" strokeWidth="0.6" strokeOpacity="0.08" strokeLinecap="round" filter="url(#neon)" />
        <path d="M 25 840 C 35 838 44 842 54 840" stroke="#7c3aed" strokeWidth="0.6" strokeOpacity="0.08" strokeLinecap="round" filter="url(#neon)" />
        <path d="M 78 350 C 86 348 92 352 100 350" stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.08" strokeLinecap="round" filter="url(#neon)" />
        <path d="M 152 300 C 162 298 170 302 182 300" stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.07" strokeLinecap="round" filter="url(#neon)" />
        <path d="M 148 450 C 158 448 168 452 180 450" stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.07" strokeLinecap="round" filter="url(#neon)" />

        {/* ===== JUNCTION NODES (pulsing dots at intersections) ===== */}

        {/* Main trunk junctions */}
        <circle cx="25" cy="160" r="2.5" fill="#7c3aed" filter="url(#neon)">
          <animate attributeName="opacity" values="0.15;0.45;0.15" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="28" cy="320" r="2.5" fill="#7c3aed" filter="url(#neon)">
          <animate attributeName="opacity" values="0.15;0.45;0.15" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx="24" cy="480" r="2" fill="#7c3aed" filter="url(#neon)">
          <animate attributeName="opacity" values="0.12;0.4;0.12" dur="6s" repeatCount="indefinite" />
        </circle>

        {/* Secondary trunk junctions */}
        <circle cx="75" cy="160" r="2" fill="#a855f7" filter="url(#neon)">
          <animate attributeName="opacity" values="0.12;0.38;0.12" dur="4.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="78" cy="250" r="2" fill="#a855f7" filter="url(#neon)">
          <animate attributeName="opacity" values="0.1;0.35;0.1" dur="5.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="75" cy="320" r="2" fill="#a855f7" filter="url(#neon)">
          <animate attributeName="opacity" values="0.1;0.35;0.1" dur="6s" repeatCount="indefinite" />
        </circle>
        <circle cx="74" cy="400" r="1.5" fill="#a855f7" filter="url(#neon)">
          <animate attributeName="opacity" values="0.08;0.3;0.08" dur="7s" repeatCount="indefinite" />
        </circle>

        {/* Right trunk junctions */}
        <circle cx="150" cy="250" r="1.5" fill="#a855f7" filter="url(#neon)">
          <animate attributeName="opacity" values="0.08;0.3;0.08" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="400" r="1.5" fill="#a855f7" filter="url(#neon)">
          <animate attributeName="opacity" values="0.06;0.25;0.06" dur="6s" repeatCount="indefinite" />
        </circle>
        <circle cx="152" cy="350" r="1.5" fill="#a855f7" filter="url(#neon)">
          <animate attributeName="opacity" values="0.06;0.22;0.06" dur="7s" repeatCount="indefinite" />
        </circle>

        {/* Far trunk junctions */}
        <circle cx="200" cy="350" r="1" fill="#a855f7" filter="url(#neon)">
          <animate attributeName="opacity" values="0.05;0.2;0.05" dur="5.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="480" r="1" fill="#a855f7" filter="url(#neon)">
          <animate attributeName="opacity" values="0.05;0.18;0.05" dur="6.5s" repeatCount="indefinite" />
        </circle>

        {/* End-of-stub nodes */}
        <circle cx="52" cy="240" r="1.2" fill="#7c3aed" opacity="0.1" filter="url(#neon)" />
        <circle cx="56" cy="560" r="1.2" fill="#7c3aed" opacity="0.1" filter="url(#neon)" />
        <circle cx="55" cy="700" r="1" fill="#7c3aed" opacity="0.08" filter="url(#neon)" />
        <circle cx="54" cy="840" r="1" fill="#7c3aed" opacity="0.08" filter="url(#neon)" />
        <circle cx="100" cy="350" r="1" fill="#a855f7" opacity="0.07" filter="url(#neon)" />
        <circle cx="182" cy="300" r="1" fill="#a855f7" opacity="0.06" filter="url(#neon)" />
        <circle cx="180" cy="450" r="1" fill="#a855f7" opacity="0.06" filter="url(#neon)" />
      </svg>
    </div>
  );
}
