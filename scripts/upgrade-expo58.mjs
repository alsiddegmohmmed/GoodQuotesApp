import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const run = (command, args, options = {}) => execFileSync(command, args, { cwd: root, ...options });
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 13)) throw new Error('Use Node 22.13 or newer (Node 22 LTS recommended).');
const manifest = join(root, 'package.json');
const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
if (pkg.name !== 'goodquotesapp') throw new Error('Unexpected project.');
const temp = mkdtempSync(join(tmpdir(), 'goodquotes-sdk58-'));
try {
  const packed = JSON.parse(run('npm', ['pack', 'expo@^58.0.0', '--json', '--pack-destination', temp], { encoding: 'utf8' }));
  const archive = join(temp, packed[0].filename);
  const bundled = JSON.parse(run('tar', ['-xOf', archive, 'package/bundledNativeModules.json'], { encoding: 'utf8' }));
  if (!String(packed[0].version).startsWith('58.')) throw new Error('Unexpected Expo version.');
  const required = ['react', 'react-native', 'expo-status-bar', 'expo-clipboard', 'expo-sharing', 'expo-file-system', 'expo-font', 'react-native-gesture-handler', 'react-native-reanimated', 'react-native-worklets', 'react-native-safe-area-context', 'react-native-screens'];
  for (const name of required) {
    if (typeof bundled[name] !== 'string') throw new Error('Expo SDK metadata is missing ' + name + '; inspect before proceeding.');
    pkg.dependencies[name] = bundled[name];
  }
  pkg.dependencies.expo = '^58.0.0';
  pkg.dependencies['@expo/vector-icons'] = bundled['@expo/vector-icons'] ?? '^14.1.0';
  // These are unused legacy dependencies; current app uses React Navigation 7 and Expo vector icons.
  delete pkg.dependencies['react-navigation'];
  delete pkg.dependencies['react-native-vector-icons'];
  delete pkg.devDependencies['@types/react-native'];
  delete pkg.devDependencies['@types/axios'];
  delete pkg.devDependencies['@types/react-native-vector-icons'];
  pkg.devDependencies['@types/react'] = '^19.0.0';
  writeFileSync(manifest, JSON.stringify(pkg, null, 2) + '\n');
  for (const path of ['src/data/libraryStorage.ts', 'src/screens/ProfileScreen.tsx']) {
    const absolute = join(root, path);
    const source = readFileSync(absolute, 'utf8');
    writeFileSync(absolute, source.replace("from 'expo-file-system';", "from 'expo-file-system/legacy';"));
  }
  const configPath = join(root, 'app.json');
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  delete config.expo.newArchEnabled;
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  run('npm', ['install'], { stdio: 'inherit' });
  run('npx', ['expo', 'install', '--fix'], { stdio: 'inherit' });
  console.log('SDK dependencies resolved locally. Check the generated lockfile and run Expo Doctor before committing the upgrade.');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
