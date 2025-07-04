const express = require('express');
const puppeteer = require('puppeteer');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Screenshot API is running!', version: `Node.js v${process.versions.node}` });
});

// Screenshot endpoint
app.get('/screenshot', async (req, res) => {
  let browser = null;
  
  try {
    const { url, width, height } = req.query;
    
    // Validate required parameters
    if (!url) {
      return res.status(400).json({ 
        error: 'Missing required parameter: url' 
      });
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ 
        error: 'Invalid URL format' 
      });
    }
    
    // Parse and validate dimensions
    const viewportWidth = parseInt(width) || 1200;
    const viewportHeight = parseInt(height) || 800;
    
    if (viewportWidth < 100 || viewportWidth > 4000) {
      return res.status(400).json({ 
        error: 'Width must be between 100 and 4000 pixels' 
      });
    }
    
    if (viewportHeight < 100 || viewportHeight > 4000) {
      return res.status(400).json({ 
        error: 'Height must be between 100 and 4000 pixels' 
      });
    }
    
    console.log(`Taking screenshot of ${url} at ${viewportWidth}x${viewportHeight}`);
    
    // Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({
      width: viewportWidth,
      height: viewportHeight,
      deviceScaleFactor: 1
    });
    
    // Set user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to the URL with timeout
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait a bit for dynamic content to load
    await page.waitForTimeout(2000);
    
    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false
    });
    
    // Set appropriate headers for image response
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': screenshot.length,
      'Cache-Control': 'public, max-age=3600',
      'Content-Disposition': `inline; filename="screenshot-${Date.now()}.png"`
    });
    
    // Send the screenshot
    res.send(screenshot);
    
    console.log(`Screenshot completed successfully for ${url}`);
    
  } catch (error) {
    console.error('Screenshot error:', error);
    
    // Handle specific error types
    if (error.name === 'TimeoutError') {
      return res.status(408).json({ 
        error: 'Request timeout - the page took too long to load' 
      });
    }
    
    if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
      return res.status(400).json({ 
        error: 'Invalid URL - unable to resolve domain' 
      });
    }
    
    if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      return res.status(400).json({ 
        error: 'Connection refused - unable to connect to the URL' 
      });
    }
    
    // Generic error response
    res.status(500).json({ 
      error: 'Failed to take screenshot',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
    
  } finally {
    // Clean up browser resources
    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        console.error('Error closing browser:', err);
      }
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    available_endpoints: [
      'GET / - Health check',
      'GET /screenshot?url=<url>&width=<width>&height=<height> - Take screenshot'
    ]
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Screenshot API server running on port ${PORT}`);
  console.log(`Example: http://localhost:${PORT}/screenshot?url=https://example.com&width=1200&height=800`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});