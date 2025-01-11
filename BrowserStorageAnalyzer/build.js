// build.js
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Run Vite build
console.log('Running Vite build...');
execSync('vite build', { stdio: 'inherit' });

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Copy manifest.json
console.log('Copying manifest.json...');
fs.copyFileSync('manifest.json', 'dist/manifest.json');

// Copy icons
console.log('Copying icons...');
if (!fs.existsSync('dist/icons')) {
    fs.mkdirSync('dist/icons');
}
fs.copyFileSync('public/icons/icon16.png', 'dist/icons/icon16.png');
fs.copyFileSync('public/icons/icon48.png', 'dist/icons/icon48.png');
fs.copyFileSync('public/icons/icon128.png', 'dist/icons/icon128.png');

// Copy popup.html
console.log('Copying popup.html...');
fs.copyFileSync('popup.html', 'dist/popup.html');

console.log('Build complete! Check the dist folder.');