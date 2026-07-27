#!/usr/bin/env node

import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, extname, resolve, basename, sep } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'dist');

// Read package.json for version
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let port = null;
  let targetFile = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-p' || args[i] === '--port') {
      port = parseInt(args[i + 1], 10);
      i++; // Skip next arg
    } else if (args[i] === '-h' || args[i] === '--help') {
      console.log(`
  datacontract-editor v${pkg.version}

  Usage: datacontract-editor [options] [file]

  Options:
    -p, --port <port>  Port to run the server on (default: auto-detect from 9090)
    -h, --help         Show this help message

  Examples:
    datacontract-editor                    # Start editor without a file
    datacontract-editor datacontract.yaml  # Edit a specific file
    datacontract-editor -p 3000 my.yaml    # Use a specific port
`);
      process.exit(0);
    } else if (!args[i].startsWith('-')) {
      targetFile = args[i];
    }
  }

  return { port, targetFile };
}

const { port: requestedPort, targetFile } = parseArgs();

// Resolve target file path if provided
let targetFilePath = null;
let targetFileName = null;
let isNewFile = false;
if (targetFile) {
  targetFilePath = resolve(process.cwd(), targetFile);
  targetFileName = basename(targetFile);

  // Validate it's a YAML file
  if (!targetFile.endsWith('.yaml') && !targetFile.endsWith('.yml')) {
    console.error('Error: File must be a YAML file (.yaml or .yml)');
    process.exit(1);
  }

  // Create empty file if it doesn't exist
  if (!existsSync(targetFilePath)) {
    writeFileSync(targetFilePath, '', 'utf-8');
    isNewFile = true;
  }
}

// MIME types for static files
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.yaml': 'text/yaml',
  '.yml': 'text/yaml'
};

// Check if dist directory exists
if (!existsSync(distDir)) {
  console.error('Error: dist/ directory not found.');
  console.error('Please run "npm run build" first.');
  process.exit(1);
}

// Check if index.html exists
const indexPath = join(distDir, 'index.html');
if (!existsSync(indexPath)) {
  console.error('Error: dist/index.html not found.');
  console.error('Please run "npm run build" first.');
  process.exit(1);
}

// Find available port
async function findPort(start = 9090) {
  const net = await import('net');

  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(start, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(findPort(start + 1));
    });
  });
}

// Helper to send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Resolve a request path against dist/ and return it only if it stays inside.
// Returns null for traversal attempts and malformed percent-encoding.
function resolveWithinDist(url) {
  let decoded;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    return null; // malformed percent-encoding
  }

  if (decoded.includes('\0')) return null;

  const candidate = resolve(distDir, '.' + (decoded.startsWith('/') ? decoded : '/' + decoded));
  if (candidate !== distDir && !candidate.startsWith(distDir + sep)) return null;

  return candidate;
}

