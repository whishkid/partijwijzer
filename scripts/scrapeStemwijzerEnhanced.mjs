import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, "../src");

function generateDataModule(statements, parties) {
  const statementsBlock = `export let statements = ${JSON.stringify(statements, null, 4)}\n`;
  const partiesBlock = `export let parties = ${JSON.stringify(parties, null, 4)}\n`;
  return `${statementsBlock}${partiesBlock}`;
}

async function scrapeStemwijzer() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log("Opening Stemwijzer...");
    await page.goto("https://stemwijzer.nl/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    
    console.log("\n🔍 STEMWIJZER ENHANCED SCRAPER 🔍");
    console.log("================================");
    console.log("INSTRUCTIONS:");
    console.log("1. Navigate to the questionnaire");
    console.log("2. Go through questions one by one");
    console.log("3. For each question, click 'wat vinden de partijen'");
    console.log("4. When you're on a page showing party positions, press ENTER");
    console.log("5. Repeat for each question");
    console.log("6. Type 'done' and press ENTER when finished");
    console.log("================================\n");
    
    const statements = [];
    const allParties = new Map();
    let questionNumber = 1;
    
    while (true) {
      console.log(`\n📝 Ready for question ${questionNumber}`);
      console.log("Navigate to the party positions page and press ENTER (or type 'done' to finish):");
      
      // Wait for user input
      const input = await new Promise(resolve => {
        process.stdin.resume();
        process.stdin.once("data", data => {
          const input = data.toString().trim().toLowerCase();
          resolve(input);
        });
      });
      
      if (input === 'done') {
        console.log("✅ Finishing extraction...");
        break;
      }
      
      console.log(`\n🔍 Analyzing page for question ${questionNumber}...`);
      
      // Enhanced extraction with multiple strategies
      const extractedData = await page.evaluate((qNum) => {
        const result = {
          questionText: "",
          parties: [],
          debugInfo: {
            url: window.location.href,
            title: document.title,
            bodyTextLength: document.body.textContent.length,
            foundPartyNames: [],
            foundElements: []
          }
        };
        
        // Strategy 1: Find the main question/statement
        const questionSelectors = [
          'h1', 'h2', 'h3',
          '.question', '.statement', '.stelling',
          '[data-testid*="question"]', '[data-testid*="statement"]',
          '.question-text', '.statement-text'
        ];
        
        for (const selector of questionSelectors) {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            const text = element.textContent?.trim();
            if (text && text.length > 30 && text.length < 500 && 
                (text.includes('Nederland') || text.includes('regering') || text.includes('moet') || text.includes('?'))) {
              result.questionText = text;
              result.debugInfo.foundElements.push(`Question found with ${selector}: ${text.substring(0, 100)}`);
              break;
            }
          }
          if (result.questionText) break;
        }
        
        // If no question found, try to get from page title or meta
        if (!result.questionText) {
          result.questionText = document.title || `Question ${qNum}`;
          result.debugInfo.foundElements.push(`Used fallback question: ${result.questionText}`);
        }
        
        // Strategy 2: Enhanced party detection
        const partyNames = [
          'VVD', 'PVV', 'CDA', 'D66', 'GL', 'GroenLinks', 'SP', 'PvdA', 
          'CU', 'ChristenUnie', 'PvdD', 'Partij voor de Dieren', 'FvD', 'Forum voor Democratie',
          'DENK', 'SGP', 'VOLT', 'JA21', 'BBB', 'BoerBurgerBeweging', 'NSC', 'Nieuw Sociaal Contract'
        ];
        
        console.log("DEBUG: Starting enhanced party extraction...");
        
        // Look for party containers/cards first
        const partyContainers = document.querySelectorAll([
          '.party', '.party-card', '.party-item', '.political-party',
          '.standpunt', '.mening', '.position', '.party-position',
          '[data-party]', '[class*="party"]', '[class*="standpunt"]'
        ].join(', '));
        
        console.log(`DEBUG: Found ${partyContainers.length} potential party containers`);
        result.debugInfo.foundElements.push(`Found ${partyContainers.length} party containers`);
        
        if (partyContainers.length > 0) {
          // Extract from structured containers
          for (const container of partyContainers) {
            const containerText = container.textContent || "";
            
            for (const partyName of partyNames) {
              if (containerText.toLowerCase().includes(partyName.toLowerCase())) {
                console.log(`DEBUG: Found ${partyName} in container`);
                result.debugInfo.foundPartyNames.push(partyName);
                
                // Determine position
                let position = "neither";
                const lowerText = containerText.toLowerCase();
                
                // More comprehensive position detection
                if (lowerText.includes('eens') || lowerText.includes('voor') || lowerText.includes('ja') ||
                    lowerText.includes('steunt') || lowerText.includes('akkoord') || lowerText.includes('positief') ||
                    lowerText.includes('support') || lowerText.includes('agree')) {
                  position = "agree";
                } else if (lowerText.includes('oneens') || lowerText.includes('tegen') || lowerText.includes('nee') ||
                           lowerText.includes('afwijst') || lowerText.includes('kritisch') || lowerText.includes('negatief') ||
                           lowerText.includes('disagree') || lowerText.includes('oppose')) {
                  position = "disagree";
                }
                
                // Enhanced explanation extraction
                let explanation = "";
                
                // Method 1: Look for specific explanation elements
                const explanationElements = container.querySelectorAll('p, .explanation, .text, .description, .content');
                for (const el of explanationElements) {
                  const elText = el.textContent?.trim();
                  if (elText && elText.length > 30 && !elText.toLowerCase().includes(partyName.toLowerCase())) {
                    explanation = elText;
                    break;
                  }
                }
                
                // Method 2: Extract from container text
                if (!explanation) {
                  const sentences = containerText.split(/[.!?]+/).filter(s => s.trim().length > 30);
                  for (const sentence of sentences) {
                    const cleanSentence = sentence.trim();
                    if (cleanSentence.length > 40 && !cleanSentence.toLowerCase().includes(partyName.toLowerCase())) {
                      explanation = cleanSentence;
                      break;
                    }
                  }
                }
                
                // Method 3: Fallback to cleaned container text
                if (!explanation && containerText.length > 100) {
                  explanation = containerText
                    .replace(new RegExp(partyName, 'gi'), '')
                    .replace(/[\\n\\r\\t]+/g, ' ')
                    .trim()
                    .substring(0, 300);
                }
                
                if (explanation && explanation.length > 20) {
                  result.parties.push({
                    name: partyName,
                    position: position,
                    explanation: explanation,
                    source: 'container'
                  });
                  console.log(`DEBUG: Added ${partyName} from container with position ${position}`);
                  break; // Move to next party
                }
              }
            }
          }
        } else {
          // Fallback: Search entire page content
          console.log("DEBUG: No containers found, searching entire page...");
          result.debugInfo.foundElements.push("Using fallback page-wide search");
          
          const bodyText = document.body.textContent;
          
          for (const partyName of partyNames) {
            const regex = new RegExp(`\\b${partyName}\\b`, 'gi');
            const matches = bodyText.match(regex);
            
            if (matches && matches.length > 0) {
              console.log(`DEBUG: Found ${matches.length} mentions of ${partyName}`);
              result.debugInfo.foundPartyNames.push(partyName);
              
              // Use XPath to find context
              const xpath = `//text()[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${partyName.toLowerCase()}')]/ancestor::*[position()<=2]`;
              const xpathResult = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
              
              if (xpathResult.singleNodeValue) {
                const context = xpathResult.singleNodeValue.textContent || "";
                
                if (context.length > 100) {
                  let position = "neither";
                  const lowerContext = context.toLowerCase();
                  
                  if (lowerContext.includes('eens') || lowerContext.includes('voor') || lowerContext.includes('ja')) {
                    position = "agree";
                  } else if (lowerContext.includes('oneens') || lowerContext.includes('tegen') || lowerContext.includes('nee')) {
                    position = "disagree";
                  }
                  
                  // Extract explanation from context
                  const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 30);
                  let explanation = "";
                  
                  for (const sentence of sentences) {
                    if (!sentence.toLowerCase().includes(partyName.toLowerCase()) && sentence.trim().length > 40) {
                      explanation = sentence.trim();
                      break;
                    }
                  }
                  
                  if (!explanation && sentences.length > 1) {
                    explanation = sentences[1].trim();
                  }
                  
                  if (explanation && explanation.length > 20) {
                    result.parties.push({
                      name: partyName,
                      position: position,
                      explanation: explanation,
                      source: 'xpath'
                    });
                    console.log(`DEBUG: Added ${partyName} from xpath with position ${position}`);
                  }
                }
              }
            }
          }
        }
        
        console.log(`DEBUG: Final extraction: ${result.parties.length} parties found`);
        return result;
      }, questionNumber);
      
      // Display results
      console.log(`\n📊 EXTRACTION RESULTS FOR QUESTION ${questionNumber}:`);
      console.log(`Question: ${extractedData.questionText.substring(0, 100)}...`);
      console.log(`Found ${extractedData.parties.length} party positions`);
      console.log(`Page URL: ${extractedData.debugInfo.url}`);
      console.log(`Party names found: ${extractedData.debugInfo.foundPartyNames.join(', ')}`);
      
      if (extractedData.parties.length > 0) {
        console.log(`\n📋 Party positions:`);
        extractedData.parties.forEach(party => {
          console.log(`  - ${party.name}: ${party.position} (${party.explanation.substring(0, 80)}...)`);
        });
        
        // Store the data
        const statementId = questionNumber + 79000;
        const statementParties = { agree: [], neither: [], disagree: [] };
        
        extractedData.parties.forEach(party => {
          const partyEntry = {
            name: party.name,
            fullName: party.name,
            logoIndex: null,
            statement: {
              id: statementId,
              position: party.position,
              explanation: party.explanation,
              accessibility: { explanation: party.explanation }
            }
          };
          
          statementParties[party.position].push(partyEntry);
          
          // Add to parties collection
          if (!allParties.has(party.name)) {
            allParties.set(party.name, {
              id: Array.from(allParties.keys()).length + 78000,
              name: party.name,
              fullName: party.name,
              logo: null,
              logoIndex: Array.from(allParties.keys()).length,
              participates: true,
              website: null,
              hasSeats: true,
              statements: []
            });
          }
          
          allParties.get(party.name).statements.push({
            id: statementId,
            position: party.position,
            explanation: party.explanation,
            accessibility: { explanation: party.explanation }
          });
        });
        
        statements.push({
          id: statementId,
          theme: "Algemeen",
          themeId: "algemeen",
          title: extractedData.questionText,
          accessibility: { moreInfo: { text: extractedData.questionText } },
          moreInfo: { title: "", text: extractedData.questionText, imageAlt: "Afbeelding" },
          isShootout: false,
          index: questionNumber,
          parties: statementParties
        });
        
        console.log(`✅ Question ${questionNumber} saved successfully!`);
      } else {
        console.log(`⚠️  No party data found for question ${questionNumber}`);
        console.log("Debug info:", extractedData.debugInfo.foundElements);
      }
      
      questionNumber++;
    }
    
    // Save results
    if (statements.length === 0) {
      throw new Error("No statements were extracted. Make sure you're visiting pages with party positions.");
    }
    
    const parties = Array.from(allParties.values());
    
    console.log(`\n🎉 EXTRACTION COMPLETE!`);
    console.log(`📊 Final Results:`);
    console.log(`   - ${statements.length} statements extracted`);
    console.log(`   - ${parties.length} unique parties found`);
    
    // Write files
    const statementsPath = path.join(OUTPUT_DIR, "statements.json");
    const partiesPath = path.join(OUTPUT_DIR, "parties.json");
    const dataPath = path.join(OUTPUT_DIR, "data.js");
    
    await fs.writeFile(statementsPath, JSON.stringify(statements, null, 4) + "\n", "utf8");
    await fs.writeFile(partiesPath, JSON.stringify(parties, null, 4) + "\n", "utf8");
    await fs.writeFile(dataPath, generateDataModule(statements, parties), "utf8");
    
    console.log(`\n💾 Files saved:`);
    console.log(`   - ${statementsPath}`);
    console.log(`   - ${partiesPath}`);
    console.log(`   - ${dataPath}`);
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await browser.close();
  }
}

scrapeStemwijzer().catch(console.error);