// Patient Home View - 100% Faithful to Stitch Export with Living Functionality
import { store } from '../state/store.js';
import { voiceService } from '../services/voiceService.js';
import { i18nService } from '../services/i18nService.js';
import { reminderService } from '../services/reminderService.js';
import { showToast } from '../components/Toast.js';
import { renderMoodCheckInCard, attachMoodCheckInEvents } from '../components/MoodCheckInCard.js';

export function renderPatientHomeView() {
  const state = store.getState();
  const profile = state.currentUser || state.profile || state.users[0];
  const patient = profile;
  const firstName = profile ? profile.name.split(' ')[0] : 'Friend';
  const lang = i18nService.getLanguage();

  // Dynamic Time of Day Greeting using i18n
  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? 'home.greetingMorning' : hour < 17 ? 'home.greetingAfternoon' : 'home.greetingEvening';
  const timeOfDayGreeting = i18nService.t(greetingKey);

  const patientId = store.getCurrentPatientId();
  const patientReminders = store.getRemindersForPatient(patientId);
  const completedCount = patientReminders.filter(r => r.completed || r.status === 'completed').length;
  const totalCount = patientReminders.length;
  const nextRoutine = store.getNextPendingReminder(patientId);

  return `
  <main class="w-full pt-20 bg-surface min-h-[calc(100vh-140px)]">
    <div class="max-w-7xl mx-auto px-margin-mobile lg:px-margin-desktop py-space-xl">
      <div class="flex flex-col w-full">
        <!-- Subtle Ambient Glow Element -->
        <div class="relative w-full overflow-hidden">
          <div class="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none"></div>
          <div class="absolute top-40 -right-20 w-80 h-80 rounded-full bg-secondary-fixed/40 blur-3xl pointer-events-none"></div>

          <!-- Header Section with Location & Compassionate Greeting -->
          <section class="relative pt-space-xs pb-space-xl">
            <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
              <div class="space-y-space-xs">
                <!-- Weather / Regional Location Pill -->
                <div class="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md shadow-sm">
                  <span class="material-symbols-outlined text-primary text-[20px]" style="font-variation-settings: 'FILL' 1;">wb_sunny</span>
                  <span class="font-medium text-on-surface">${patient.location || 'Home Sanctuary, Verified'}</span>
                  <span class="text-outline">•</span>
                  <span>${patient.weather || 'Serene morning'}</span>
                </div>
                <h1 class="font-display text-display text-on-surface tracking-tight">
                  ${timeOfDayGreeting}, ${firstName} <span class="inline-block hover:rotate-12 transition-transform duration-300 origin-bottom-right cursor-default">👋</span>
                </h1>
                <p class="font-body-xl text-body-xl text-on-surface-variant max-w-2xl">
                  Take your time. Let's enjoy a calm moment together.
                </p>
              </div>

              <!-- Quick Audio Reading of Today's State -->
              <div class="flex items-center gap-space-sm shrink-0 pt-space-xs lg:pt-0">
                <button class="group flex items-center gap-space-sm px-space-lg py-space-sm rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface transition-all shadow-sm cursor-pointer active:scale-95" id="readOverviewBtn" type="button" aria-label="Listen to schedule">
                  <span class="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-lowest text-primary shadow-sm group-hover:scale-105 transition-transform" id="readIconWrap">
                    <span class="material-symbols-outlined text-[20px]" id="readAudioIcon">volume_up</span>
                  </span>
                  <span class="font-label-lg text-label-lg font-medium" id="readAudioLabel">${i18nService.t('myDay.listenSchedule')}</span>
                </button>
              </div>
            </div>
          </section>

          <!-- Mood Check-in Entry Section -->
          <div class="mood-check-in-section mb-space-xl" id="homeMoodCheckInWrap">
            ${renderMoodCheckInCard(patient?.id || 'user-asha')}
          </div>

          <!-- Voice Journal Entry Section -->
          <section class="voice-journal-entry-section mb-space-xl" id="homeVoiceJournalSection">
            <div class="p-space-lg sm:p-space-xl rounded-3xl bg-surface-container-low border border-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md shadow-sm">
              <div class="flex items-start sm:items-center gap-space-md">
                <div class="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm">
                  <span class="material-symbols-outlined text-[32px]">mic</span>
                </div>
                <div>
                  <div class="flex items-center gap-space-xs">
                    <span class="font-label-md text-label-md font-bold text-primary uppercase tracking-wider">🎙️ Voice Journal</span>
                    <span class="font-caption text-caption text-on-surface-variant">• Private Keepsake</span>
                  </div>
                  <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5">
                    "Tell your story"
                  </h2>
                  <p class="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    Tell me about your day or a memory you'd like to keep.
                  </p>
                </div>
              </div>

              <a href="#/voice-journal" id="homeStartVoiceJournalBtn" class="min-h-[52px] px-space-xl py-space-sm rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center gap-space-xs shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer shrink-0 w-full sm:w-auto justify-center">
                <span class="material-symbols-outlined text-[24px]">mic</span>
                <span>Start Recording</span>
              </a>
            </div>
          </section>

          <!-- Top Focus Card: Hero Action / Today's Next Step -->
          <section class="relative mb-space-3xl" id="todaysNextStepSection">
            <div class="relative overflow-hidden rounded-3xl bg-surface-container-low p-space-lg lg:p-space-2xl shadow-[0_8px_30px_rgba(74,40,64,0.06)]">
              <div class="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 opacity-25 lg:opacity-95 pointer-events-none lg:pointer-events-auto">
                <div class="w-full h-full bg-cover bg-center rounded-3xl" data-alt="Expansive misty rolling green tea plantations in Shillong Meghalaya under gentle morning sunlight, warm terracotta and earthy tones, serene landscape evoking deep nostalgia, cinematic tranquil composition, soft natural glow" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuClDv4_h1kT5eVvkSQga6Rvx_Lq8Djf0RbYSnZ_4bH0pymqnPJI0CUfPH_OFAFRdnb4q5neeF6-KbIdEvRhJ5g_sN16VkrP-D1hSLkhgvsZ4RM30Be8DPJAnRJPztn1eDAULI4iC_C_D2w4wpnH2QXI7Saaq4H5cHwoO0C31v8JgFqDak6oJ0y-WhKYLKUM6Szq4IBQDjT_aZARe-HlDuGRjuWkNlx2ojGX1L99zHGVvZnzma-JNT-l')"></div>
                <div class="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-surface-container-low via-surface-container-low/70 to-transparent"></div>
              </div>

              <div class="relative z-10 max-w-xl flex flex-col items-start space-y-space-md">
                <div class="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md">
                  <span class="material-symbols-outlined text-[18px]">${nextRoutine ? 'alarm' : 'psychology'}</span>
                  <span>NEXT STEP • ${nextRoutine ? (nextRoutine.category || 'Daily Routine') : 'Memory Journey'}</span>
                </div>

                <div>
                  <h2 class="font-headline-lg text-headline-lg text-on-surface">
                    ${nextRoutine ? nextRoutine.title : 'A familiar walk through the tea gardens of Shillong'}
                  </h2>
                  <p class="font-body-lg text-body-lg text-on-surface-variant mt-space-xs">
                    ${nextRoutine ? nextRoutine.description : 'A gentle 5-minute audio-visual exercise reviving songs, early mist fragrances, and peaceful garden strolls with family.'}
                  </p>
                </div>

                <!-- Micro Metas -->
                <div class="flex flex-wrap items-center gap-space-md py-space-2xs text-on-surface-variant font-label-md text-label-md">
                  <span class="flex items-center gap-space-2xs">
                    <span class="material-symbols-outlined text-primary text-[18px]">schedule</span>
                    ${nextRoutine ? nextRoutine.time : '5 Minutes'}
                  </span>
                  <span class="flex items-center gap-space-2xs">
                    <span class="material-symbols-outlined text-tertiary text-[18px]">favorite</span>
                    Comfort Level: Serene
                  </span>
                  <span class="flex items-center gap-space-2xs">
                    <span class="material-symbols-outlined text-secondary text-[18px]">${nextRoutine ? 'done_all' : 'graphic_eq'}</span>
                    ${nextRoutine ? 'Ready to check off' : 'Bilingual Audio'}
                  </span>
                </div>

                <!-- Dual Action Controls with Large accessible surface area -->
                <div class="flex flex-wrap items-center gap-space-sm pt-space-xs w-full sm:w-auto">
                  ${nextRoutine ? `
                    <button id="homeCompleteNextStepBtn" data-id="${nextRoutine.id}" class="w-full sm:w-auto min-h-[56px] px-space-xl py-space-sm rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg shadow-md hover:shadow-lg flex items-center justify-center gap-space-sm transition-all cursor-pointer active:scale-95" type="button">
                      <span class="material-symbols-outlined text-[24px]">check_circle</span>
                      <span>Mark Milestone Complete</span>
                    </button>
                    <button id="homeHearNextStepBtn" data-id="${nextRoutine.id}" class="w-full sm:w-auto min-h-[56px] px-space-lg py-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-space-xs transition-colors cursor-pointer active:scale-95 border border-surface-container" type="button">
                      <span class="material-symbols-outlined text-[22px] text-primary">volume_up</span>
                      <span>Hear Reminder</span>
                    </button>
                    <a href="#/my-day" id="homeViewMyDayBtn" class="w-full sm:w-auto min-h-[56px] px-space-lg py-space-sm rounded-xl bg-surface-container-lowest text-primary hover:bg-surface-container-high font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-sm transition-all cursor-pointer active:scale-95">
                      <span class="material-symbols-outlined text-[22px]">calendar_today</span>
                      <span>View Full Schedule</span>
                    </a>
                  ` : `
                    <button id="startJourneyBtn" class="w-full sm:w-auto min-h-[56px] px-space-xl py-space-sm rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg shadow-md hover:shadow-lg flex items-center justify-center gap-space-sm transition-all cursor-pointer active:scale-95" type="button">
                      <span class="material-symbols-outlined text-[24px]">play_arrow</span>
                      <span>Start Experience</span>
                    </button>
                    <button id="audioOnlyBtn" aria-label="Listen preview" class="w-full sm:w-auto min-h-[56px] px-space-lg py-space-sm rounded-xl bg-surface-container-lowest text-primary hover:bg-surface-container-high font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-sm transition-all cursor-pointer active:scale-95" type="button">
                      <span class="material-symbols-outlined text-[22px]">headphones</span>
                      <span>Audio Only</span>
                    </button>
                  `}
                </div>
              </div>
            </div>
          </section>

          <!-- Audio Wave Player (Hidden until activated) -->
          <div id="homeAudioPlayerBanner" class="hidden rounded-2xl p-space-md bg-secondary text-on-secondary mb-space-2xl flex items-center justify-between shadow-lg">
            <div class="flex items-center gap-space-sm">
              <span class="material-symbols-outlined text-[28px] text-secondary-fixed animate-pulse">graphic_eq</span>
              <div>
                <span class="font-label-lg text-label-lg text-on-secondary block font-bold" id="homeAudioTitle">Playing: Morning Shillong Walk</span>
                <span class="font-caption text-caption text-secondary-fixed-dim">Gentle audio guidance with binaural birdsong</span>
              </div>
            </div>
            <button id="stopHomeAudioBtn" class="px-space-md py-space-xs rounded-xl bg-on-secondary/20 hover:bg-on-secondary/30 text-on-secondary font-label-md text-label-md flex items-center gap-1 cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">stop</span>
              <span>Stop</span>
            </button>
          </div>

          <!-- Main Content Layout Grid: Day at a Glance & SmritiAI Companion -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-xl mb-space-3xl items-start">
            <!-- Day at a Glance (7 cols) -->
            <section class="lg:col-span-7 space-y-space-lg" id="dayRhythmSection">
              <div class="flex items-center justify-between">
                <div class="space-y-space-2xs">
                  <span class="font-caption text-caption text-primary uppercase tracking-wider font-semibold">Today's Rhythm</span>
                  <h2 class="font-headline-md text-headline-md text-on-surface">Your Day at a Glance</h2>
                </div>
                <div class="text-right">
                  <span class="font-label-md text-label-md text-on-surface-variant">Wednesday, 24 October</span>
                </div>
              </div>

              <div class="space-y-space-sm">
                ${state.routines.map(item => `
                  <div class="routine-item flex items-center gap-space-md p-space-md rounded-2xl ${item.completed ? 'bg-surface-container-lowest' : 'bg-surface-container-low shadow-[0_4px_16px_rgba(159,60,22,0.06)]'} shadow-sm hover:shadow-md transition-all cursor-pointer group" data-id="${item.id}">
                    <button class="routine-toggle-btn flex items-center justify-center w-12 h-12 rounded-xl ${item.completed ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container-high text-on-surface-variant group-hover:bg-primary-fixed group-hover:text-on-primary-fixed'} shrink-0 transition-colors" aria-label="Toggle ${item.title}">
                      <span class="material-symbols-outlined text-[24px]" style="${item.completed ? "font-variation-settings: 'FILL' 1;" : ''}">
                        ${item.completed ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </button>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-space-xs flex-wrap">
                        <h3 class="font-headline-sm text-headline-sm ${item.completed ? 'text-on-surface line-through opacity-75' : 'text-on-surface font-semibold'} truncate">
                          ${item.title}
                        </h3>
                        <span class="inline-flex items-center px-space-xs py-0.5 rounded-full ${item.completed ? 'bg-tertiary-fixed/60 text-on-tertiary-fixed' : 'bg-primary-fixed-dim/40 text-on-primary-fixed-variant font-semibold'} font-caption text-caption">
                          ${item.completed ? 'Completed' : (item.statusBadge || 'Due Soon')}
                        </span>
                      </div>
                      <p class="font-body-md text-body-md text-on-surface-variant truncate mt-0.5">
                        ${item.description}
                      </p>
                    </div>
                    <span class="font-label-md text-label-md ${item.completed ? 'text-outline' : 'text-primary font-bold'} shrink-0">
                      ${item.time}
                    </span>
                  </div>
                `).join('')}
              </div>

              <!-- Supportive Micro-Prompt Note -->
              <div class="p-space-md rounded-2xl bg-surface-container-high/60 flex items-start gap-space-sm">
                <span class="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">spa</span>
                <p class="font-body-md text-body-md text-on-surface-variant">
                  There is no hurry today. You have completed ${completedCount} out of ${totalCount} scheduled wellness milestones. Your care circle has been gently notified.
                </p>
              </div>
            </section>

            <!-- SmritiAI Contextual Companion Card (5 cols) -->
            <section class="lg:col-span-5 flex flex-col h-full">
              <div class="rounded-3xl bg-secondary p-space-lg lg:p-space-xl text-on-secondary shadow-lg flex flex-col justify-between relative overflow-hidden h-full">
                <!-- Ambient decorative subtle circle -->
                <div class="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-on-secondary/5 blur-2xl pointer-events-none"></div>
                <div>
                  <!-- Voice active pulse indicator -->
                  <div class="flex items-center justify-between mb-space-md">
                    <div class="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-on-secondary/15 text-on-secondary font-label-md text-label-md backdrop-blur-sm">
                      <span class="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
                      <span>SmritiAI Companion Active</span>
                    </div>
                    <span class="material-symbols-outlined text-on-secondary/70 text-[22px]">hearing</span>
                  </div>

                  <!-- Conversational Title -->
                  <h2 class="font-headline-lg text-headline-lg text-on-secondary mb-space-xs">
                    How can I help you today, ${firstName}?
                  </h2>
                  <p class="font-body-md text-body-md text-on-secondary/80 leading-relaxed">
                    I am right here with you. Ask me about your family memories, hear a story, or verify what comes next in your peaceful day.
                  </p>

                  <!-- Suggestion Prompt Pills -->
                  <div class="mt-space-lg space-y-space-xs">
                    <span class="font-caption text-caption text-on-secondary/60 uppercase tracking-wider block mb-space-2xs">Quick Prompts</span>
                    <button class="home-quick-prompt w-full text-left px-space-md py-space-sm rounded-xl bg-on-secondary/10 hover:bg-on-secondary/20 font-label-lg text-label-lg text-on-secondary transition-all flex items-center justify-between group cursor-pointer" data-text="schedule" type="button">
                      <span>“What's next on my day?”</span>
                      <span class="material-symbols-outlined text-[18px] opacity-70 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    <button class="home-quick-prompt w-full text-left px-space-md py-space-sm rounded-xl bg-on-secondary/10 hover:bg-on-secondary/20 font-label-lg text-label-lg text-on-secondary transition-all flex items-center justify-between group cursor-pointer" data-text="meera" type="button">
                      <span>“Tell me about Meera”</span>
                      <span class="material-symbols-outlined text-[18px] opacity-70 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    <button class="home-quick-prompt w-full text-left px-space-md py-space-sm rounded-xl bg-on-secondary/10 hover:bg-on-secondary/20 font-label-lg text-label-lg text-on-secondary transition-all flex items-center justify-between group cursor-pointer" data-text="story" type="button">
                      <span>“Listen to a quiet story”</span>
                      <span class="material-symbols-outlined text-[18px] opacity-70 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                  </div>
                </div>

                <!-- Big Accessible Voice Command Orb Button -->
                <div class="pt-space-xl mt-space-md">
                  <button class="w-full min-h-[64px] px-space-lg py-space-md rounded-2xl bg-surface-container-lowest text-secondary hover:bg-surface-bright font-headline-sm text-headline-sm flex items-center justify-center gap-space-sm shadow-md transition-all active:scale-[0.98] cursor-pointer" id="smritiVoiceTrigger" type="button" aria-label="Talk to SmritiAI">
                    <span class="material-symbols-outlined text-[30px] text-primary">mic</span>
                    <span>${i18nService.t('home.talkToSmriti')}</span>
                  </button>
                  <p class="text-center font-caption text-caption text-on-secondary/80 mt-space-xs">
                    ${i18nService.t('home.talkToSmritiDesc')}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <!-- Section: A Memory For Today (Rich Editorial Storytelling Card) -->
          <section class="space-y-space-md mb-space-3xl">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-space-2xs">
              <div>
                <span class="font-caption text-caption text-primary uppercase tracking-wider font-semibold">Living Heirloom</span>
                <h2 class="font-headline-lg text-headline-lg text-on-surface">A Memory for Today</h2>
              </div>
              <a href="#/memory-world" class="font-label-lg text-label-lg text-primary hover:text-primary-container inline-flex items-center gap-space-2xs transition-colors">
                <span>View all heirloom memories</span>
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
            </div>

            <!-- Large Asymmetric Editorial Card -->
            <article class="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-[0_8px_32px_rgba(74,40,64,0.05)] grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <!-- Photographic Visual (7 cols) -->
              <div class="relative lg:col-span-7 min-h-[340px] lg:min-h-[440px]">
                <div class="w-full h-full bg-cover bg-center" data-alt="Warm golden hour photograph of mother Asha and daughter Meera standing peacefully by serene Umiam Lake Shillong, water reflecting copper sunset hues, tall pine trees framing the horizon, soft nostalgic kodachrome tone, emotional family memory snapshot" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDGuHcmF5BkQMk-RB20BsWMkAfiaSWVApXU_jCVHUbxnO4XlzbzNNJTxCxWN0Ho9mfPYMs8LE-6unWjvdCMBCDhXzrS-K7A8DLMlrsEOYNDO1v9BX6qicZvvZjCZNfN4ZER3BLnoMO5Y4n_UJIYfmWqh62SKMaNKnQXebZ-UpvSlC365I3Z5esTTMFelJ_q2BaiU-31b3xN0SehMEzDn3QV-6_FECV5eRcGwy2iINXZTjryDBIVqzZI')"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <!-- Image Tag Stamp -->
                <div class="absolute bottom-space-md left-space-md right-space-md text-white flex items-end justify-between">
                  <div>
                    <span class="font-label-md text-label-md bg-black/40 backdrop-blur-md px-space-sm py-1 rounded-full text-white/90">Shillong, Meghalaya</span>
                    <p class="font-headline-sm text-headline-sm text-white mt-space-2xs drop-shadow-sm">October 14, 2018</p>
                  </div>
                  <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <span class="material-symbols-outlined text-[20px]">photo_camera</span>
                  </div>
                </div>
              </div>

              <!-- Narrative Editorial Caption & Interactive Options (5 cols) -->
              <div class="lg:col-span-5 p-space-lg lg:p-space-xl flex flex-col justify-between bg-surface-container-lowest">
                <div class="space-y-space-md">
                  <div class="flex items-center justify-between">
                    <span class="font-label-md text-label-md text-secondary font-semibold">With Daughter Meera</span>
                    <span class="flex items-center gap-1 font-caption text-caption text-outline">
                      <span class="material-symbols-outlined text-[16px] text-tertiary">lock</span>
                      Family Vault
                    </span>
                  </div>
                  <h3 class="font-headline-md text-headline-md text-on-surface">
                    Sunset over Umiam Lake, October 2018
                  </h3>
                  <!-- Heartfelt quote/caption -->
                  <blockquote class="font-body-lg text-body-lg text-on-surface-variant italic leading-relaxed border-l-0 pl-0">
                    “The pine scent was strong and the water was like glass. You remembered the song Baba used to hum whenever autumn arrived.”
                  </blockquote>
                  <!-- Memory Anchor Tags -->
                  <div class="flex flex-wrap gap-space-2xs pt-space-2xs">
                    <span class="px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">Baba's Song</span>
                    <span class="px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">Meera</span>
                    <span class="px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">Autumn Pine</span>
                  </div>
                </div>

                <!-- Action Cluster -->
                <div class="pt-space-xl space-y-space-sm">
                  <button id="narrateMeeraBtn" class="w-full min-h-[52px] px-space-md py-space-sm rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg flex items-center justify-center gap-space-sm shadow-sm transition-all cursor-pointer" type="button">
                    <span class="material-symbols-outlined text-[22px]">record_voice_over</span>
                    <span id="narrateMeeraLabel">Listen to Meera's Narration</span>
                  </button>
                  <div class="grid grid-cols-2 gap-space-sm">
                    <a href="https://lh3.googleusercontent.com/aida-public/AB6AXuDGuHcmF5BkQMk-RB20BsWMkAfiaSWVApXU_jCVHUbxnO4XlzbzNNJTxCxWN0Ho9mfPYMs8LE-6unWjvdCMBCDhXzrS-K7A8DLMlrsEOYNDO1v9BX6qicZvvZjCZNfN4ZER3BLnoMO5Y4n_UJIYfmWqh62SKMaNKnQXebZ-UpvSlC365I3Z5esTTMFelJ_q2BaiU-31b3xN0SehMEzDn3QV-6_FECV5eRcGwy2iINXZTjryDBIVqzZI" target="_blank" rel="noopener noreferrer" class="min-h-[48px] px-space-sm py-space-xs rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md flex items-center justify-center gap-space-2xs transition-colors">
                      <span class="material-symbols-outlined text-[18px]">zoom_in</span>
                      <span>View Photo</span>
                    </a>
                    <a href="#/memory-world" class="min-h-[48px] px-space-sm py-space-xs rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md flex items-center justify-center gap-space-2xs transition-colors">
                      <span class="material-symbols-outlined text-[18px]">auto_stories</span>
                      <span>Related Memories</span>
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <!-- Emergency Help Access Card -->
          <section class="mb-space-xl">
            <div class="p-space-lg rounded-2xl bg-surface-container-lowest border border-error/20 flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-sm">
              <div class="flex items-center gap-space-md text-left">
                <div class="w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[26px]">emergency</span>
                </div>
                <div>
                  <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Emergency &amp; Safety Help</h3>
                  <p class="font-body-md text-body-md text-on-surface-variant">Immediate connection to India 112 and your primary caregiver.</p>
                </div>
              </div>
              <a href="#/emergency-sos" class="shrink-0 min-h-[48px] px-space-lg flex items-center justify-center gap-space-xs rounded-xl bg-error hover:bg-error/90 text-on-error font-label-lg text-label-lg transition-all shadow-sm cursor-pointer" aria-label="Open Emergency Help">
                <span class="material-symbols-outlined text-[20px]">phone_in_talk</span>
                <span>Open Emergency Help</span>
              </a>
            </div>
          </section>

          <!-- Cognitive Calmness & Elder Dignity Safeguard Footer Banner -->
          <div class="p-space-lg rounded-2xl bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-space-md text-center md:text-left">
            <div class="flex items-center gap-space-md">
              <div class="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shrink-0">
                <span class="material-symbols-outlined text-[22px]">shield</span>
              </div>
              <div>
                <p class="font-label-lg text-label-lg text-on-surface font-semibold">MindMitra Safe Haven</p>
                <p class="font-body-md text-body-md text-on-surface-variant">
                  MindMitra is your personal memory companion. Non-diagnostic cognitive wellness platform crafted for peace of mind.
                </p>
              </div>
            </div>
            <a href="#/privacy" class="shrink-0 px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors">
              Learn about memory care
            </a>
          </div>
        </div>
      </div>
    </div>
  </main>
  `;
}

export function attachPatientHomeEvents() {
  const readBtn = document.getElementById('readOverviewBtn');
  const readIcon = document.getElementById('readAudioIcon');
  const readLabel = document.getElementById('readAudioLabel');
  const voiceTrigger = document.getElementById('smritiVoiceTrigger');
  const startJourneyBtn = document.getElementById('startJourneyBtn');
  const audioOnlyBtn = document.getElementById('audioOnlyBtn');
  const narrateMeeraBtn = document.getElementById('narrateMeeraBtn');
  const narrateLabel = document.getElementById('narrateMeeraLabel');
  const homeAudioBanner = document.getElementById('homeAudioPlayerBanner');
  const stopHomeAudioBtn = document.getElementById('stopHomeAudioBtn');
  const routineItems = document.querySelectorAll('.routine-item');

  // Routine checkmark toggling
  routineItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const routineId = item.getAttribute('data-id');
      store.toggleRoutine(routineId);
      const state = store.getState();
      const routine = state.routines.find(r => r.id === routineId);
      if (routine) {
        showToast(
          routine.completed ? `Checked off: ${routine.title}` : `Marked pending: ${routine.title}`,
          routine.completed ? 'check_circle' : 'pending'
        );
      }
    });
  });

  // Listen to my day TTS (Elderly-friendly 0.88x speed with interruptible Stop)
  if (readBtn) {
    readBtn.addEventListener('click', function() {
      if (voiceService.isSpeaking()) {
        voiceService.stop();
        if (readLabel) readLabel.textContent = i18nService.t('myDay.listenSchedule');
        if (readIcon) readIcon.textContent = 'volume_up';
        readBtn.classList.remove('bg-primary-fixed');
        showToast('Spoken reading stopped', 'stop');
        return;
      }

      const state = store.getState();
      const patientId = store.getCurrentPatientId();
      const patientReminders = store.getRemindersForPatient(patientId);
      const profile = state.currentUser || state.profile || state.users[0];
      const firstName = profile ? profile.name.split(' ')[0] : 'Friend';
      const lang = i18nService.getLanguage();

      const overviewText = voiceService.generateDayOverviewText(patientReminders, firstName, lang);
      if (readLabel) readLabel.textContent = i18nService.t('common.stop');
      if (readIcon) readIcon.textContent = 'stop_circle';
      readBtn.classList.add('bg-primary-fixed');

      voiceService.speak(overviewText, {
        lang,
        onEnd: () => {
          if (readLabel) readLabel.textContent = i18nService.t('myDay.listenSchedule');
          if (readIcon) readIcon.textContent = 'volume_up';
          readBtn.classList.remove('bg-primary-fixed');
        },
        onError: () => {
          if (readLabel) readLabel.textContent = i18nService.t('myDay.listenSchedule');
          if (readIcon) readIcon.textContent = 'volume_up';
          readBtn.classList.remove('bg-primary-fixed');
        }
      });
    });
  }

  // Smriti Voice Trigger
  if (voiceTrigger) {
    voiceTrigger.addEventListener('click', function() {
      store.setVoiceModalOpen(true);
    });
  }

  // Quick prompt buttons
  const quickPrompts = document.querySelectorAll('.home-quick-prompt');
  quickPrompts.forEach(btn => {
    btn.addEventListener('click', () => {
      store.setVoiceModalOpen(true);
    });
  });

  // Next Step Complete Button
  const completeNextStepBtn = document.getElementById('homeCompleteNextStepBtn');
  if (completeNextStepBtn) {
    completeNextStepBtn.addEventListener('click', () => {
      const routineId = completeNextStepBtn.getAttribute('data-id');
      if (routineId) {
        store.markReminderDone(routineId);
        showToast('Milestone completed! Wonderful step forward.', 'check_circle');
      }
    });
  }

  // Next Step Hear Reminder Button
  const hearNextStepBtn = document.getElementById('homeHearNextStepBtn');
  if (hearNextStepBtn) {
    hearNextStepBtn.addEventListener('click', () => {
      const routineId = hearNextStepBtn.getAttribute('data-id');
      const state = store.getState();
      const patient = state.currentUser || state.profile || state.users[0];
      const r = state.routines.find(x => x.id === routineId);
      if (r) {
        reminderService.hearReminder(r, patient?.name || 'Asha');
        showToast(`Reading aloud: ${r.title}`, 'volume_up');
      }
    });
  }

  // Memory Journey Start
  if (startJourneyBtn) {
    startJourneyBtn.addEventListener('click', () => {
      window.location.hash = '#/activities';
    });
  }

  // Audio Only
  if (audioOnlyBtn) {
    audioOnlyBtn.addEventListener('click', () => {
      if (homeAudioBanner) homeAudioBanner.classList.remove('hidden');
      const text = "A gentle morning walk through the tea gardens of Shillong. Take a deep breath of fresh mountain air. In the distance, songs of the Khasi hills echo peacefully.";
      voiceService.speak(text);
      showToast('Playing tea garden audio journey', 'headphones');
    });
  }

  if (stopHomeAudioBtn) {
    stopHomeAudioBtn.addEventListener('click', () => {
      voiceService.stop();
      if (homeAudioBanner) homeAudioBanner.classList.add('hidden');
    });
  }

  // Meera's Narration
  if (narrateMeeraBtn) {
    narrateMeeraBtn.addEventListener('click', () => {
      const text = "Sunset over Umiam Lake, October 2018. The pine scent was strong and the water was like glass. You remembered the song Baba used to hum whenever autumn arrived.";
      if (narrateLabel) narrateLabel.textContent = 'Playing Meera’s Voice...';
      voiceService.speak(text, {
        onEnd: () => {
          if (narrateLabel) narrateLabel.textContent = "Listen to Meera's Narration";
        }
      });
    });
  }

  // Attach Mood Check-In Widget Events
  const moodWrap = document.getElementById('homeMoodCheckInWrap');
  if (moodWrap) {
    attachMoodCheckInEvents(moodWrap, () => {
      const w = document.getElementById('homeMoodCheckInWrap');
      if (w) {
        w.innerHTML = renderMoodCheckInCard(patient?.id || 'user-asha');
        attachMoodCheckInEvents(w);
      }
    });
  }
}
