import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- Melody Sketcher Build Pre-Cleaner ---');

// 1. Force kill running instances of Electron or Melody Sketcher Studio on Windows
if (process.platform === 'win32') {
  try {
    console.log('Checking for active Melody Sketcher Studio instances...');
    execSync('taskkill /f /im "Melody Sketcher Studio.exe" /t 2>nul');
    console.log('Successfully closed running app instances.');
  } catch {
    // Ignore if not running
  }
  try {
    console.log('Checking for stray electron processes...');
    execSync('taskkill /f /im "electron.exe" /t 2>nul');
    console.log('Successfully closed stray electron processes.');
  } catch {
    // Ignore if not running
  }
}

// 2. Clean dist-desktop output directory
const distDesktopPath = path.join(__dirname, 'dist-desktop');
if (fs.existsSync(distDesktopPath)) {
  console.log('Clearing old dist-desktop build output...');
  try {
    fs.rmSync(distDesktopPath, { recursive: true, force: true });
    console.log('Cleaned dist-desktop directory.');
  } catch (err) {
    console.warn('Warning: Could not clear dist-desktop folder fully:', err.message);
  }
}

// 3. Auto-increment package.json patch version
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const oldVersion = pkg.version || '1.0.0';
    const parts = oldVersion.split('.');
    if (parts.length === 3) {
      const patch = parseInt(parts[2], 10);
      if (!isNaN(patch)) {
        parts[2] = (patch + 1).toString();
        const newVersion = parts.join('.');
        pkg.version = newVersion;
        fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
        console.log(`Auto-bumped version: ${oldVersion} -> ${newVersion}`);
      }
    }
  } catch (err) {
    console.error('Error auto-bumping package.json version:', err.message);
  }
}

console.log('----------------------------------------');

