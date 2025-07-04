# Screenshot API

A Node.js Express API service that generates screenshots of web pages using Puppeteer.

## Features

- Take screenshots of any publicly accessible website
- Customizable viewport dimensions
- PNG format output
- Comprehensive error handling
- Optimized for cloud deployment

## API Endpoints

### Health Check
```
GET /
```
Returns API status and version information.

### Screenshot
```
GET /screenshot?url=<URL>&width=<WIDTH>&height=<HEIGHT>
```

**Parameters:**
- `url` (required): The URL of the website to screenshot
- `width` (optional): Viewport width in pixels (default: 1200, range: 100-4000)
- `height` (optional): Viewport height in pixels (default: 800, range: 100-4000)

**Example:**
```
GET /screenshot?url=https://example.com&width=1200&height=800
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Test the API:
```bash
curl "http://localhost:3000/screenshot?url=https://example.com&width=1200&height=800" --output screenshot.png
```

## Deployment

This service is configured for deployment on Render.com with the included `render.yaml` configuration file.

## Environment Variables

- `NODE_ENV`: Set to 'production' for production deployment
- `PORT`: Port number (automatically set by Render)

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success - returns PNG image
- `400`: Bad request - invalid URL or parameters
- `408`: Request timeout - page took too long to load
- `500`: Internal server error

## Resource Management

The service automatically manages Puppeteer browser instances and includes proper cleanup to prevent memory leaks.