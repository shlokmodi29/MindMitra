# MindMitra Security, Privacy & Data Protection Architecture

MindMitra is a supportive cognitive companion and living memory archive designed for elderly individuals and their authorized family caregivers. Because the platform manages deeply personal memories, family photographs, routine schedules, voice recordings, and emergency contacts, security, patient isolation, and data privacy are foundational.

---

## 1. Security Architecture Overview

```
                      +--------------------------------------------------+
                      |         MindMitra Client Application             |
                      +--------------------------------------------------+
                                        |
     +-------------------+--------------+--------------+-------------------+
     |                   |                             |                   |
     v                   v                             v                   v
[Client Router]   [SecurityService]              [State Store]      [StorageService]
 - Route Guards   - XSS Sanitizer                 - Scoped State     - Patient Scoped
 - RBAC Enforcer  - CSV DDE Neutralizer           - RBAC Verified      Namespaces
 - Role Redirection- Prompt Injection Filter      - Auth Context     - Quota Safe
                  - Context Minimizer             - Memory Guard     - Isolated Keys
                  - Upload Validator
                  - Safe Redacting Logger
                         |
                         v
              [SmritiAI / Voice Engine]
               - Context Minimized
               - Untrusted Context as DATA
               - Non-Diagnostic Boundary
               - Emergency SOS Handoff
```

---

## 2. Authentication & Session Model

- **Identity Types**: Distinct, mutually exclusive roles: `PATIENT` and `CAREGIVER`.
- **Session Tokens**: Simulated client session tokens (`mm_token_<random>_<timestamp>`). Stored in `localStorage` under `mindmitra_auth_session_v1`.
- **Credential Protection**:
  - Passwords and PINs are strictly stripped from session objects and never returned by `authService.getCurrentUser()`.
  - Plaintext passwords are not logged.
  - On `logout()`, session data is purged, transient store context is reset, and any active browser speech synthesis is aborted.

---

## 3. Role-Based Access Control (RBAC) & Patient Isolation

### Access Control Matrix

| Resource / Action | Patient (Self) | Authorized Caregiver | Unauthorized Caregiver | Unauthenticated |
| :--- | :---: | :---: | :---: | :---: |
| **Patient Home / My Day** | Allowed | Allowed (Preview Mode) | Denied | Denied |
| **Caregiver Dashboard** | Denied | Allowed | Denied | Denied |
| **View Personal Memories** | Allowed (Own only) | Allowed (Authorized only)| Denied | Denied |
| **Delete / Edit Memory** | Allowed (Own only) | Allowed (Authorized only)| Denied | Denied |
| **Generate Caregiver Report** | Denied | Allowed (Authorized only)| Denied | Denied |
| **Manage Emergency Contacts** | Denied | Allowed (Authorized only)| Denied | Denied |
| **Trigger 112 SOS Call** | Allowed (Direct) | Allowed (Direct) | Denied | Allowed (Telephony) |
| **Enqueue Sync Operation** | Allowed (Own only) | Allowed (Authorized only)| Denied | Denied |

### Patient Isolation Enforcements
1. **Memory World**: `memoryService.getMemoriesForPatient(patientId)` and `store.getMemoriesByCategory(category, patientId)` filter strictly by normalized patient ID.
2. **Local Storage**: Storage keys are prefixed with patient namespaces: `mindmitra_p_<safe_patient_id>_<key>`. Patient A's local persistence cannot read or write to Patient B's keys.
3. **Caregiver Scoping**: `store.getAuthorizedPatientsForCaregiver(caregiverId)` enforces explicit authorization relationships. Unassigned caregivers default to an empty authorized set (`[]`).
4. **Data Operations**: `store.setSelectedMemoryDetail`, `store.deleteMemory`, and `offlineSyncService.enqueue` verify that the caller is the patient owner or an authorized caregiver before proceeding.

---

## 4. SmritiAI Privacy, Safety & Prompt Injection Defense

1. **Context Minimization**:
   - The platform never sends full memory graphs, caregiver private logs, or entire contact rosters to remote AI endpoints.
   - `securityService.minimizeAIContext(query, fullContext)` retrieves only the minimal relevant routine, memory, or activity entity matching the user's immediate question.
2. **Treating Content as Inert Data**:
   - Memory descriptions, user queries, and family stories are tagged and isolated as passive data, preventing external text from overriding system boundaries.
3. **Prompt Injection Defense**:
   - `securityService.sanitizePromptContext()` identifies and neutralizes adversarial patterns such as `"ignore previous instructions"`, `"override safety guidelines"`, `"act as a medical doctor"`, and pseudo-system tags (`<system>`, `[SYSTEM]`).
4. **Clinical Boundaries**:
   - SmritiAI strictly enforces non-diagnostic companion rules. Inquiries about "dementia tests", "dosage changes", or "medical diagnosis" trigger respectful clinical disclaimer handoffs directing the user to a physician or primary caregiver.
5. **Emergency SOS Integration**:
   - Life-critical words ("fell", "severe pain", "sos", "cannot breathe", "help") trigger the Emergency SOS modal handoff with explicit user confirmation. AI never fabricates or silently dials emergency numbers.

---

## 5. Voice & Speech Privacy

- **On-Device Synthesis**: Relies on device-native Web Speech API (`window.speechSynthesis`) rather than sending text to external speech providers.
- **Audio Storage Minimization**: Raw audio recordings are stored only as temporary local Blobs when a voice memory is explicitly created by the user/caregiver.
- **Transcript Sanitization**: Voice transcripts undergo HTML escaping and prompt injection filtering before storage or rendering.

