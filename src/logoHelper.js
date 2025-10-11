// Logo Helper
// The parties sprite image contains 24 logos arranged vertically
// Each logo takes up 1/24 of the image height (about 4.17% each)
// Use this function to calculate the background position:

export function getLogoStyle(logoIndex) {
  if (logoIndex === null || logoIndex === undefined) return '';
  
  const yPosition = (logoIndex / 23) * 100; // 23 because we go from 0-23 (24 total)
  return `background: url('https://tweedekamer2025.stemwijzer.nl/gfx/img/parties.png') 0px ${yPosition}% / 100% 2400% no-repeat;`;
}

export function getLogoPosition(logoIndex) {
  if (logoIndex === null || logoIndex === undefined) return '0px 0%';
  
  const yPosition = (logoIndex / 23) * 100;
  return `0px ${yPosition}%`;
}

// Example usage in Svelte:
// <div style="{getLogoStyle(party.logoIndex)}" class="party-logo"></div>
