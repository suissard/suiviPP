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

// Inline print CSS
const printCssPath = path.join(publicDir, 'print.css');
if (fs.existsSync(printCssPath)) {
    const css = fs.readFileSync(printCssPath, 'utf-8');
    html = html.replace('<link rel="stylesheet" href="print.css" media="print">', `<style media="print">${css}</style>`);
}

// Inline JavaScript
const excelProcessorPath = path.join(publicDir, 'excel-processor.js');
if (fs.existsSync(excelProcessorPath)) {
    const excelProcessorJs = fs.readFileSync(excelProcessorPath, 'utf-8');
    html = html.replace('<script src="excel-processor.js"></script>', `<script>${excelProcessorJs}</script>`);
}

const dataJsPath = path.join(publicDir, 'Data.js');
if (fs.existsSync(dataJsPath)) {
    const dataJs = fs.readFileSync(dataJsPath, 'utf-8');
    html = html.replace('<script src="Data.js"></script>', `<script>${dataJs}</script>`);
}

const jsPath = path.join(publicDir, 'script.js');
if (fs.existsSync(jsPath)) {
    const js = fs.readFileSync(jsPath, 'utf-8');
    html = html.replace('<script src="script.js"></script>', `<script>${js}</script>`);
}

// Write the bundled HTML to the build directory
fs.writeFileSync(path.join(buildDir, 'index.html'), html);

console.log('Build complete!');