---

## 6. Report & Export Security

- **Caregiver Authorization Check**: `reportService.generateCaregiverReport()` requires the requester to be an authorized caregiver for the target patient.
- **CSV Formula Injection (DDE) Defense**: `reportService.exportReportCSV()` passes all cell values through `securityService.sanitizeCsvValue()`. Values beginning with `=`, `+`, `-`, `@`, `\t`, or `\r` are prefixed with a single quote to prevent spreadsheet software from executing arbitrary formulas or external commands.
- **Safe Filename Generation**: Filenames avoid sensitive personal details, utilizing structured safe formats (e.g., `mindmitra-care-report-user-asha-2026-09-07.csv`).
- **Temporary Blob URLs**: Download URLs created via `URL.createObjectURL` are immediately revoked via `URL.revokeObjectURL` upon download.

---

## 7. Service Worker & Offline Cache Security

- **Shell Cache Only**: `sw.js` limits `mindmitra-shell-v1` to core static application assets (HTML, JS, CSS, token stylesheets, icons).
- **Sensitive Endpoint Exclusion**: Dynamic endpoints containing `/api/`, `auth`, `token`, `session`, `emergency`, `reports`, or URLs with authentication query parameters are strictly excluded from the Service Worker cache.

---

## 8. 14-Point Practical Threat Model

| # | Threat | Inherent Risk | Existing Protection | Part 14 Mitigation | Remaining Production Limitation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Unauthorized patient access | High | Route guards | Route guards verify role and redirect patient to `#patient-home`. | In client-only SPA, HTML bundle is delivered; production requires backend session tokens. |
| **2** | Unauthorized caregiver access | High | Role checking | Caregiver scoping strictly denies access to non-authorized patient IDs. | Backend database must enforce row-level security (RLS). |
| **3** | Cross-patient data leakage | High | Patient ID attributes | Storage keys are partitioned with `p_<patientId>_`; store queries filter by current patient. | Shared physical browser profiles share one localStorage space. |
| **4** | Stolen/expired session | Medium | Basic session persistence | `logout()` clears session and transient context; password is not stored in session. | Client-side tokens cannot be remotely invalidated without server token revocation list. |
| **5** | Malicious local storage modification | Medium | Structured JSON validation | JSON parsing error handling and quota exception handling in `StorageService`. | Client can edit DevTools localStorage; database RLS needed in production. |
| **6** | Cross-Site Scripting (XSS) | High | TextContent rendering | `securityService.sanitizeHtml()` escapes `<, >, &, ", ', /` across user-provided content. | Client templates should continue avoiding `innerHTML` with untrusted data. |
| **7** | Prompt Injection / Jailbreaks | Medium | Rule-based AI provider | `securityService.sanitizePromptContext()` strips injection keywords and fake system tags. | LLMs require server-side system prompts and structured output parsing. |
| **8** | Unsafe file uploads | Medium | Basic file input | `securityService.validateUpload()` restricts MIME types, extensions, size (<10MB), and sanitizes filenames. | Antivirus / malware scanning requires server-side processing. |
| **9** | Private data leakage through logs | Low | Console warnings | `securityLogger` redacts passwords, tokens, pins, and PII from console output. | Browser extensions can still inspect memory state. |
| **10**| Private data leakage in AI requests| Medium | Direct provider dispatch| `securityService.minimizeAIContext()` trims data to query-relevant minimal fields. | Production requires secure server proxy to hold API keys. |
| **11**| Sync queue manipulation | Medium | Queue persistence | `offlineSyncService.enqueue()` validates that user is authorized for the target patient. | Server must validate HMAC or JWT signature on sync payloads. |
| **12**| Unauthorized report access | High | Caregiver Portal view | `reportService.generateCaregiverReport()` verifies caregiver authorization; CSV sanitized against DDE. | Static CSV files downloaded to local disk are subject to OS file permissions. |
| **13**| Cache leakage | Medium | Service Worker cache | `sw.js` filters out `/api/`, `auth`, `token`, `session`, `emergency`, and `reports`. | Browser HTTP cache must honor `Cache-Control: no-store` on private responses. |
| **14**| Emergency contact/location exposure | High | Caregiver-only editing | Contacts protected; location accessed on-demand only during SOS without continuous tracking. | Telephony fallback (112) is OS-managed. |

---

## 9. Frontend-Only Limitations & Production Requirements

### Implemented Client Protections (Current Architecture)
- Route guards and client-side role enforcement.
- Strict patient-scoped localStorage namespacing.
- Client-side XSS escaping and CSV formula injection neutralization.
- AI context minimization and prompt injection filtering.
- Stripping passwords and PINs from active session states and logs.
- Safe file type and size verification for media keepsakes.

### Production Backend Requirements (Future Migration)
1. **Server-Side Authentication**: Replace simulated tokens with HTTP-only, Secure, SameSite cookies or signed JWTs verified via cryptographic keys (e.g., Supabase Auth / OAuth 2.0).
2. **Database Row-Level Security (RLS)**: Enforce database-level policies ensuring `auth.uid() = patient_id` or caregiver delegation tables.
3. **Secure API Proxy**: Keep SmritiAI and cloud provider API keys in backend environment variables; client communicates strictly with the backend proxy.
4. **Content Security Policy (CSP)**: Deploy server headers (`Content-Security-Policy: default-src 'self'; ...`, `X-Frame-Options: DENY`, `Strict-Transport-Security: max-age=63072000`).
5. **Server-Side File Scanning**: Uploads should be processed through a backend virus/malware scanner before storage in an S3/GCS bucket with signed URLs.
