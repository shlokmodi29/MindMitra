// Comprehensive Validation Script for MindMitra Modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const filesToValidate = [
  'src/app.js',
  'src/router.js',
  'src/state/database.js',
  'src/state/store.js',
  'src/services/speechService.js',
  'src/services/activityEngine.js',
  'src/services/activityRegistry.js',
  'src/services/smritiCompanion.js',
  'src/services/emergencyService.js',
  'src/services/offlineSyncService.js',
  'src/services/reminderService.js',
  'src/services/memoryService.js',
  'src/components/Header.js',
  'src/components/Footer.js',
  'src/components/ActivityShell.js',
  'src/components/SmritiVoiceModal.js',
  'src/components/AuthModal.js',
  'src/components/NotificationsModal.js',
  'src/components/EditProfileModal.js',
  'src/components/ReminderDetailModal.js',
  'src/components/NotificationPermissionModal.js',
  'src/components/MemoryDetailModal.js',
  'src/components/EntityDetailModal.js',
  'src/components/FeedbackStates.js',
  'src/components/ScheduleEditorModal.js',
  'src/components/MemoryGraphView.js',
  'src/services/authService.js',
  'src/views/LoginView.js',
  'src/views/SignupView.js',
  'src/views/PatientHomeView.js',
  'src/views/MyDayView.js',
  'src/views/MemoryWorldView.js',
  'src/views/ActivitiesHubView.js',
  'src/views/EmergencySosView.js',
  'src/views/CaregiverDashboardView.js',
  'src/views/CaregiverMemoryBridgeView.js',
  'src/views/CaregiverReportsView.js',
  'src/views/FamilyCircleView.js',
  'src/views/PatientProfileView.js',
  'src/services/smritiAIService.js',
  'src/views/SmritiAIView.js',
  'src/services/adaptiveConfig.js',
  'src/services/adaptiveEngine.js',
  'src/locales/en.js',
  'src/locales/hi.js',
  'src/locales/as.js',
  'src/locales/bn.js',
  'src/services/i18nService.js',
  'src/services/voiceService.js',
  'src/services/voiceJournalService.js',
  'src/views/VoiceJournalView.js'
];

let hasErrors = false;

console.log('--- Validating MindMitra Source Modules ---');
for (const relPath of filesToValidate) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Missing file: ${relPath}`);
    hasErrors = true;
    continue;
  }
  const code = fs.readFileSync(fullPath, 'utf-8');
  if (code.length < 50) {
    console.error(`⚠️ File suspiciously small: ${relPath}`);
    hasErrors = true;
  } else {
    console.log(`✅ Validated: ${relPath} (${code.length} bytes)`);
  }
}

if (hasErrors) {
  console.error('\nValidation failed with errors.');
  process.exit(1);
} else {
  console.log(`\nAll ${filesToValidate.length} modules present and non-empty!`);
}
