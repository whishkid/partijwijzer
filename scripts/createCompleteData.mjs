import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// Party ID mapping (alphabetical order for consistency)
const partyIdMapping = {
  "50PLUS": 1,
  "BBB": 2,
  "BIJ1": 3,
  "BVNL": 4,
  "CDA": 5,
  "ChristenUnie": 6,
  "D66": 7,
  "De Linie": 8,
  "DENK": 9,
  "FNP": 10,
  "FvD": 11,
  "GroenLinks-PvdA": 12,
  "JA21": 13,
  "Libertaire Partij": 14,
  "NSC": 15,
  "Partij voor de Dieren": 16,
  "Piratenpartij": 17,
  "PVV": 18,
  "SGP": 19,
  "SP": 20,
  "Volt": 21,
  "Vrede voor Dieren": 22,
  "Vrij Verbond": 23,
  "VVD": 24
};

// Function to extract statement data from HTML
function extractStatementFromHTML(htmlFile) {
  try {
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    // Extract statement number from file name
    const fileName = path.basename(htmlFile);
    const statementId = parseInt(fileName.replace(/\.(html|HTML)$/, ''));
    
    // Extract theme
    const themeElement = document.querySelector('.statement__theme');
    const theme = themeElement ? themeElement.textContent.trim() : '';
    
    // Extract title
    const titleElement = document.querySelector('h1[aria-label]');
    const title = titleElement ? titleElement.getAttribute('aria-label').trim() : '';
    
    // Create theme ID from theme
    const themeId = theme.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    
    console.log(`Processing statement ${statementId}: ${title}`);
    
    // Extract party positions
    const parties = { agree: [], neither: [], disagree: [] };
    
    // Find all party columns (agree, disagree, neither)
    const partyColumns = document.querySelectorAll('.parties-column');
    
    partyColumns.forEach(column => {
      // Determine position based on column header
      let position = 'neither';
      const headerElement = column.querySelector('.parties-column__header');
      if (headerElement) {
        const headerClass = headerElement.className;
        if (headerClass.includes('--agree')) {
          position = 'agree';
        } else if (headerClass.includes('--disagree')) {
          position = 'disagree';
        } else if (headerClass.includes('--neither')) {
          position = 'neither';
        }
      }
      
      // Find all parties in this column
      const partyElements = column.querySelectorAll('.parties-column__party');
      
      partyElements.forEach(partyElement => {
        try {
          // Extract party name
          const nameElement = partyElement.querySelector('.parties-column__party-name');
          if (!nameElement) return;
          
          let partyName = nameElement.textContent.trim();
          
          // Normalize party names to match our mapping
          const nameMapping = {
            'GroenLinks-PvdA': 'GroenLinks-PvdA',
            'PvdA-GroenLinks': 'GroenLinks-PvdA',
            'Forum voor Democratie': 'FvD',
            'FVD': 'FvD',
            'BoerBurgerBeweging': 'BBB',
            'Partij voor de Dieren': 'Partij voor de Dieren',
            'PvdD': 'Partij voor de Dieren',
            'BVNL / Groep Van Haga': 'BVNL',
            'Frysk Nasjonale Partij': 'FNP'
          };
          
          if (nameMapping[partyName]) {
            partyName = nameMapping[partyName];
          }
          
          // Extract explanation
          const explanationElement = partyElement.querySelector('.parties-column__party-explanation');
          const explanation = explanationElement ? explanationElement.textContent.trim() : '';
          
          // Only add if we have valid data and the party is in our mapping
          if (partyIdMapping[partyName] && explanation) {
            const partyData = {
              id: partyIdMapping[partyName],
              name: partyName,
              fullName: partyName,
              logoIndex: null,
              statement: {
                id: null,
                position: position,
                explanation: explanation,
                accessibility: {
                  explanation: explanation
                }
              }
            };
            
            parties[position].push(partyData);
          }
        } catch (error) {
          console.warn(`Error processing party in statement ${statementId}:`, error.message);
        }
      });
    });
    
    return {
      id: statementId,
      theme: theme,
      themeId: themeId,
      title: title,
      accessibility: {
        moreInfo: {
          text: null
        }
      },
      moreInfo: {
        title: "",
        text: null,
        imageAlt: "Afbeelding"
      },
      isShootout: false,
      index: statementId,
      parties: parties
    };
    
  } catch (error) {
    console.error(`Error processing ${htmlFile}:`, error.message);
    return null;
  }
}

