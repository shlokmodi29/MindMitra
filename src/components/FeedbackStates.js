// MindMitra Elder-Friendly Reusable Feedback States
// Respectful, calm, and accessible states for loading, empty, error, and offline conditions

export function renderLoadingState(message = "Gathering your moments with care...") {
  return `
  <div class="w-full py-space-3xl px-space-lg flex flex-col items-center justify-center text-center">
    <div class="relative w-16 h-16 mb-space-md flex items-center justify-center">
      <div class="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
      <span class="material-symbols-outlined text-[26px] text-primary">spa</span>
    </div>
    <p class="font-headline-sm text-headline-sm text-on-surface font-semibold">${message}</p>
    <p class="font-caption text-caption text-on-surface-variant mt-1">Take your time. There is no rush.</p>
  </div>
  `;
}

export function renderEmptyState({
  icon = "spa",
  title = "All Peaceful and Calm",
  description = "There are no items to show right now.",
  actionText = null,
  actionHash = null
} = {}) {
  return `
  <div class="w-full py-space-2xl px-space-lg rounded-2xl bg-surface-container-low border border-surface-container flex flex-col items-center justify-center text-center">
    <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-space-md shadow-sm">
      <span class="material-symbols-outlined text-[32px]">${icon}</span>
    </div>
    <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${title}</h3>
    <p class="font-body-md text-body-md text-on-surface-variant max-w-md mt-space-2xs leading-relaxed">${description}</p>
    ${actionText && actionHash ? `
      <a href="${actionHash}" class="mt-space-lg inline-flex items-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-sm">
        <span>${actionText}</span>
        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
      </a>
    ` : ''}
  </div>
  `;
}

export function renderErrorState({
  icon = "refresh",
  title = "We are right here with you",
  message = "Something took a moment longer than usual. Please try again gently.",
  actionText = "Try Again",
  actionId = "feedbackRetryBtn"
} = {}) {
  return `
  <div class="w-full py-space-2xl px-space-lg rounded-2xl bg-surface-container-low border border-outline/20 flex flex-col items-center justify-center text-center">
    <div class="w-14 h-14 rounded-full bg-error-container text-on-error-container flex items-center justify-center mb-space-md">
      <span class="material-symbols-outlined text-[30px] text-error">info</span>
    </div>
    <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">${title}</h3>
    <p class="font-body-md text-body-md text-on-surface-variant max-w-md mt-space-2xs leading-relaxed">${message}</p>
    <button id="${actionId}" class="mt-space-lg inline-flex items-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors cursor-pointer border border-surface-container">
      <span class="material-symbols-outlined text-[18px]">${icon}</span>
      <span>${actionText}</span>
    </button>
  </div>
  `;
}

export function renderOfflineBanner() {
  return `
  <div class="w-full py-space-xs px-space-md bg-secondary-container/80 text-on-secondary-container border-b border-secondary/20 flex items-center justify-center gap-space-sm text-center">
    <span class="material-symbols-outlined text-[20px] text-secondary">wifi_off</span>
    <span class="font-caption text-caption font-semibold">Offline Sanctuary Mode: All your memories, routines, and emergency contacts are safely available offline.</span>
  </div>
  `;
}
