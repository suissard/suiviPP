const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const buildDir = path.join(__dirname, 'build');

// Create build directory if it doesn't exist
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

// Read the HTML template
let html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf-8');

// Inline CSS
const cssPath = path.join(publicDir, 'style.css');
if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf-8');
    html = html.replace('<link rel="stylesheet" href="style.css">', `<style>${css}</style>`);
}

// Inline JavaScript
const jsPath = path.join(publicDir, 'script.js');
if (fs.existsSync(jsPath)) {
    const js = fs.readFileSync(jsPath, 'utf-8');
    html = html.replace('<script src="script.js"></script>', `<script>${js}</script>`);
}

// Write the bundled HTML to the build directory
fs.writeFileSync(path.join(buildDir, 'index.html'), html);

console.log('Build complete!');
