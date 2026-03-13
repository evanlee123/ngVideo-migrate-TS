const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist', 'ng-video-elements');
const outputFile = path.join(distDir, 'ng-video-bundle.js');

const files = ['runtime.js', 'polyfills.js', 'main.js'];
let bundle = '';

for (const file of files) {
  const filePath = path.join(distDir, file);
  if (fs.existsSync(filePath)) {
    bundle += fs.readFileSync(filePath, 'utf8') + '\n';
  } else {
    console.warn(`Warning: ${file} not found in ${distDir}`);
  }
}

fs.writeFileSync(outputFile, bundle);
console.log(`Created ${outputFile} (${(bundle.length / 1024).toFixed(1)} KB)`);
