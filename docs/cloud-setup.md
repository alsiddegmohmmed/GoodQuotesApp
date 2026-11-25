# Cloud-backed GoodQuotes

The mobile app now uses Supabase project hrjbxctmvqpulpocjlfr, not the legacy quote backend or GoodQuotes2. Only its public publishable key is bundled. Sign in or create an email/password account; if confirmation is enabled, confirm via email then return to sign in. The app uses OS secure storage for session tokens, gates library screens by the signed-in account, and unmounts the previous library on account change.

The two versioned SQL migrations in supabase/migrations are exported from the live project's migration history. They are already applied to this project. Do not reapply them here. Database calls read_library and save_library are SECURITY INVOKER, enforce the requesting user ID, use RLS and ownership foreign keys, and use a per-user locked revision to reject stale mobile writes. The server returns the persisted canonical library. Existing records are not deleted by incomplete snapshots. Notes, reading status, attribution and connections are stored relationally. A direct table writer that bypasses the RPC does not participate in the revision protocol; future web clients must use the same transaction contract.

There is no automatic migration of old device JSON files, as the founder confirmed no local reading data. Existing local files are not removed. Cloud storage is primary; the first version is online-only, with no offline write queue or SQLite synchronization. A failed/uncertain write is never shown as saved; refresh before retrying. Profile supports refresh, sign out, JSON and CSV exports. The companion gateway remains separate and requires deployment/provider configuration. Vector storage exists but background embedding generation and persistent conversation history are not yet implemented.

## Update an already working SDK 58 checkout

```bash
git pull --ff-only &&
npx expo install expo-document-picker expo-secure-store &&
npm install --save-exact @supabase/supabase-js react-native-url-polyfill &&
npx expo start --go --tunnel --clear
```

Do not run npm ci against the committed SDK 53 manifest. The successful SDK 58 package.json and package-lock.json still exist only on the developer Mac; commit those generated files separately after verifying the phone build. New native dependencies must match Expo SDK 58. Supabase JS and URL polyfill are pinned locally by npm. Password reset, social login, offline synchronization and account deletion are future work.

## Verification

Live SQL regression used two synthetic auth users and ran as authenticated. Confirmed empty read, transactional save/read of books, passages, notes and cross-book connections, revision rejection, cross-user RPC denial and RLS isolation. Test inserts were rolled back. Anonymous execution is denied. Security advisor returned no findings. Full TypeScript build, Expo Go, real email delivery and app network calls have not been verified yet.
