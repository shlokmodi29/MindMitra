// Caregiver Memory Bridge View - Dedicated Curation & Upload Portal
// Enhanced in Part 4 with Full Ingestion, Editing, Relationship Linking, & Safe Deletion
import { store } from '../state/store.js';
import { memoryService, FALLBACK_MEMORY_IMAGE } from '../services/memoryService.js';
import { showToast } from '../components/Toast.js';

let editingMemoryId = null;
let pendingDeleteId = null;

export function renderCaregiverMemoryBridgeView() {
  const patientId = store.getCurrentPatientId();
  const state = store.getState();
  const memories = memoryService.getPatientMemories(patientId);
  const people = memoryService.getPeople(patientId);
  const places = memoryService.getPlaces(patientId);
  const events = memoryService.getEvents(patientId);

  const editingMemory = editingMemoryId ? memories.find(m => m.id === editingMemoryId) : null;
  const deleteTarget = pendingDeleteId ? memories.find(m => m.id === pendingDeleteId) : null;

  return `
  <div class="w-full bg-surface min-h-screen">
    <!-- Main Content Area -->
    <div class="lg:pl-72">
      <!-- Caregiver Header -->
      <header class="h-20 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(74,40,64,0.04)] z-40 flex items-center justify-between px-space-md lg:px-space-xl border-b border-surface-container">
        <div class="flex items-center gap-space-md">
          <div class="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md">
            <span class="material-symbols-outlined text-[18px]">history_edu</span>
            <span>Memory Bridge Curation Hub</span>
          </div>
        </div>
        <div class="flex items-center gap-space-xs">
          <a href="#/memory-timeline" class="px-space-md py-space-xs rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-[18px]">history_toggle_off</span>
            <span>View Memory Timeline</span>
          </a>
          <a href="#/caregiver-dashboard" class="px-space-md py-space-xs rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors">
            Return to Dashboard
          </a>
        </div>
      </header>

      <main class="w-full px-space-md lg:px-space-xl py-space-lg">
        <div class="flex flex-col w-full gap-y-space-xl">
          <!-- Banner -->
          <section class="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm border border-surface-container">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
              <div>
                <h1 class="font-headline-lg text-headline-lg text-on-surface font-bold">Memory Bridge Ingestion</h1>
                <p class="font-body-md text-body-md text-on-surface-variant mt-1">
                  Queue personal stories, photos, and voice notes for Asha Devi’s daily recollection exercises.
                </p>
              </div>
              <button id="quickUploadNewBtn" class="flex items-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-md transition-all cursor-pointer">
                <span class="material-symbols-outlined text-[20px]">${editingMemoryId ? 'edit' : 'add_photo_alternate'}</span>
                <span>${editingMemoryId ? 'Editing Memory' : 'Contribute New Keepsake'}</span>
              </button>
            </div>
          </section>

          <!-- Ingestion / Edit Form (Hidden by default, expandable or active if editing) -->
          <div id="memoryUploadDrawer" class="${editingMemoryId ? 'block' : 'hidden'} rounded-xl bg-surface-container-low p-space-xl border border-surface-container">
            <h2 class="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">
              ${editingMemoryId ? `Edit Memory: "${editingMemory?.title}"` : 'Add Family Story or Keepsake'}
            </h2>
            <form id="newMemoryForm" class="space-y-space-md">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div>
                  <label class="block font-label-md text-label-md text-on-surface mb-1">Memory Title *</label>
                  <input id="memTitle" required value="${editingMemory ? editingMemory.title : ''}" class="w-full h-12 px-space-md rounded-xl bg-surface-container-lowest border border-outline/20 text-on-surface" placeholder="e.g. Veranda Tea with Grandchildren" type="text" />
                </div>
                <div>
                  <label class="block font-label-md text-label-md text-on-surface mb-1">Category</label>
                  <select id="memCategory" class="w-full h-12 px-space-md rounded-xl bg-surface-container-lowest border border-outline/20 text-on-surface">
                    <option value="Stories" ${editingMemory?.category === 'Stories' ? 'selected' : ''}>Family Story</option>
                    <option value="Places" ${editingMemory?.category === 'Places' ? 'selected' : ''}>Sacred Place</option>
                    <option value="People" ${editingMemory?.category === 'People' ? 'selected' : ''}>People Anchor</option>
                    <option value="Special Moments" ${editingMemory?.category === 'Special Moments' ? 'selected' : ''}>Special Moment / Festival</option>
                    <option value="Voice Notes" ${editingMemory?.category === 'Voice Notes' ? 'selected' : ''}>Audio Voice Note</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                <div>
                  <label class="block font-label-md text-label-md text-on-surface mb-1">Year / Season</label>
                  <input id="memYear" value="${editingMemory ? (editingMemory.year || editingMemory.season || '') : ''}" class="w-full h-12 px-space-md rounded-xl bg-surface-container-lowest border border-outline/20 text-on-surface" placeholder="e.g. Autumn 2021" type="text" />
                </div>
                <div>
                  <label class="block font-label-md text-label-md text-on-surface mb-1">Companions</label>
                  <input id="memCompanions" value="${editingMemory ? (editingMemory.companions || '') : ''}" class="w-full h-12 px-space-md rounded-xl bg-surface-container-lowest border border-outline/20 text-on-surface" placeholder="e.g. With Meera & Priya" type="text" />
                </div>
                <div>
                  <label class="block font-label-md text-label-md text-on-surface mb-1">Connected Place</label>
                  <select id="memPlaceId" class="w-full h-12 px-space-md rounded-xl bg-surface-container-lowest border border-outline/20 text-on-surface">
                    <option value="">None / Unspecified</option>
                    ${places.map(plc => `
                      <option value="${plc.id}" ${editingMemory?.placeId === plc.id ? 'selected' : ''}>${plc.name}</option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div>
                <label class="block font-label-md text-label-md text-on-surface mb-1">Memory Narrative / Story Text *</label>
                <textarea id="memDescription" rows="3" required class="w-full p-space-md rounded-xl bg-surface-container-lowest border border-outline/20 text-on-surface" placeholder="Describe the warm sensory details, familiar voices, aromas, and people present...">${editingMemory ? (editingMemory.description || editingMemory.quote || '') : ''}</textarea>
              </div>

              <div class="flex gap-space-sm">
                <button type="submit" class="px-space-xl min-h-[48px] rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-md hover:bg-primary-container cursor-pointer font-semibold">
                  ${editingMemoryId ? 'Update Memory' : 'Save to Asha’s Living Archive'}
                </button>
                <button id="cancelUploadBtn" type="button" class="px-space-lg min-h-[48px] rounded-xl bg-surface-container text-on-surface font-label-md text-label-md cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <!-- Active Queued Memories -->
          <section class="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm border border-surface-container">
            <h3 class="font-headline-md text-headline-md text-on-surface font-bold mb-space-lg">All Curated Heirlooms (${memories.length})</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
              ${memories.map(m => `
                <div class="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between hover:shadow-sm transition-all">
                  <div>
                    <div class="flex items-center justify-between">
                      <span class="px-space-xs py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-caption text-caption font-semibold">${m.category}</span>
                      <div class="flex items-center gap-1">
                        <!-- Edit Action -->
                        <button class="edit-memory-btn p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer" data-id="${m.id}" title="Edit Memory" type="button">
                          <span class="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <!-- Delete Action -->
                        <button class="delete-memory-btn p-1 text-on-surface-variant hover:text-error transition-colors cursor-pointer" data-id="${m.id}" title="Delete Memory" type="button">
                          <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold mt-2 truncate">${m.title}</h4>
                    <p class="font-body-md text-body-md text-on-surface-variant mt-1 line-clamp-3 leading-relaxed">${m.quote || m.description || ''}</p>
                  </div>
                  <div class="pt-space-md mt-space-md border-t border-surface-container flex items-center justify-between">
                    <span class="font-caption text-caption text-outline">${m.year || '2024'}</span>
                    <span class="font-caption text-caption text-tertiary font-semibold flex items-center gap-1">
                      <span class="material-symbols-outlined text-[16px]">verified</span> Active on Tablet
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>
        </div>
      </main>
    </div>

    <!-- Delete Confirmation Modal -->
    ${pendingDeleteId && deleteTarget ? `
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-space-md">
        <div class="w-full max-w-md bg-surface-container-lowest rounded-2xl p-space-xl border border-surface-container shadow-2xl space-y-space-md">
          <div class="flex items-center gap-space-sm text-error">
            <span class="material-symbols-outlined text-[28px]">warning</span>
            <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">Delete this memory?</h3>
          </div>
          <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Are you sure you want to delete <strong>"${deleteTarget.title}"</strong>? Its connections will be safely pruned from Asha's Living Archive.
          </p>
          <div class="flex items-center justify-end gap-space-sm pt-space-sm">
            <button id="cancelDeleteBtn" class="px-space-lg min-h-[44px] rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md cursor-pointer" type="button">
              Cancel
            </button>
            <button id="confirmDeleteBtn" class="px-space-lg min-h-[44px] rounded-xl bg-error text-on-error font-label-md text-label-md cursor-pointer font-semibold shadow-sm" type="button">
              Delete Memory
            </button>
          </div>
        </div>
      </div>
    ` : ''}
  </div>
  `;
}

export function attachCaregiverMemoryBridgeEvents() {
  const uploadBtn = document.getElementById('quickUploadNewBtn');
  const drawer = document.getElementById('memoryUploadDrawer');
  const cancelBtn = document.getElementById('cancelUploadBtn');
  const form = document.getElementById('newMemoryForm');
  const editBtns = document.querySelectorAll('.edit-memory-btn');
  const deleteBtns = document.querySelectorAll('.delete-memory-btn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  if (uploadBtn && drawer) {
    uploadBtn.addEventListener('click', () => {
      editingMemoryId = null;
      drawer.classList.toggle('hidden');
    });
  }

  if (cancelBtn && drawer) {
    cancelBtn.addEventListener('click', () => {
      editingMemoryId = null;
      drawer.classList.add('hidden');
      if (form) form.reset();
      refreshView();
    });
  }

  editBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      editingMemoryId = id;
      refreshView();
    });
  });

  deleteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      pendingDeleteId = id;
      refreshView();
    });
  });

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      pendingDeleteId = null;
      refreshView();
    });
  }

  if (confirmDeleteBtn && pendingDeleteId) {
    confirmDeleteBtn.addEventListener('click', () => {
      try {
        store.deleteMemory(pendingDeleteId);
        showToast('Memory was successfully removed from archive.', 'delete');
      } catch (err) {
        showToast(err.message, 'error');
      }
      pendingDeleteId = null;
      refreshView();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('memTitle').value;
      const category = document.getElementById('memCategory').value;
      const year = document.getElementById('memYear')?.value || '';
      const companions = document.getElementById('memCompanions')?.value || '';
      const placeId = document.getElementById('memPlaceId')?.value || null;
      const desc = document.getElementById('memDescription').value;

      try {
        if (editingMemoryId) {
          store.updateMemory(editingMemoryId, {
            title,
            category,
            year,
            companions,
            placeId,
            description: desc
          });
          showToast(`Updated "${title}"!`, 'check_circle');
          editingMemoryId = null;
        } else {
          store.addContributedMemory({
            title,
            category,
            year,
            companions,
            placeId,
            description: desc,
            tags: ['Family Keepsake', 'Caregiver Curation']
          });
          showToast(`Added "${title}" to Living Archive!`, 'check_circle');
        }

        if (drawer) drawer.classList.add('hidden');
        form.reset();
        refreshView();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  function refreshView() {
    const contentEl = document.getElementById('view-content');
    if (contentEl) {
      contentEl.innerHTML = renderCaregiverMemoryBridgeView();
      attachCaregiverMemoryBridgeEvents();
    }
  }
}