// Function to create complete statements and parties data
function createCompleteData() {
  console.log('🔄 Creating complete statements and parties data from HTML files...\n');
  
  try {
    // Get existing JSON data for statements 1 and 3
    const existingJsonPath = path.join(process.cwd(), 'src', 'statements', '1.json');
    let existingData = [];
    
    // Try to read existing JSON, if it doesn't exist, we'll create from scratch
    if (fs.existsSync(existingJsonPath)) {
      existingData = JSON.parse(fs.readFileSync(existingJsonPath, 'utf8'));
    }
    
    // Initialize statements array
    const statements = [];
    
    // Add existing data if available
    if (existingData.length > 0) {
      statements.push(existingData[0]); // Statement 1
      if (existingData[1]) {
        statements.push(existingData[1]); // Statement 3 (ID 79633 -> we'll change to 3)
        // Fix the ID of the second statement
        statements[1].id = 3;
        statements[1].index = 3;
      }
    }
    
    // Process HTML files for all statements 1-30
    const statementsDir = path.join(process.cwd(), 'statements');
    
    // Process all statements from 1-30
    for (let i = 1; i <= 30; i++) {
      // Skip if we already have this statement from JSON
      if (statements.some(s => s.id === i)) {
        continue;
      }
      
      const htmlFile = path.join(statementsDir, `${i}.html`);
      const htmlFileUpper = path.join(statementsDir, `${i}.HTML`);
      
      const filePath = fs.existsSync(htmlFile) ? htmlFile : 
                      fs.existsSync(htmlFileUpper) ? htmlFileUpper : null;
      
      if (filePath) {
        const statement = extractStatementFromHTML(filePath);
        if (statement) {
          statements.push(statement);
        }
      } else {
        console.warn(`HTML file not found for statement ${i}`);
      }
    }
    
    // Sort statements by ID
    statements.sort((a, b) => a.id - b.id);
    
    console.log(`\n📋 Created ${statements.length} statements`);
    
    // Create parties data structure
    const parties = {};
    
    // Initialize all parties
    Object.entries(partyIdMapping).forEach(([partyName, partyId]) => {
      parties[partyName] = {
        id: partyId,
        name: partyName,
        fullName: partyName,
        logo: null,
        logoIndex: null,
        participates: true,
        website: null,
        hasSeats: null,
        statements: [],
        shootoutStatements: []
      };
    });
    
    // Process each statement to build party data
    statements.forEach(statement => {
      ['agree', 'neither', 'disagree'].forEach(position => {
        if (statement.parties[position]) {
          statement.parties[position].forEach(partyData => {
            if (parties[partyData.name]) {
              parties[partyData.name].statements.push({
                id: statement.id,
                position: partyData.statement.position,
                explanation: partyData.statement.explanation,
                accessibility: partyData.statement.accessibility
              });
            }
          });
        }
      });
    });
    
    // Ensure all parties have statements for all issues
    const allStatementIds = statements.map(s => s.id);
    Object.values(parties).forEach(party => {
      const existingStatementIds = party.statements.map(s => s.id);
      const missingStatementIds = allStatementIds.filter(id => !existingStatementIds.includes(id));
      
      missingStatementIds.forEach(statementId => {
        party.statements.push({
          id: statementId,
          position: "neither",
          explanation: "Deze partij heeft geen standpunt ingenomen over deze stelling.",
          accessibility: {
            explanation: "Deze partij heeft geen standpunt ingenomen over deze stelling."
          }
        });
      });
      
      // Sort statements by ID
      party.statements.sort((a, b) => a.id - b.id);
    });
    
    // Convert parties object to sorted array
    const sortedParties = Object.values(parties)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    // Write statements.js
    const statementsContent = `export let statements = ${JSON.stringify(statements, null, 2)};`;
    const statementsPath = path.join(process.cwd(), 'src', 'statements.js');
    fs.writeFileSync(statementsPath, statementsContent);
    
    // Write parties.js
    const partiesContent = `export let parties = ${JSON.stringify(sortedParties, null, 2)};`;
    const partiesPath = path.join(process.cwd(), 'src', 'parties.js');
    fs.writeFileSync(partiesPath, partiesContent);
    
    console.log('\n✅ Successfully created statements.js and parties.js');
    
    // Show summary
    console.log('\n📊 Summary:');
    console.log(`   Statements: ${statements.length}`);
    console.log(`   Parties: ${sortedParties.length}`);
    
    sortedParties.forEach(party => {
      const positions = party.statements.reduce((acc, stmt) => {
        acc[stmt.position] = (acc[stmt.position] || 0) + 1;
        return acc;
      }, {});
      console.log(`   ${party.name}: ${party.statements.length} statements (${positions.agree || 0} agree, ${positions.disagree || 0} disagree, ${positions.neither || 0} neither)`);
    });
    
    const totalPositions = sortedParties.reduce((sum, p) => sum + p.statements.length, 0);
    console.log(`\n🎉 Total: ${totalPositions} party positions across all statements`);
    console.log('✅ All parties now have positions on all issues!');
    
  } catch (error) {
    console.error('❌ Error creating complete data:', error);
  }
}

// Run the script
createCompleteData();