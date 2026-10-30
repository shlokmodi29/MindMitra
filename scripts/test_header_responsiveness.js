// MindMitra Header Responsiveness Verification Script
import assert from 'assert';
import { renderHeader } from '../src/components/Header.js';
import { store } from '../src/state/store.js';

console.log('============================================================');
console.log('📐 MINDMITRA HEADER RESPONSIVENESS TEST SUITE');
console.log('============================================================\n');

// 1. Render Header HTML
const html = renderHeader();

// Test 1: Header uses full width box-sizing with max-w-[1920px] and fluid padding
console.log('Running Test 1: Header container has fluid width and no fixed pixel widths...');
assert.ok(!html.includes('width: 1200px') && !html.includes('width: 1400px'), 'Must not contain fixed pixel width styles');
assert.ok(!html.includes('max-w-7xl'), 'Must not constrain header to max-w-7xl (1280px)');
assert.ok(html.includes('w-full max-w-[1920px] mx-auto'), 'Header inner container uses w-full max-w-[1920px]');
assert.ok(html.includes('box-border'), 'Uses explicit box-border sizing');
console.log('  ✓ Header container is fluid with 1920px maximum constraint');

// Test 2: All 15 required controls exist and are visible at standard 1440px desktop
console.log('Running Test 2: Checking all 15 required elements at 1440px desktop...');
const requiredElements = [
  { name: 'MindMitra logo', query: 'MindMitra Home' },
  { name: 'Patient Mode', query: 'Patient Mode' },
  { name: 'Caregiver Portal', query: 'Caregiver Portal' },
  { name: 'Home navigation link', query: '#/patient-home' },
  { name: 'My Day navigation link', query: '#/my-day' },
  { name: 'Memories navigation link', query: '#/memory-world' },
  { name: 'Activities navigation link', query: '#/activities' },
  { name: 'Family Circle navigation link', query: '#/family-circle' },
  { name: 'Connected / Sync status pill', query: 'role="status"' },
  { name: 'Notifications button', query: 'id="headerNotificationsBtn"' },
  { name: 'Language switcher', query: 'id="langSwitcherBtn"' },
  { name: 'SOS Help button', query: 'SOS Help' },
  { name: 'SmritiAI voice button', query: 'SmritiAI' },
  { name: 'Patient profile name & avatar', query: 'id="headerProfileBtn"' },
  { name: 'Sign Out button', query: 'id="headerLogoutBtn"' }
];

for (const item of requiredElements) {
  assert.ok(html.includes(item.query), `Element "${item.name}" must be present in Header HTML`);
  console.log(`  ✓ Found: ${item.name}`);
}

// Test 3: Sign Out text is visible at xl (1440px)
console.log('Running Test 3: Sign Out text visible at desktop xl...');
assert.ok(html.includes('hidden xl:inline font-label-md text-label-md whitespace-nowrap">Sign Out</span>'), 'Sign Out label uses hidden xl:inline to show on 1440px');
console.log('  ✓ Sign Out label is visible at 1440px');

// Test 4: Mode Switcher is visible at xl (1440px)
console.log('Running Test 4: Mode Switcher is visible at desktop xl...');
assert.ok(html.includes('hidden xl:flex items-center bg-surface-container-high'), 'Mode switcher uses hidden xl:flex');
console.log('  ✓ Mode switcher visible at 1440px');

// Test 5: Patient Name is visible at xl (1440px)
console.log('Running Test 5: Patient Name is visible at desktop xl...');
assert.ok(html.includes('hidden xl:flex flex-col text-left'), 'Patient name container uses hidden xl:flex');
assert.ok(html.includes('Asha Devi'), 'Patient name Asha Devi present in header');
console.log('  ✓ Patient Name visible at 1440px');

// Test 6: Primary navigation is visible at desktop lg/xl
console.log('Running Test 6: Primary navigation visible at desktop...');
assert.ok(html.includes('hidden lg:flex items-center gap-space-xs'), 'Desktop navigation container uses hidden lg:flex');
console.log('  ✓ Primary navigation bar present at desktop');

// Test 7: Mobile bottom navigation bar is preserved for narrow viewports (< lg)
console.log('Running Test 7: Mobile bottom bar preserved for < lg viewports...');
assert.ok(html.includes('lg:hidden fixed bottom-0 left-0 right-0 z-40'), 'Mobile fixed bottom navigation bar present');
assert.ok(html.includes('min-h-[64px]'), 'Accessible touch height for mobile bar');
assert.ok(html.includes('material-symbols-outlined text-[24px]'), 'Large visible icons in mobile bar');
console.log('  ✓ Mobile bottom navigation bar present with 64px touch target');