// The server is only ever meant to be reached by a browser on this machine.
// Requiring a loopback Host blocks DNS rebinding, where a page on an attacker
// domain resolves that domain to 127.0.0.1 and then talks to us same-origin.
function isLocalRequest(req) {
  const host = (req.headers.host || '').replace(/:\d+$/, '').replace(/^\[|\]$/g, '');
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

// Helper to read request body
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

// Generate CLI-specific index.html with injected config
function generateCliIndexHtml() {
  const baseHtml = readFileSync(indexPath, 'utf-8');

  // The filename comes from argv and can contain quotes or '</script>', so every
  // injection point below goes through JSON.stringify rather than raw
  // interpolation. encodeURIComponent alone is not enough: it leaves apostrophes
  // untouched, which is enough to break out of a single-quoted string literal.
  const fileUrl = JSON.stringify('/api/files/' + encodeURIComponent(targetFileName));
  const fileNameLiteral = JSON.stringify(targetFileName);

  // Replace the init call with CLI-specific configuration
  const cliInitScript = `
      import { init } from './datacontract-editor.es.js';

      // CLI mode: Auto-load file from local server
      async function initCli() {
        try {
          // Fetch the file content from CLI server
          const response = await fetch(${fileUrl});
          if (!response.ok) {
            throw new Error('Failed to load file: ' + response.statusText);
          }
          const yaml = await response.text();

          init({
            container: '#root',
            mode: 'CLI',
            yaml: yaml,
            persistence: 'none',
            initialView: 'form',
            onSave: async (yamlContent) => {
              const saveResponse = await fetch(${fileUrl}, {
                method: 'PUT',
                headers: { 'Content-Type': 'text/yaml' },
                body: yamlContent
              });
              if (!saveResponse.ok) {
                throw new Error('Failed to save file');
              }
              console.log('File saved successfully');
            }
          });

          console.log('CLI mode: Loaded ' + ${fileNameLiteral});
        } catch (error) {
          console.error('Failed to initialize CLI mode:', error);
          alert('Failed to load file: ' + error.message);
        }
      }

      initCli();
    `;

  // Replace the existing init script
  const modifiedHtml = baseHtml.replace(
    /<script type="module">[\s\S]*?<\/script>/,
    `<script type="module">${cliInitScript}</script>`
  );

  return modifiedHtml;
}

// Create HTTP server
const server = createServer(async (req, res) => {
  let url = req.url.split('?')[0]; // Remove query string
  const method = req.method;

  if (!isLocalRequest(req)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // The editor is served from this same origin, so it never needs CORS. Not
  // answering preflights is what stops another site from PUTing over the file
  // being edited.
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve modified index.html for CLI mode
  if (targetFilePath && (url === '/' || url === '/index.html')) {
    try {
      const cliHtml = generateCliIndexHtml();
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(cliHtml);
      return;
    } catch (err) {
      console.error('Failed to generate CLI index.html:', err);
      res.writeHead(500);
      res.end('Server Error');
      return;
    }
  }

  // API Routes (only available in CLI mode with a target file)
  if (url.startsWith('/api/')) {
    // Health check - always available
    if (url === '/api/health' && method === 'GET') {
      sendJson(res, 200, { status: 'ok', version: pkg.version });
      return;
    }

    // Config endpoint - returns CLI mode info
    if (url === '/api/config' && method === 'GET') {
      if (targetFilePath) {
        sendJson(res, 200, {
          mode: 'CLI',
          filename: targetFileName,
          filepath: targetFilePath
        });
      } else {
        // No file specified - not in CLI mode
        sendJson(res, 200, { mode: null });
      }
      return;
    }

    // File operations - only available when a target file is specified
    if (url.startsWith('/api/files/')) {
      const requestedFile = decodeURIComponent(url.replace('/api/files/', ''));

      // Security check: only allow access to the specified target file
      if (!targetFilePath || requestedFile !== targetFileName) {
        sendJson(res, 403, { error: 'Access denied. Only the specified target file can be accessed.' });
        return;
      }

      // GET - Read file
      if (method === 'GET') {
        try {
          const content = readFileSync(targetFilePath, 'utf-8');
          res.writeHead(200, { 'Content-Type': 'text/yaml' });
          res.end(content);
        } catch (err) {
          sendJson(res, 500, { error: 'Failed to read file', details: err.message });
        }
        return;
      }

      // PUT - Write file
      if (method === 'PUT') {
        try {
          const content = await readBody(req);
          writeFileSync(targetFilePath, content, 'utf-8');
          sendJson(res, 200, { success: true, filename: targetFileName });
        } catch (err) {
          sendJson(res, 500, { error: 'Failed to write file', details: err.message });
        }
        return;
      }
    }

    // Unknown API route
    sendJson(res, 404, { error: 'Not found' });
    return;
  }

  // Default to index.html for root
  if (url === '/') {
    url = '/index.html';
  }

  // Resolve the request path inside dist/ and refuse anything that escapes it.
  // req.url is attacker-controlled and is not normalized by Node, so a client
  // that does not collapse '..' itself (curl --path-as-is) could otherwise read
  // any file on the machine.
  const safePath = resolveWithinDist(url);
  if (!safePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  let filePath = safePath;
  const ext = extname(filePath).toLowerCase();

  // If no extension, serve index.html (SPA routing)
  if (!ext && !existsSync(filePath)) {
    filePath = indexPath;
  }

  // Try to serve the file
  if (existsSync(filePath)) {
    try {
      const content = readFileSync(filePath);
      const contentType = mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (err) {
      res.writeHead(500);
      res.end('Server Error');
    }
  } else {
    // For SPA, serve index.html for unknown routes
    try {
      const content = readFileSync(indexPath);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    } catch (err) {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
});

// Start server
async function start() {
  const port = requestedPort || await findPort(9090);
  const url = `http://localhost:${port}`;

  // Bind to loopback only: this server exposes local files and has no auth,
  // so it must not be reachable from the network.
  server.listen(port, '127.0.0.1', async () => {
    console.log(`
  datacontract-editor v${pkg.version}

  Server running at ${url}${targetFileName ? `
  ${isNewFile ? 'Creating' : 'Editing'}: ${targetFileName}` : ''}

  Press Ctrl+C to stop
`);

    // Open browser
    try {
      const open = (await import('open')).default;
      await open(url);
    } catch (err) {
      console.log(`  Could not open browser automatically.`);
      console.log(`  Please open ${url} manually.\n`);
    }
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n  Shutting down...\n');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});

start();
