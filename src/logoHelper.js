// Logo Helper
// The parties sprite image contains 24 logos arranged vertically
// These are the actual extracted positions from the original HTML

const logoPositions = {
  0: 0, // PVV
  1: 8.69565, // VVD
  2: 26.087, // CDA
  3: 47.8261, // SGP
  4: 52.1739, // ChristenUnie
  5: 60.8696, // JA21
  6: 82.6087, // 50PLUS
  7: 91.3043, // FNP
  8: 4.34783, // GroenLinks-PvdA
  9: 13.0435, // NSC
  10: 17.3913, // D66
  11: 21.7391, // BBB
  12: 30.4348, // SP
  13: 34.7826, // DENK
  14: 39.1304, // Partij voor de Dieren
  15: 43.4783, // FvD
  16: 56.5217, // Volt
  17: 65.2174, // Vrede voor Dieren
  18: 69.5652, // BVNL
  19: 73.913, // BIJ1
  20: 78.2609, // Libertaire Partij
  21: 86.9565, // Piratenpartij
  22: 95.6522, // Vrij Verbond
  23: 100 // De Linie
};

export function getLogoStyle(logoIndex) {
  if (logoIndex === null || logoIndex === undefined) return '';
  
  const yPosition = logoPositions[logoIndex] || 0;
  return `background: url('gfx/img/parties.png') 0px ${yPosition}% / 100% 2400% no-repeat;`;
}

export function getLogoPosition(logoIndex) {
  if (logoIndex === null || logoIndex === undefined) return '0px 0%';
  
  const yPosition = logoPositions[logoIndex] || 0;
  return `0px ${yPosition}%`;
}

// Example usage in Svelte:
// <div style="{getLogoStyle(party.logoIndex)}" class="party-logo"></div>
