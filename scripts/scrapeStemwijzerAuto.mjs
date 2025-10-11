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
    console.log("🚀 FULLY AUTOMATED STEMWIJZER SCRAPER");
    console.log("=====================================");
    
    await page.goto("https://stemwijzer.nl/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    
    console.log("📍 Please manually navigate to the FIRST question of the questionnaire");
    console.log("⏸️  Press Enter when you're at the first question...");
    
    // Wait for user to navigate to first question
    await new Promise(resolve => {
      process.stdin.once("data", () => resolve());
    });
    
    const statements = [];
    const allParties = new Map();
    let questionNumber = 1;
    const maxQuestions = 30; // Safety limit
    
    while (questionNumber <= maxQuestions) {
      console.log(`\n📝 PROCESSING QUESTION ${questionNumber}`);
      console.log("=" + "=".repeat(30));
      
      try {
        // Step 1: Extract the current question text
        console.log("1️⃣ Extracting question text...");
        const questionText = await page.evaluate(() => {
          const selectors = [
            'h1', 'h2', 'h3',
            '.question', '.statement', '.stelling',
            '[data-testid*="question"]', '[data-testid*="statement"]',
            '.question-text', '.statement-text'
          ];
          
          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
              const text = element.textContent?.trim();
              if (text && text.length > 30 && text.length < 500) {
                console.log(`Found question with ${selector}: ${text.substring(0, 100)}`);
                return text;
              }
            }
          }
          
          // Fallback: try to find any text that looks like a question
          const allElements = document.querySelectorAll('*');
          for (const element of allElements) {
            const text = element.textContent?.trim();
            if (text && text.length > 50 && text.length < 300 && 
                (text.includes('Nederland') || text.includes('regering') || text.includes('moet') || text.includes('?'))) {
              console.log(`Found question (fallback): ${text.substring(0, 100)}`);
              return text;
            }
          }
          
          return "";
        });
        
        if (!questionText) {
          console.log("❌ No question found. Might have reached the end.");
          break;
        }
        
        console.log(`✅ Question: "${questionText.substring(0, 100)}..."`);
        
        // Step 2: Click "wat vinden de partijen" button
        console.log("2️⃣ Looking for 'wat vinden de partijen' button...");
        
        const partyButtonClicked = await page.evaluate(() => {
          const possibleTexts = [
            'wat vinden de partijen',
            'wat vinden partijen',
            'standpunten',
            'partijen',
            'meningen',
            'standpunt'
          ];
          
          const buttons = document.querySelectorAll('button, a, [role="button"], .button, [onclick]');
          console.log(`Found ${buttons.length} clickable elements`);
          
          for (const button of buttons) {
            const text = button.textContent?.toLowerCase() || '';
            const href = button.href?.toLowerCase() || '';
            
            for (const searchText of possibleTexts) {
              if (text.includes(searchText) || href.includes(searchText)) {
                console.log(`Clicking button: "${button.textContent?.trim()}"`);
                button.click();
                return true;
              }
            }
          }
          
          return false;
        });
        
        if (!partyButtonClicked) {
          console.log("❌ Could not find party button. Trying to continue...");
          // Try to find next button and skip this question
          await this.clickNextButton(page);
          questionNumber++;
          continue;
        }
        
        console.log("✅ Clicked party button, waiting for page to load...");
        await page.waitForTimeout(4000);
        
        // Step 3: Find and click all party containers in all columns
        console.log("3️⃣ Finding and opening all party containers...");
        
        const partyData = await page.evaluate(async () => {
          const parties = [];
          const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
          
          // Look for the three columns: EENS, GEEN VAN BEIDE, ONEENS
          const columns = {
            'agree': ['eens', 'voor', 'ja'],
            'disagree': ['oneens', 'tegen', 'nee'],
            'neither': ['geen van beide', 'neutraal', 'geen', 'beide']
          };
          
          console.log("Looking for party containers in columns...");
          
          // Strategy 1: Look for column headers and their containers
          for (const [position, keywords] of Object.entries(columns)) {
            console.log(`Searching ${position} column...`);
            
            // Find column headers
            const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .header, .title, .column-title');
            for (const header of headers) {
              const headerText = header.textContent?.toLowerCase() || '';
              
              if (keywords.some(keyword => headerText.includes(keyword))) {
                console.log(`Found ${position} column: "${header.textContent}"`);
                
                // Find party containers in this column
                let columnContainer = header.closest('.column, .section, .group') || header.parentElement;
                
                // Expand search area if needed
                for (let i = 0; i < 5 && columnContainer; i++) {
                  columnContainer = columnContainer.parentElement;
                  
                  const partyContainers = columnContainer.querySelectorAll([
                    '.party', '.party-card', '.party-item', '.political-party',
                    '.standpunt', '.mening', '.position', '.party-position',
                    '[data-party]', '[class*="party"]', '.candidate',
                    'button', '.button', '[role="button"]', '.clickable'
                  ].join(', '));
                  
                  console.log(`Found ${partyContainers.length} potential party containers in ${position} column`);
                  
                  for (const container of partyContainers) {
                    const containerText = container.textContent || '';
                    
                    // Check if this container mentions a party name
                    const partyNames = [
                      'VVD', 'PVV', 'CDA', 'D66', 'GL', 'GroenLinks', 'SP', 'PvdA',
                      'CU', 'ChristenUnie', 'PvdD', 'Partij voor de Dieren',
                      'FvD', 'Forum voor Democratie', 'DENK', 'SGP', 'VOLT',
                      'JA21', 'BBB', 'BoerBurgerBeweging', 'NSC', 'Nieuw Sociaal Contract'
                    ];
                    
                    for (const partyName of partyNames) {
                      if (containerText.includes(partyName)) {
                        console.log(`Found ${partyName} container in ${position} column`);
                        
                        // Try to click/expand the container
                        if (container.tagName === 'BUTTON' || container.role === 'button' || 
                            container.classList.contains('button') || container.onclick) {
                          console.log(`Clicking ${partyName} container...`);
                          container.click();
                          await delay(1000); // Wait for expansion
                        }
                        
                        // Extract the explanation after potential expansion
                        const explanation = this.extractExplanation(container, partyName);
                        
                        if (explanation && explanation.length > 20) {
                          parties.push({
                            name: partyName,
                            position: position,
                            explanation: explanation,
                            source: 'column-container'
                          });
                          console.log(`✅ Extracted ${partyName}: ${explanation.substring(0, 100)}...`);
                        }
                        break; // Move to next container
                      }
                    }
                  }
                  
                  if (partyContainers.length > 0) break; // Found containers, stop expanding search
                }
              }
            }
          }
          
          // Strategy 2: If column strategy didn't work, look for any expandable party elements
          if (parties.length === 0) {
            console.log("Column strategy failed, trying general party detection...");
            
            const allClickables = document.querySelectorAll('button, .button, [role="button"], .clickable, .expandable, .collapsible');
            const partyNames = ['VVD', 'PVV', 'CDA', 'D66', 'GL', 'SP', 'PvdA', 'CU', 'PvdD', 'FvD', 'DENK', 'SGP', 'VOLT', 'JA21', 'BBB', 'NSC'];
            
            for (const clickable of allClickables) {
              const text = clickable.textContent || '';
              
              for (const partyName of partyNames) {
                if (text.includes(partyName)) {
                  console.log(`Found clickable ${partyName} element, trying to expand...`);
                  
                  // Click to expand
                  clickable.click();
                  await delay(1500);
                  
                  // Now look for the expanded content
                  const expandedContent = clickable.closest('.expanded, .open') || 
                                        clickable.parentElement.querySelector('.content, .description, .explanation') ||
                                        clickable.nextElementSibling;
                  
                  if (expandedContent) {
                    const explanation = this.extractExplanation(expandedContent, partyName);
                    
                    // Determine position from context or location
                    let position = 'neither';
                    const contextText = (clickable.closest('.column, .section') || clickable.parentElement).textContent?.toLowerCase() || '';
                    
                    if (contextText.includes('eens') || contextText.includes('voor')) {
                      position = 'agree';
                    } else if (contextText.includes('oneens') || contextText.includes('tegen')) {
                      position = 'disagree';
                    }
                    
                    if (explanation && explanation.length > 20) {
                      parties.push({
                        name: partyName,
                        position: position,
                        explanation: explanation,
                        source: 'expandable'
                      });
                      console.log(`✅ Extracted ${partyName} (expandable): ${explanation.substring(0, 100)}...`);
                    }
                  }
                  break;
                }
              }
            }
          }
          
          return parties;
        });
        
        // Add the extractExplanation function to the page context
        await page.addInitScript(() => {
          window.extractExplanation = function(container, partyName) {
            let explanation = "";
            
            // Method 1: Look for specific explanation elements
            const explanationElements = container.querySelectorAll('p, .explanation, .text, .description, .content, .statement');
            for (const el of explanationElements) {
              const elText = el.textContent?.trim();
              if (elText && elText.length > 30 && !elText.toLowerCase().includes(partyName.toLowerCase())) {
                explanation = elText;
                break;
              }
            }
            
            // Method 2: Extract from container text, excluding party name
            if (!explanation) {
              const containerText = container.textContent || '';
              const sentences = containerText.split(/[.!?]+/).filter(s => s.trim().length > 30);
              
              for (const sentence of sentences) {
                const cleanSentence = sentence.trim();
                if (cleanSentence.length > 40 && !cleanSentence.toLowerCase().includes(partyName.toLowerCase())) {
                  explanation = cleanSentence;
                  break;
                }
              }
            }
            
            // Method 3: Clean the entire container text
            if (!explanation) {
              const containerText = container.textContent || '';
              if (containerText.length > 100) {
                explanation = containerText
                  .replace(new RegExp(partyName, 'gi'), '')
                  .replace(/[\n\r\t]+/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim()
                  .substring(0, 500);
              }
            }
            
            return explanation;
          };
        });
        
        console.log(`✅ Found ${partyData.length} party positions for question ${questionNumber}`);
        
        // Step 4: Store the extracted data
        if (partyData.length > 0) {
          const statementId = questionNumber + 79000;
          const statementParties = { agree: [], neither: [], disagree: [] };
          
          partyData.forEach(party => {
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
            
            // Add to global parties collection
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
            title: questionText,
            accessibility: { moreInfo: { text: questionText } },
            moreInfo: { title: "", text: questionText, imageAlt: "Afbeelding" },
            isShootout: false,
            index: questionNumber,
            parties: statementParties
          });
          
          console.log(`💾 Question ${questionNumber} data saved successfully!`);
          
          // Show party breakdown
          console.log(`   📊 EENS: ${statementParties.agree.length} parties`);
          console.log(`   📊 GEEN VAN BEIDE: ${statementParties.neither.length} parties`);
          console.log(`   📊 ONEENS: ${statementParties.disagree.length} parties`);
        } else {
          console.log(`⚠️ No party data found for question ${questionNumber}`);
        }
        
        // Step 5: Navigate to next question
        console.log("4️⃣ Navigating to next question...");
        
        // Go back to main question page first
        await page.goBack();
        await page.waitForTimeout(2000);
        
        // Find and click next button
        const nextClicked = await page.evaluate(() => {
          const nextTexts = ['volgende', 'next', '→', '>', 'verder', 'doorgaan'];
          const buttons = document.querySelectorAll('button, a, [role="button"], .button');
          
          for (const button of buttons) {
            const text = button.textContent?.toLowerCase() || '';
            const href = button.href?.toLowerCase() || '';
            
            if (nextTexts.some(nextText => text.includes(nextText) || href.includes(nextText))) {
              console.log(`Clicking next button: "${button.textContent?.trim()}"`);
              button.click();
              return true;
            }
          }
          
          return false;
        });
        
        if (!nextClicked) {
          console.log("❌ No next button found. Checking if we reached the end...");
          
          // Check if we're at results page
          const isResultsPage = await page.evaluate(() => {
            const content = document.body.textContent.toLowerCase();
            return content.includes('resultaat') || content.includes('stemadvies') || 
                   content.includes('uitslag') || content.includes('resultaten');
          });
          
          if (isResultsPage) {
            console.log("✅ Reached results page. Extraction complete!");
            break;
          } else {
            console.log("❌ Cannot proceed to next question. Stopping extraction.");
            break;
          }
        }
        
        await page.waitForTimeout(3000);
        questionNumber++;
        
      } catch (error) {
        console.error(`❌ Error processing question ${questionNumber}:`, error.message);
        questionNumber++;
        
        if (questionNumber > maxQuestions) {
          console.log("Reached maximum question limit. Stopping.");
          break;
        }
      }
    }
    
    // Final results and file writing
    if (statements.length === 0) {
      throw new Error("No statements were extracted. Please check the questionnaire structure.");
    }
    
    const parties = Array.from(allParties.values());
    
    console.log("\n🎉 EXTRACTION COMPLETED!");
    console.log("========================");
    console.log(`📊 Results:`);
    console.log(`   ✅ ${statements.length} statements extracted`);
    console.log(`   ✅ ${parties.length} unique parties found`);
    console.log(`   ✅ ${parties.reduce((sum, p) => sum + p.statements.length, 0)} total party statements`);
    
    // Write files
    const statementsPath = path.join(OUTPUT_DIR, "statements.json");
    const partiesPath = path.join(OUTPUT_DIR, "parties.json");
    const dataPath = path.join(OUTPUT_DIR, "data.js");
    
    await fs.writeFile(statementsPath, JSON.stringify(statements, null, 4) + "\n", "utf8");
    await fs.writeFile(partiesPath, JSON.stringify(parties, null, 4) + "\n", "utf8");
    await fs.writeFile(dataPath, generateDataModule(statements, parties), "utf8");
    
    console.log(`\n💾 Files saved successfully:`);
    console.log(`   📄 ${statementsPath}`);
    console.log(`   📄 ${partiesPath}`);
    console.log(`   📄 ${dataPath}`);
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await browser.close();
  }
}

scrapeStemwijzer().catch(console.error);