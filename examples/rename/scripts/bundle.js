const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const tmp = path.join(root, 'build', 'tmp');
const bundleRoot = path.join(root, 'build', 'Rename.sketchplugin');
const sketchDir = path.join(bundleRoot, 'Contents', 'Sketch');

fs.rmSync(bundleRoot, { recursive: true, force: true });
fs.mkdirSync(sketchDir, { recursive: true });

const prelude = `var that = this;
var module = { exports: {} };
var exports = module.exports;
`;
const epilogue = `
for (var __k in exports) { that[__k] = exports[__k]; }
if (module.exports !== exports) {
  for (var __k2 in module.exports) { that[__k2] = module.exports[__k2]; }
}
`;

for (const name of fs.readdirSync(tmp)) {
    if (!name.endsWith('.js')) continue;
    const src = fs.readFileSync(path.join(tmp, name), 'utf8');
    fs.writeFileSync(path.join(sketchDir, name), prelude + src + epilogue);
}

fs.copyFileSync(
    path.join(root, 'src', 'manifest.json'),
    path.join(sketchDir, 'manifest.json'),
);

console.log('Built -> ' + path.relative(root, bundleRoot));
