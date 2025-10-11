import { chromium } from "playwright";

async function debugStemwijzer() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log("Opening Stemwijzer...");
    await page.goto("https://stemwijzer.nl/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    
    console.log("\n=== DEBUG MODE ===");
    console.log("Navigate to any page with party information and press Enter to see what we can extract...");
    
    await new Promise(resolve => {
      process.stdin.once("data", () => resolve());
    });
    
    console.log("\n=== PAGE ANALYSIS ===");
    
    // Basic page info
    const title = await page.title();
    const url = page.url();
    console.log(`Page title: ${title}`);
    console.log(`Page URL: ${url}`);
    
    // Extract and show content samples
    const pageAnalysis = await page.evaluate(() => {
      const analysis = {
        totalElements: document.querySelectorAll("*").length,
        buttons: [],
        headings: [],
        partyMentions: [],
        textSamples: []
      };
      
      // Find buttons and links
      const buttons = document.querySelectorAll("button, a, [role='button']");
      for (let i = 0; i < Math.min(10, buttons.length); i++) {
        const button = buttons[i];
        const text = button.textContent?.trim();
        if (text && text.length > 0) {
          analysis.buttons.push({
            tag: button.tagName,
            text: text.substring(0, 100),
            href: button.href || null
          });
        }
      }
      
      // Find headings
      const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      for (const heading of headings) {
        const text = heading.textContent?.trim();
        if (text) {
          analysis.headings.push(text.substring(0, 200));
        }
      }
      
      // Look for party names
      const partyNames = ["VVD", "PVV", "CDA", "D66", "GL", "SP", "PvdA", "CU", "PvdD", "FvD", "DENK", "SGP", "VOLT", "JA21", "BBB", "NSC"];
      const bodyText = document.body.textContent.toLowerCase();
      
      for (const party of partyNames) {
        if (bodyText.includes(party.toLowerCase())) {
          analysis.partyMentions.push(party);
        }
      }
      
      // Get some text samples
      const allElements = document.querySelectorAll("p, div, span");
      for (let i = 0; i < Math.min(20, allElements.length); i++) {
        const element = allElements[i];
        const text = element.textContent?.trim();
        if (text && text.length > 50 && text.length < 300) {
          analysis.textSamples.push(text.substring(0, 200));
        }
      }
      
      return analysis;
    });
    
    console.log(`\nTotal elements on page: ${pageAnalysis.totalElements}`);
    
    console.log(`\nButtons/Links found (${pageAnalysis.buttons.length}):`);
    pageAnalysis.buttons.forEach((btn, i) => {
      console.log(`  ${i + 1}. ${btn.tag}: "${btn.text}" ${btn.href ? `(${btn.href})` : ''}`);
    });
    
    console.log(`\nHeadings found (${pageAnalysis.headings.length}):`);
    pageAnalysis.headings.forEach((heading, i) => {
      console.log(`  ${i + 1}. "${heading}"`);
    });
    
    console.log(`\nParty names found: ${pageAnalysis.partyMentions.join(", ")}`);
    
    console.log(`\nText samples (${pageAnalysis.textSamples.length}):`);
    pageAnalysis.textSamples.forEach((text, i) => {
      console.log(`  ${i + 1}. "${text}..."`);
    });
    
    console.log("\n=== END ANALYSIS ===");
    console.log("Press Enter to close browser...");
    
    await new Promise(resolve => {
      process.stdin.once("data", () => resolve());
    });
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

debugStemwijzer().catch(console.error);
