const express = require("express");
const puppeteer = require("puppeteer");
const router = express.Router();

router.get("/nse-live-data", async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true, 
      args: [
        "--no-sandbox", 
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--disable-dev-shm-usage",
        "--no-first-run",
        "--disable-gpu"
      ]
    });
    
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log("🌐 Navigating to NSE...");
    await page.goto("https://www.nseindia.com/market-data/live-equity-market", {
      waitUntil: "networkidle0",
      timeout: 30000
    });

    // Wait for the table to load
    console.log("⏰ Waiting for table to load...");
    await page.waitForSelector('table', { timeout: 20000 });
    
    // Additional wait for dynamic content
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Extract data with proper table structure
    const tableData = await page.evaluate(() => {
      // Find the main data table - NSE typically has the stock data in a specific table
      const tables = document.querySelectorAll('table');
      let stockData = [];
      
      // Try to find the table with stock data
      for (let table of tables) {
        const rows = table.querySelectorAll('tbody tr');
        if (rows.length > 10) { // Stock table should have many rows
          rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 7) { // Stock rows should have multiple columns
              const rowData = [];
              
              // Extract text from each cell
              cells.forEach(cell => {
                let text = cell.innerText.trim();
                // Clean up the text - remove extra whitespace and line breaks
                text = text.replace(/\s+/g, ' ').trim();
                if (text) {
                  rowData.push(text);
                }
              });
              
              // Only add rows that have substantial data
              if (rowData.length >= 6) {
                stockData.push(rowData);
              }
            }
          });
          
          // If we found stock data, break
          if (stockData.length > 0) {
            break;
          }
        }
      }
      
      return stockData;
    });

    // If no properly structured data found, try alternative approach
    if (tableData.length === 0) {
      console.log("🔄 Trying alternative data extraction...");
      
      const alternativeData = await page.evaluate(() => {
        // Look for any table with financial data patterns
        const allRows = document.querySelectorAll('tr');
        const stockRows = [];
        
        allRows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 6) {
            const rowData = Array.from(cells).map(cell => {
              return cell.innerText.trim().replace(/\s+/g, ' ');
            });
            
            // Check if this looks like stock data (has numbers, percentages, etc.)
            const hasStockPattern = rowData.some(cell => 
              /^\d+\.\d+$/.test(cell) || // Decimal numbers
              /^-?\d+\.\d+%?$/.test(cell) || // Percentages or negative numbers
              /^[A-Z]{2,}$/.test(cell) // Stock symbols
            );
            
            if (hasStockPattern && rowData.length >= 6) {
              stockRows.push(rowData);
            }
          }
        });
        
        return stockRows;
      });
      
      if (alternativeData.length > 0) {
        console.log(`✅ Alternative method found ${alternativeData.length} rows`);
        return res.json({ 
          tableData: alternativeData,
          timestamp: new Date().toISOString(),
          totalRows: alternativeData.length,
          method: "alternative"
        });
      }
    }

    // Clean and validate the data
    const cleanedData = tableData.map(row => {
      return row.map(cell => {
        // Remove extra spaces and clean up formatting
        return cell.replace(/\s+/g, ' ').trim();
      });
    }).filter(row => {
      // Filter out rows that don't look like stock data
      return row.length >= 6 && row.some(cell => /\d/.test(cell));
    });

    console.log(`✅ Successfully extracted ${cleanedData.length} rows of stock data`);
    
    if (cleanedData.length === 0) {
      throw new Error("No valid stock data found in table");
    }

    res.json({ 
      tableData: cleanedData,
      timestamp: new Date().toISOString(),
      totalRows: cleanedData.length,
      method: "standard"
    });

  } catch (err) {
    console.error("❌ NSE scrape error:", err.message);
    res.status(500).json({ 
      error: "Failed to scrape NSE data", 
      details: err.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

module.exports = router;