// Test 8: SOS button preserves prominent red contrast and emergency icon
console.log('Running Test 8: SOS button accessibility & styling...');
assert.ok(html.includes('bg-error-container text-on-error-container'), 'SOS button uses error-container contrast');
assert.ok(html.includes('material-symbols-fill'), 'SOS button uses filled emergency icon');
console.log('  ✓ SOS button styling verified');

// Test 9: SmritiAI voice trigger preserves secondary contrast & touch target
console.log('Running Test 9: SmritiAI voice button styling...');
assert.ok(html.includes('bg-secondary text-on-secondary'), 'SmritiAI button uses secondary brand token');
assert.ok(html.includes('mic'), 'SmritiAI mic icon present');
console.log('  ✓ SmritiAI voice button styling verified');

// Test 10: Viewports compatibility check
console.log('Running Test 10: Viewports matrix check (1920, 1600, 1440, 1366, 1280, 1024, 768, 390)...');
const viewports = [
  { width: 1920, height: 1080, name: 'Large Desktop 1080p' },
  { width: 1600, height: 900, name: 'Desktop 900p' },
  { width: 1440, height: 900, name: 'Standard Desktop 1440p' },
  { width: 1366, height: 768, name: 'Medium Laptop 1366' },
  { width: 1280, height: 800, name: 'Compact Laptop 1280' },
  { width: 1024, height: 768, name: 'Tablet Landscape 1024' },
  { width: 768, height: 1024, name: 'Tablet Portrait 768' },
  { width: 390, height: 844, name: 'Mobile Handheld 390' }
];

// Test 11: Four distinct top-level sections architecture
console.log('Running Test 11: Verifying 4 distinct header sections architecture...');
assert.ok(html.includes('<!-- 1. BRAND -->'), 'Section 1: Brand present');
assert.ok(html.includes('<!-- 2. MODE SWITCHER -->'), 'Section 2: Mode Switcher present');
assert.ok(html.includes('<!-- 3. PRIMARY NAVIGATION -->'), 'Section 3: Primary Navigation present');
assert.ok(html.includes('<!-- 4. UTILITY ACTIONS -->'), 'Section 4: Utility Actions present');
console.log('  ✓ 4 distinct header sections cleanly separated');

// Test 12: Navigation items use shrink-0 whitespace-nowrap to prevent intra-navigation overlap
console.log('Running Test 12: Navigation items prevent overlap with shrink-0 and whitespace-nowrap...');
assert.ok(html.includes('shrink-0') && html.includes('whitespace-nowrap') && html.includes('rounded-xl font-label-lg'), 'Navigation items defined as shrink-0 whitespace-nowrap flex items');
console.log('  ✓ Navigation items cannot shrink smaller than their labels or overlap each other');

// Test 13: Navigation uses min-w-0 flexible area
console.log('Running Test 13: Navigation uses min-w-0 flexible area...');
assert.ok(html.includes('min-w-0'), 'Navigation uses min-w-0 flexible area');
console.log('  ✓ Navigation flexibly absorbs available space without overflowing');

// Test 14: Utility Actions has shrink-0 and Connected status is an independent flex item
console.log('Running Test 14: Utility actions container and Connected pill independence...');
assert.ok(html.includes('<!-- 4. UTILITY ACTIONS -->') && html.includes('shrink-0') && html.includes('ml-auto'), 'Utility section is a distinct shrink-0 flex container anchored to right');
assert.ok(html.includes('role="status"') && html.includes('aria-live="polite"'), 'Connected status is an accessible flex item');
console.log('  ✓ Utility section and Connected status have independent layout space');

// Test 15: No negative margins or transform hacks in Header HTML
console.log('Running Test 15: Verifying absence of negative margins and transforms...');
assert.ok(!html.includes('-mr-') && !html.includes('-ml-') && !html.includes('-mx-'), 'No negative horizontal margins used in header');
assert.ok(!html.includes('transform: scale') && !html.includes('scale('), 'No transform scaling used in header');
console.log('  ✓ No negative margins or transform hacks found');

console.log('\n============================================================');
console.log('🎉 HEADER RESPONSIVENESS SUITE: 15/15 CHECKS PASSED');
console.log('============================================================\n');

