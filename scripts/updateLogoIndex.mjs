import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// Read one HTML file to extract all party logo information
const htmlFilePath = path.join(process.cwd(), 'statements', '2.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

const dom = new JSDOM(htmlContent);
const document = dom.window.document;

// Extract logo information for all parties with numeric indexes
const partyLogos = {};
let logoIndex = 0;

// Find all party elements with logos
const partyElements = document.querySelectorAll('.parties-column__party');

partyElements.forEach(partyElement => {
  const nameElement = partyElement.querySelector('.parties-column__party-name');
  const logoElement = partyElement.querySelector('.parties-column__party-logo');
  
  if (nameElement && logoElement) {
    const partyName = nameElement.textContent.trim();
    const style = logoElement.getAttribute('style');
    
    // Extract the background position from the style attribute
    const backgroundMatch = style.match(/background:\s*url\('([^']+)'\)\s*([^;]+)/);
    
    if (backgroundMatch) {
      const imageUrl = backgroundMatch[1];
      const positionAndSize = backgroundMatch[2].trim();
      
      // Extract the Y position percentage
      const positionMatch = positionAndSize.match(/0px\s+([\d.]+)%/);
      
      if (positionMatch) {
        const yPosition = parseFloat(positionMatch[1]);
        
        partyLogos[partyName] = {
          imageUrl,
          logoIndex: logoIndex,
          yPosition,
          backgroundPosition: `0px ${yPosition}%`,
          backgroundSize: '100% 2400%'
        };
        logoIndex++;
      }
    }
  }
});

console.log('Extracted logo information for', Object.keys(partyLogos).length, 'parties:');

// Show mapping
Object.entries(partyLogos).forEach(([name, info]) => {
  console.log(`${info.logoIndex}: ${name} (Y: ${info.yPosition}%)`);
});

// Now read the existing parties.js file and update it with logo information
const partiesFilePath = path.join(process.cwd(), 'src', 'parties.js');
const partiesContent = fs.readFileSync(partiesFilePath, 'utf-8');

// Parse the parties data
const partiesMatch = partiesContent.match(/export let parties = (\[[\s\S]*\]);/);
if (!partiesMatch) {
  console.error('Could not parse parties.js file');
  process.exit(1);
}

const parties = JSON.parse(partiesMatch[1]);

// Update each party with logo information
parties.forEach(party => {
  const logoInfo = partyLogos[party.name];
  if (logoInfo) {
    party.logo = logoInfo.imageUrl;
    party.logoIndex = logoInfo.logoIndex;
    
    // Remove the extra fields that were added previously if they exist
    delete party.logoPosition;
    delete party.logoSize;
    delete party.logoStyle;
    
    console.log(`Updated ${party.name} with logoIndex: ${logoInfo.logoIndex}`);
  } else {
    console.log(`No logo found for ${party.name}`);
  }
});

// Write the updated parties.js file
const updatedContent = `export let parties = ${JSON.stringify(parties, null, 2)};`;
fs.writeFileSync(partiesFilePath, updatedContent);

console.log('\nSuccessfully updated parties.js with logoIndex information!');
console.log('Parties with logos:', parties.filter(p => p.logo).length);
console.log('Total parties:', parties.length);

// Create a helper file that shows how to use the logoIndex
const helperContent = `// Logo Helper
// The parties sprite image contains 24 logos arranged vertically
// Each logo takes up 1/24 of the image height (about 4.17% each)
// Use this function to calculate the background position:

export function getLogoStyle(logoIndex) {
  if (logoIndex === null || logoIndex === undefined) return '';
  
  const yPosition = (logoIndex / 23) * 100; // 23 because we go from 0-23 (24 total)
  return \`background: url('gfx/img/parties.png') 0px \${yPosition}% / 100% 2400% no-repeat;\`;
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
console.log('Created logoHelper.js with utility functions');