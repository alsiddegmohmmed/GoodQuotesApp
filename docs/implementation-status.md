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
