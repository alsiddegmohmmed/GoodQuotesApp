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
