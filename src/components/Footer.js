// MindMitra Universal Footer Component (Faithful to Stitch export)
export function renderFooter() {
  return `
  <footer class="w-full bg-surface-container-low mt-space-3xl py-space-2xl border-t border-surface-container">
    <div class="max-w-7xl mx-auto px-margin-mobile lg:px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-space-lg">
      <div class="flex items-center gap-space-sm">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" width="120" height="30" fill="none">
          <g transform="translate(4, 4)">
            <circle cx="16" cy="16" r="15" fill="#FAF7F2" stroke="#E6DFD5" stroke-width="1"/>
            <path d="M16 6C12 11 11 16 16 26C21 16 20 11 16 6Z" fill="#9f3c16" opacity="0.95"/>
            <path d="M6 16C11 12 16 11 26 16C16 21 11 20 6 16Z" fill="#79526c" opacity="0.85"/>
            <circle cx="16" cy="16" r="3.5" fill="#FAF7F2"/>
            <circle cx="16" cy="16" r="2" fill="#D9822B"/>
          </g>
          <text x="44" y="24" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="18" font-weight="700" fill="#1f1b18" letter-spacing="-0.3">Mind<tspan fill="#9f3c16">Mitra</tspan></text>
        </svg>
        <span class="font-caption text-caption text-on-surface-variant">• Gentle Cognitive Care &amp; Reminiscence</span>
      </div>

      <div class="flex flex-wrap items-center gap-space-lg font-label-md text-label-md text-on-surface-variant">
        <span class="flex items-center gap-space-2xs text-tertiary font-medium">
          <span class="material-symbols-outlined text-[18px]">cloud_done</span> 
          Local Safe Sync
        </span>
        <a href="#/accessibility" class="hover:text-on-surface transition-colors">Elder Accessibility</a>
        <a href="#/privacy" class="hover:text-on-surface transition-colors">Heirloom Privacy</a>
        <a href="#/emergency-sos" class="inline-flex items-center gap-space-2xs text-error font-medium hover:text-on-error-container transition-colors">
          <span class="material-symbols-outlined text-[18px]">emergency</span>
          <span>Emergency SOS</span>
        </a>
      </div>

      <div class="font-caption text-caption text-on-surface-variant text-center md:text-right">
        © 2024 MindMitra. Crafted for dignity, calm, and memory longevity.
      </div>
    </div>
  </footer>
  `;
}
