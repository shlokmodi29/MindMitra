// MindMitra Universal Toast Notification Component
let toastTimeout = null;

export function showToast(message, icon = 'check_circle') {
  if (typeof document === 'undefined' || !document.createElement || !document.body) return;
  let toastEl = document.getElementById('mindmitra-toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'mindmitra-toast';
    toastEl.className = 'fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-space-lg py-space-sm rounded-xl shadow-2xl flex items-center gap-space-sm transition-all duration-300 transform translate-y-24 opacity-0 pointer-events-none z-50 border border-outline/20';
    document.body.appendChild(toastEl);
  }

  toastEl.innerHTML = `
    <span class="material-symbols-outlined text-tertiary-fixed text-[22px]">${icon}</span>
    <span class="font-body-md text-body-md font-medium">${message}</span>
  `;

  clearTimeout(toastTimeout);
  toastEl.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
  toastEl.classList.add('translate-y-0', 'opacity-100');

  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('translate-y-0', 'opacity-100');
    toastEl.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
  }, 3500);
}
