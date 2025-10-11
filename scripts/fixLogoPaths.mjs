import fs from 'fs';
import path from 'path';

// Read the existing parties.js file and fix the logo paths
const partiesFilePath = path.join(process.cwd(), 'src', 'parties.js');
const partiesContent = fs.readFileSync(partiesFilePath, 'utf-8');

// Parse the parties data
const partiesMatch = partiesContent.match(/export let parties = (\[[\s\S]*\]);/);
if (!partiesMatch) {
  console.error('Could not parse parties.js file');
  process.exit(1);
}

const parties = JSON.parse(partiesMatch[1]);

// Update each party with the correct logo path (just the filename)
parties.forEach(party => {
  if (party.logo) {
    // Change from "gfx/img/parties.png" to just "parties.png"
    party.logo = "parties.png";
    console.log(`Updated ${party.name} logo path to: ${party.logo}`);
  }
});

// Write the updated parties.js file
const updatedContent = `export let parties = ${JSON.stringify(parties, null, 2)};`;
fs.writeFileSync(partiesFilePath, updatedContent);

console.log('\nSuccessfully updated parties.js with correct logo paths!');

// Update the logo helper as well
const helperContent = `// Logo Helper
// The parties sprite image contains 24 logos arranged vertically
// Each logo takes up 1/24 of the image height (about 4.17% each)
// Use this function to calculate the background position:

export function getLogoStyle(logoIndex) {
  if (logoIndex === null || logoIndex === undefined) return '';
  
  const yPosition = (logoIndex / 23) * 100; // 23 because we go from 0-23 (24 total)
  return \`background: url('parties.png') 0px \${yPosition}% / 100% 2400% no-repeat;\`;
}

export function getLogoPosition(logoIndex) {
  if (logoIndex === null || logoIndex === undefined) return '0px 0%';
  
  const yPosition = (logoIndex / 23) * 100;
  return \`0px \${yPosition}%\`;
}

// Example usage in Svelte:
// <div style="{getLogoStyle(party.logoIndex)}" class="party-logo"></div>
`;

fs.writeFileSync(path.join(process.cwd(), 'src', 'logoHelper.js'), helperContent);
console.log('Updated logoHelper.js with correct logo path');