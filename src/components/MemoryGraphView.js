// MindMitra Memory Graph Component - Visual Interconnected Living Archive
// Connected with canonical memoryService and real memory relationships
import { store } from '../state/store.js';
import { memoryService, FALLBACK_MEMORY_IMAGE } from '../services/memoryService.js';

export function renderMemoryGraph(selectedNodeId = null) {
  const patientId = store.getCurrentPatientId();
  const people = memoryService.getPeople(patientId);
  const places = memoryService.getPlaces(patientId);
  const events = memoryService.getEvents(patientId);
  const relationships = memoryService.getRelationships(patientId);

  const allNodes = [...people, ...places, ...events];
  const activeNode = selectedNodeId 
    ? allNodes.find(n => n.id === selectedNodeId) || people[0]
    : people[0] || allNodes[0];

  // Resolve connected items for activeNode
  let connectedMemories = [];
  let connectionDescription = '';

  if (activeNode) {
    if (activeNode.id.startsWith('p-')) {
      const pContext = memoryService.getPersonWithContext(activeNode.id);
      connectedMemories = pContext?.memories || [];
      connectionDescription = `${activeNode.relation || 'Family'} • ${connectedMemories.length} connected memories`;
    } else if (activeNode.id.startsWith('plc-')) {
      const plcContext = memoryService.getPlaceWithContext(activeNode.id);
      connectedMemories = plcContext?.memories || [];
      connectionDescription = `${activeNode.region || 'Sacred Place'} • ${connectedMemories.length} connected memories`;
    } else if (activeNode.id.startsWith('evt-')) {
      const eContext = memoryService.getEventWithContext(activeNode.id);
      connectedMemories = eContext?.memories || [];
      connectionDescription = `${activeNode.date || 'Life Celebration'} • ${connectedMemories.length} connected memories`;
    }
  }

  const patient = store.getState().currentUser || store.getState().profile || store.getState().users[0];
  const patientName = (patient?.name || 'Asha Devi').toUpperCase();

  return `
  <div class="w-full bg-surface-container-lowest rounded-2xl p-space-lg lg:p-space-xl border border-surface-container shadow-sm mb-space-xl">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <div class="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-secondary-fixed/40 text-on-secondary-fixed font-caption text-caption mb-space-xs font-semibold">
          <span class="material-symbols-outlined text-[16px]">hub</span>
          <span>Interconnected Living Archive</span>
        </div>
        <h2 class="font-headline-md text-headline-md text-on-surface font-bold">Memory Knowledge Graph</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">
          Explore how people, sacred places, and heirloom moments connect in your world. Tap any circle.
        </p>
      </div>

      <div class="flex items-center gap-space-xs text-on-surface-variant font-caption text-caption bg-surface-container p-2 rounded-xl">
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-primary"></span> People</span>
        <span class="flex items-center gap-1 ml-2"><span class="w-3 h-3 rounded-full bg-secondary"></span> Places</span>
        <span class="flex items-center gap-1 ml-2"><span class="w-3 h-3 rounded-full bg-tertiary"></span> Events</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
      <!-- Interactive SVG Graph Visualizer -->
      <div class="lg:col-span-8 bg-surface-container-low rounded-xl p-space-md relative overflow-hidden flex items-center justify-center min-h-[380px] border border-surface-container">
        <svg class="w-full h-80" viewBox="0 0 600 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Connection Lines between Center and Nodes -->
          <line x1="300" y1="160" x2="150" y2="70" stroke="#dec0b7" stroke-width="2" stroke-dasharray="3 3"/>
          <line x1="300" y1="160" x2="450" y2="70" stroke="#dec0b7" stroke-width="2" stroke-dasharray="3 3"/>
          <line x1="300" y1="160" x2="120" y2="230" stroke="#dec0b7" stroke-width="2" stroke-dasharray="3 3"/>
          <line x1="300" y1="160" x2="480" y2="230" stroke="#dec0b7" stroke-width="2" stroke-dasharray="3 3"/>
          <line x1="150" y1="70" x2="120" y2="230" stroke="#dec0b7" stroke-width="1.5"/>
          <line x1="450" y1="70" x2="480" y2="230" stroke="#dec0b7" stroke-width="1.5"/>

          <!-- Center Node: Patient -->
          <circle cx="300" cy="160" r="38" fill="#FAF7F2" stroke="#9f3c16" stroke-width="4" class="shadow-md cursor-default"/>
          <text x="300" y="165" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#9f3c16" text-anchor="middle">${patientName.slice(0, 12)}</text>

          <!-- Node 1: Meera (Daughter) -->
          <g class="graph-node-btn cursor-pointer transition-transform hover:scale-105" data-id="p-meera">
            <circle cx="150" cy="70" r="28" fill="${activeNode?.id === 'p-meera' ? '#ffe8e0' : '#FAF7F2'}" stroke="#9f3c16" stroke-width="${activeNode?.id === 'p-meera' ? '4' : '2.5'}"/>
            <text x="150" y="74" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#1f1b18" text-anchor="middle">Meera</text>
          </g>

          <!-- Node 2: Shillong Pine Ridge -->
          <g class="graph-node-btn cursor-pointer transition-transform hover:scale-105" data-id="plc-shillong">
            <circle cx="450" cy="70" r="28" fill="${activeNode?.id === 'plc-shillong' ? '#f5e8f0' : '#FAF7F2'}" stroke="#79526c" stroke-width="${activeNode?.id === 'plc-shillong' ? '4' : '2.5'}"/>
            <text x="450" y="74" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#1f1b18" text-anchor="middle">Shillong</text>
          </g>

          <!-- Node 3: Guwahati Courtyard -->
          <g class="graph-node-btn cursor-pointer transition-transform hover:scale-105" data-id="plc-guwahati">
            <circle cx="120" cy="230" r="28" fill="${activeNode?.id === 'plc-guwahati' ? '#f5e8f0' : '#FAF7F2'}" stroke="#79526c" stroke-width="${activeNode?.id === 'plc-guwahati' ? '4' : '2.5'}"/>
            <text x="120" y="234" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#1f1b18" text-anchor="middle">Guwahati</text>
          </g>

          <!-- Node 4: Priya (Granddaughter) -->
          <g class="graph-node-btn cursor-pointer transition-transform hover:scale-105" data-id="p-priya">
            <circle cx="480" cy="230" r="28" fill="${activeNode?.id === 'p-priya' ? '#e2f0e6' : '#FAF7F2'}" stroke="#3e644a" stroke-width="${activeNode?.id === 'p-priya' ? '4' : '2.5'}"/>
            <text x="480" y="234" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="#1f1b18" text-anchor="middle">Priya</text>
          </g>
        </svg>

        <span class="absolute bottom-2 right-3 font-caption text-caption text-on-surface-variant italic">
          Tap any circle to explore its life connections
        </span>
      </div>

      <!-- Active Node Detail Card -->
      <div class="lg:col-span-4 bg-surface-container p-space-lg rounded-xl border border-surface-container-high flex flex-col justify-between h-full min-h-[380px]">
        <div>
          <div class="flex items-center gap-space-xs mb-space-sm">
            <span class="px-space-xs py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-caption font-bold">
              Active Focus
            </span>
            <span class="font-caption text-caption text-on-surface-variant font-medium">
              ${connectionDescription}
            </span>
          </div>

          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${activeNode?.name || activeNode?.title || 'Selected Keepsake'}</h3>
          <p class="font-body-md text-body-md text-on-surface-variant mt-1 leading-relaxed">
            ${activeNode?.description || activeNode?.bio || 'Cherished and connected in your living archive.'}
          </p>

          <!-- Connected Memories List -->
          ${connectedMemories.length > 0 ? `
            <div class="mt-space-md pt-space-sm border-t border-surface-container-high">
              <span class="font-caption text-caption text-primary font-bold uppercase tracking-wider block mb-space-xs">
                Cherished Stories
              </span>
              <div class="space-y-space-xs max-h-40 overflow-y-auto">
                ${connectedMemories.map(m => `
                  <div class="graph-memory-item p-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high border border-surface-container flex items-center justify-between cursor-pointer transition-colors" data-id="${m.id}">
                    <span class="font-label-md text-label-md text-on-surface truncate font-semibold">${m.title}</span>
                    <span class="material-symbols-outlined text-[18px] text-primary shrink-0">arrow_forward</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="pt-space-md border-t border-surface-container-high mt-space-md">
          <button id="inspectActiveNodeBtn" class="w-full min-h-[44px] px-space-md rounded-xl bg-surface-container-lowest hover:bg-surface-container-highest text-primary font-label-md text-label-md flex items-center justify-center gap-space-xs shadow-sm transition-colors cursor-pointer" data-id="${activeNode?.id}" type="button">
            <span class="material-symbols-outlined text-[18px]">visibility</span>
            <span>View Full Details</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  `;
}

export function attachMemoryGraphEvents() {
  const nodeBtns = document.querySelectorAll('.graph-node-btn');
  const inspectBtn = document.getElementById('inspectActiveNodeBtn');
  const memoryItems = document.querySelectorAll('.graph-memory-item');

  nodeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const container = document.getElementById('memory-graph-container');
      if (container) {
        container.innerHTML = renderMemoryGraph(id);
        attachMemoryGraphEvents();
      }
    });
  });

  memoryItems.forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      const mem = memoryService.getMemoryById(id);
      if (mem) {
        store.setSelectedMemoryDetail(mem);
        store.setMemoryDetailModalOpen(true);
      }
    });
  });

  if (inspectBtn) {
    inspectBtn.addEventListener('click', () => {
      const id = inspectBtn.getAttribute('data-id');
      if (!id) return;

      let entityContext = null;
      let type = null;
      if (id.startsWith('p-')) {
        type = 'person';
        entityContext = memoryService.getPersonWithContext(id);
      } else if (id.startsWith('plc-')) {
        type = 'place';
        entityContext = memoryService.getPlaceWithContext(id);
      } else if (id.startsWith('evt-')) {
        type = 'event';
        entityContext = memoryService.getEventWithContext(id);
      }

      if (entityContext && type) {
        store.setSelectedEntityDetail(type, entityContext);
        store.setEntityDetailModalOpen(true);
      }
    });
  }
}
