# Implementation status — personal library slice

This change replaces sample records in Today, Library and Book Detail with an initially empty on-device library. Add books manually, paste a Goodreads CSV with preview and repeat-import protection, save attributed passages and separate notes, set basic book status, favorite passages, and revisit a daily rotating passage. Original quote feed and existing public backends remain separate. No real user reading data is committed.

Storage: native Expo SDK 53 file-system document directory, alternating versioned snapshots, serialized saves and read-back validation. Local-only storage is a first-slice decision, not the final shared-account architecture; it is not encrypted by the application, does not sync, and can be lost on uninstall. Recovery is limited to the previous valid snapshot. Web is not supported by this persistence implementation. A Goodreads import preserves supported fields and reports skipped rows; it does not import a user's actual highlighted passages. Paste-based import is an intermediate UI, not a finished file picker. The daily rotation is deterministic, not semantic personalization. Do not present it as such.

Not yet implemented: direct file picker, Kindle/Readwise quote imports, OCR, voice, notifications/widgets, semantic retrieval, cross-book suggestions, grounded conversations, editing/deletion/export, account isolation and cloud sync. The first-mobile-build.md acceptance criteria are unchanged. No public release or personal phone acceptance claimed.

Local verification:
```sh
npm ci
npm run test:library
npx tsc --noEmit
npx expo start
```
Run the tests with Node 22+. Verify import preview and repeat import, manual capture, cold restart, favorite and daily passage, failure recovery and no sample records on iOS. The authoring environment has no GitHub clone/network access or installed Expo dependencies, so runtime checks and typecheck remain unverified.

## Slice 02 — import and connections

Added clipboard-based import of English Kindle My Clippings highlights, Readwise CSV, and attributed quote CSV (including the original Quote-only CSV format with explicit book/author). Preview shows new passages/books, title/author matches, repeated source records, ambiguous matches and skipped entries. Exact author/title matching is normalized but not edition verification. Original import dates remain raw source metadata; createdAt denotes local capture/import time. Separate Kindle notes/bookmarks and non-English metadata are skipped rather than guessed. Identical rows without stable source IDs are deduplicated within a source; distinct sources are not silently merged. File picker and direct sync are still pending.

Discover now supports lexical passage search, a cross-book comparison suggestion using shared uncommon words, manual selection of two sources, saving a reader-authored relationship and reflection, editing and dismissing suggestions. Saved/dismissed pairs persist in the existing backward-compatible snapshot. This is NOT semantic understanding, AI-generated insight, or a conversational companion. No model is connected and no personal material is sent to a model. The next model-assisted slice must provide meaningful relationships with inspectable evidence, secure server-side credentials, consent and no fabricated reader history. The acceptance criteria in first-mobile-build.md remain unchanged.

Profile provides an explicit native share-sheet JSON export of the complete local library, including notes and connections. Import/restore of this JSON, comprehensive deletion/correction, encryption, sync and identity/account isolation are still pending. Export is sensitive; the app removes its temporary cached file after sharing, but cannot control external copies.

Tests added for quote parsing, attribution, repeat imports, ambiguity, cross-book evidence, saved/dismissed state and editing. Node tests and Expo runtime/typecheck remain unverified here. No personal CSV content was added to the repository.

## Slice 03 — model-assisted connections and conversation

Added an opt-in companion screen from Discover and selected/saved comparisons, with manually selected source passages, separately controlled personal notes, per-request consent, text follow-up and exact source excerpt display. A separate loopback-only authenticated model gateway validates input and output and permits abstention. Model keys stay server-side; the mobile access token and session history are memory-only. See [companion setup](companion-setup.md). This is the first code path for model-assisted interpretation, not verified AI quality or a deployed integration. Manual pair saving keeps reader interpretation separate from AI text. Whole-library semantic retrieval, automated suggestions, multi-book saved threads, voice, notifications/widgets and remaining first-build items are pending. The feature specification and acceptance criteria remain unchanged. Contract tests added; no actual provider, iPhone or full typecheck executed.

## Slice 04 — automatic evidence discovery

Added local candidate selection over the eligible library and an optional embedding-based ranking endpoint behind the existing private gateway. Up to 24 reviewed excerpts are ranked, then up to six source IDs are returned for reader review before model interpretation. Source notes default off; retrieval and interpretation are separately consented. The Today screen links the featured passage to cross-book discovery. Earlier saved/dismissed pairs are excluded around the selected anchor; saved reflections influence local prioritization without transmitting their text. No persistent vector index, background AI requests or exhaustive semantic scan; the provider must be configured separately. The full product specification and first-build acceptance criteria remain unchanged. Nine isolated JS retrieval contract/ranking checks executed successfully during authoring; repository test files added. No provider, installed Expo runtime, device or full typecheck verified.

## Slice 05 — native import/export usability

Goodreads, Kindle, Readwise and quote CSV imports now use the native document picker and parse the selected file directly, showing counts before confirmation. Removed raw export text fields. Files are limited to 10 MB and temporary picker copies are cleaned up; original Files/iCloud items are untouched. Quote-only CSV still requires explicit book/author attribution. Profile offers separate book and highlight CSV exports via the share sheet, retaining full JSON export for lossless data including connections. Spreadsheet formula-like cells are prefixed with an apostrophe in CSV only. CSV is for portability, not full backup restoration. Remaining multiline passage/reflection/question fields have fixed scrollable height, without truncating existing text. The SDK 58 migration helper now includes expo-document-picker. For an already migrated local SDK 58 checkout install just this module with npx expo install expo-document-picker. The local SDK 58 manifest and lockfile have not been uploaded; do not rerun the migration or npm ci against the old committed manifest. Device verification of these changes is pending.

## Slice 06 — cloud persistence and authentication

Supabase project GoodQuotesApp now holds the private relational schema and revision-checked mobile RPCs. Live SQL round-trip and two-account isolation regression passed with rollback; both functions run as invoker and anonymous execution is denied. Both applied migrations are committed from database history. The mobile app gates screens on email/password authentication, stores session values in SecureStore, and uses cloud reads/saves instead of local JSON. Profile provides refresh, exports and sign out. See [cloud setup](cloud-setup.md). No old local records are automatically migrated; founder stated there are none. Online-only preview; no offline synchronization, reset-password UI, persistent AI conversation or embedding pipeline yet. The SDK 58 lockfile is still local to the developer Mac and dependency installation, typecheck and device test are pending.
