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
          {/* Neon glow filter — layered blur for organic neon look */}
          <filter id="vein-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Sweeping gradient — uniform flow top to bottom, lavender → pink → purple */}
          <linearGradient id="vein-sweep" x1="0" y1="0" x2="0" y2="600" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e0a3ff" stopOpacity="0" />
            <stop offset="25%" stopColor="#e0a3ff" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#ff69b4" stopOpacity="0.7" />
            <stop offset="75%" stopColor="#9370db" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#9370db" stopOpacity="0" />
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              from="0 -600"
              to="0 1600"
              dur="12s"
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>

        {/* ===== MAIN ARTERY — full height, organic wobble ===== */}
        <path
          d="M 65 0 C 68 60, 58 130, 62 200 C 66 270, 52 350, 58 430 C 64 510, 48 590, 54 670 C 60 750, 44 830, 50 910 C 54 950, 48 980, 50 1000"
          stroke="#9370db"
          strokeWidth="2"
          strokeOpacity="0.08"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />
        <path
          d="M 65 0 C 68 60, 58 130, 62 200 C 66 270, 52 350, 58 430 C 64 510, 48 590, 54 670 C 60 750, 44 830, 50 910 C 54 950, 48 980, 50 1000"
          stroke="url(#vein-sweep)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />

        {/* ===== BRANCH 1 — from main at y~100, curves right ===== */}
        <path
          d="M 64 100 C 82 94, 104 108, 125 100 C 142 94, 158 104, 172 96"
          stroke="#9370db"
          strokeWidth="1.4"
          strokeOpacity="0.07"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />
        <path
          d="M 64 100 C 82 94, 104 108, 125 100 C 142 94, 158 104, 172 96"
          stroke="url(#vein-sweep)"
          strokeWidth="1.8"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />

        {/* Sub-branch 1a — from branch 1 midpoint, up-right */}
        <path
          d="M 125 100 C 132 86, 142 76, 152 68"
          stroke="#9370db"
          strokeWidth="0.9"
          strokeOpacity="0.06"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />
        <path
          d="M 125 100 C 132 86, 142 76, 152 68"
          stroke="url(#vein-sweep)"
          strokeWidth="1.2"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />

        {/* Sub-branch 1b — from branch 1 tip */}
        <path
          d="M 172 96 C 182 104, 192 100, 200 108"
          stroke="#9370db"
          strokeWidth="0.7"
          strokeOpacity="0.05"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />
        <path
          d="M 172 96 C 182 104, 192 100, 200 108"
          stroke="url(#vein-sweep)"
          strokeWidth="1"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />

        {/* ===== BRANCH 2 — from main at y~220, curves left ===== */}
        <path
          d="M 60 220 C 46 214, 32 224, 18 216 C 10 212, 4 206, 2 198"
          stroke="#9370db"
          strokeWidth="1.2"
          strokeOpacity="0.07"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />
        <path
          d="M 60 220 C 46 214, 32 224, 18 216 C 10 212, 4 206, 2 198"
          stroke="url(#vein-sweep)"
          strokeWidth="1.6"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />

        {/* ===== BRANCH 3 — from main at y~340, long right branch ===== */}
        <path
          d="M 58 340 C 78 334, 100 346, 122 338 C 142 332, 162 344, 180 336 C 195 330, 208 338, 218 332"
          stroke="#9370db"
          strokeWidth="1.3"
          strokeOpacity="0.07"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />
        <path
          d="M 58 340 C 78 334, 100 346, 122 338 C 142 332, 162 344, 180 336 C 195 330, 208 338, 218 332"
          stroke="url(#vein-sweep)"
          strokeWidth="1.8"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />

        {/* Sub-branch 3a — from branch 3 midpoint, down */}
        <path
          d="M 122 338 C 130 354, 140 368, 148 380"
          stroke="#9370db"
          strokeWidth="0.8"
          strokeOpacity="0.06"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />
        <path
          d="M 122 338 C 130 354, 140 368, 148 380"
          stroke="url(#vein-sweep)"
          strokeWidth="1.2"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />

        {/* Sub-branch 3b — from branch 3 at three-quarter, up */}
        <path
          d="M 180 336 C 188 322, 196 314, 204 306"
          stroke="#9370db"
          strokeWidth="0.7"
          strokeOpacity="0.05"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />
        <path
          d="M 180 336 C 188 322, 196 314, 204 306"
          stroke="url(#vein-sweep)"
          strokeWidth="1"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />

        {/* ===== BRANCH 4 — from main at y~500, goes right ===== */}
        <path
          d="M 60 500 C 80 494, 102 506, 124 498 C 142 492, 158 502, 170 496"
          stroke="#9370db"
          strokeWidth="1.2"
          strokeOpacity="0.07"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />
        <path
          d="M 60 500 C 80 494, 102 506, 124 498 C 142 492, 158 502, 170 496"
          stroke="url(#vein-sweep)"
          strokeWidth="1.6"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />

        {/* Sub-branch 4a — from branch 4 midpoint, down */}
        <path
          d="M 124 498 C 132 514, 142 526, 150 538"
          stroke="#9370db"
          strokeWidth="0.8"
          strokeOpacity="0.05"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />
        <path
          d="M 124 498 C 132 514, 142 526, 150 538"
          stroke="url(#vein-sweep)"
          strokeWidth="1.2"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />

        {/* ===== BRANCH 5 — from main at y~640, curves left ===== */}
        <path
          d="M 54 640 C 40 634, 26 644, 14 636 C 6 632, 2 624, 0 616"
          stroke="#9370db"
          strokeWidth="1"
          strokeOpacity="0.06"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />
        <path
          d="M 54 640 C 40 634, 26 644, 14 636 C 6 632, 2 624, 0 616"
          stroke="url(#vein-sweep)"
          strokeWidth="1.4"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />

        {/* ===== BRANCH 6 — from main at y~760, goes right ===== */}
        <path
          d="M 52 760 C 70 754, 90 764, 110 756 C 126 750, 140 758, 150 752"
          stroke="#9370db"
          strokeWidth="1.1"
          strokeOpacity="0.06"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />
        <path
          d="M 52 760 C 70 754, 90 764, 110 756 C 126 750, 140 758, 150 752"
          stroke="url(#vein-sweep)"
          strokeWidth="1.5"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />

        {/* ===== BRANCH 7 — from main at y~870, small left ===== */}
        <path
          d="M 52 870 C 38 864, 24 874, 12 866"
          stroke="#9370db"
          strokeWidth="0.8"
          strokeOpacity="0.05"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />
        <path
          d="M 52 870 C 38 864, 24 874, 12 866"
          stroke="url(#vein-sweep)"
          strokeWidth="1.2"
          strokeLinecap="round"
          filter="url(#vein-glow)"
        />

        {/* ===== CAPILLARY STUBS — very thin, organic endings ===== */}
        <path d="M 152 68 C 158 60, 162 54, 164 46" stroke="#e0a3ff" strokeWidth="0.5" strokeOpacity="0.04" strokeLinecap="round" filter="url(#vein-glow)" />
        <path d="M 200 108 C 206 114, 214 112, 220 118" stroke="#e0a3ff" strokeWidth="0.5" strokeOpacity="0.04" strokeLinecap="round" filter="url(#vein-glow)" />
        <path d="M 2 198 C 0 190, 2 184, 6 176" stroke="#e0a3ff" strokeWidth="0.5" strokeOpacity="0.04" strokeLinecap="round" filter="url(#vein-glow)" />
        <path d="M 218 332 C 224 326, 228 320, 230 312" stroke="#e0a3ff" strokeWidth="0.4" strokeOpacity="0.04" strokeLinecap="round" filter="url(#vein-glow)" />
        <path d="M 148 380 C 154 390, 158 398, 160 406" stroke="#e0a3ff" strokeWidth="0.4" strokeOpacity="0.04" strokeLinecap="round" filter="url(#vein-glow)" />
        <path d="M 204 306 C 210 298, 214 292, 216 284" stroke="#e0a3ff" strokeWidth="0.4" strokeOpacity="0.04" strokeLinecap="round" filter="url(#vein-glow)" />
        <path d="M 170 496 C 180 490, 188 494, 196 488" stroke="#e0a3ff" strokeWidth="0.4" strokeOpacity="0.04" strokeLinecap="round" filter="url(#vein-glow)" />
        <path d="M 150 538 C 156 548, 160 556, 162 564" stroke="#e0a3ff" strokeWidth="0.4" strokeOpacity="0.04" strokeLinecap="round" filter="url(#vein-glow)" />
        <path d="M 0 616 C 0 608, 2 600, 6 592" stroke="#e0a3ff" strokeWidth="0.4" strokeOpacity="0.04" strokeLinecap="round" filter="url(#vein-glow)" />
        <path d="M 150 752 C 160 748, 168 752, 176 746" stroke="#e0a3ff" strokeWidth="0.4" strokeOpacity="0.04" strokeLinecap="round" filter="url(#vein-glow)" />
        <path d="M 12 866 C 4 860, 0 854, 0 846" stroke="#e0a3ff" strokeWidth="0.4" strokeOpacity="0.04" strokeLinecap="round" filter="url(#vein-glow)" />

        {/* ===== JUNCTION NODES — pulsing dots at branch points ===== */}

        {/* Main artery branch points */}
        <circle cx="64" cy="100" r="2.5" fill="#e0a3ff" filter="url(#vein-glow)">
          <animate attributeName="opacity" values="0.08;0.3;0.08" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="220" r="2.5" fill="#e0a3ff" filter="url(#vein-glow)">
          <animate attributeName="opacity" values="0.08;0.3;0.08" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx="58" cy="340" r="2.5" fill="#e0a3ff" filter="url(#vein-glow)">
          <animate attributeName="opacity" values="0.08;0.3;0.08" dur="4.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="500" r="2" fill="#e0a3ff" filter="url(#vein-glow)">
          <animate attributeName="opacity" values="0.06;0.25;0.06" dur="5.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="54" cy="640" r="2" fill="#e0a3ff" filter="url(#vein-glow)">
          <animate attributeName="opacity" values="0.06;0.25;0.06" dur="6s" repeatCount="indefinite" />
        </circle>
        <circle cx="52" cy="760" r="2" fill="#e0a3ff" filter="url(#vein-glow)">
          <animate attributeName="opacity" values="0.05;0.22;0.05" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx="52" cy="870" r="1.5" fill="#e0a3ff" filter="url(#vein-glow)">
          <animate attributeName="opacity" values="0.05;0.2;0.05" dur="6.5s" repeatCount="indefinite" />
        </circle>

        {/* Sub-branch junction nodes */}
        <circle cx="125" cy="100" r="1.5" fill="#ff69b4" filter="url(#vein-glow)">
          <animate attributeName="opacity" values="0.05;0.2;0.05" dur="4.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="122" cy="338" r="1.5" fill="#ff69b4" filter="url(#vein-glow)">
          <animate attributeName="opacity" values="0.05;0.2;0.05" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx="180" cy="336" r="1.5" fill="#ff69b4" filter="url(#vein-glow)">
          <animate attributeName="opacity" values="0.04;0.18;0.04" dur="5.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="124" cy="498" r="1.5" fill="#ff69b4" filter="url(#vein-glow)">
          <animate attributeName="opacity" values="0.04;0.18;0.04" dur="6s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
