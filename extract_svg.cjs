const fs = require('fs');
const content = fs.readFileSync('src/assets/tooth-formula-fdi.svg', 'utf8');

// SVG contains <g id="tooth-18"> ... </g> or similar?
const toothGroups = content.match(/<g[^>]*id="[^"]+"[^>]*>[\s\S]*?<\/g>/gi) || [];

const extracted = {};

for (const g of toothGroups) {
  const idMatch = g.match(/id="([^"]+)"/);
  if (!idMatch) continue;
  const id = idMatch[1].replace('tooth-', '').replace('t-', '');
  
  if (!id.match(/^\d{2}$/)) continue;
  
  // Extract all paths inside this group
  const paths = g.match(/<path[^>]*d="[^"]+"[^>]*>/gi) || [];
  
  // Clean up paths: make them relative to 0,0 or something, or just keep them raw
  extracted[id] = paths.join('\n');
}

fs.writeFileSync('extracted_teeth.json', JSON.stringify(extracted, null, 2));
console.log('Extracted ' + Object.keys(extracted).length + ' teeth.');
