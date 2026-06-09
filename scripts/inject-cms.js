/**
 * Build-time CMS injection script for Netlify deployment.
 * Fetches CMS data from the production API and injects it into HTML files.
 * Falls back gracefully if the API is unreachable.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.CMS_API_URL || 'https://clukstars-api.onrender.com';
const HTML_FILES = [
  'index.html', 'about.html', 'services.html', 'blog.html',
  'case-studies.html', 'team.html', 'terms.html', 'privacy.html',
  'contact.html',
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); } catch (e) { reject(new Error('Invalid JSON')); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject).on('timeout', function() { this.destroy(); reject(new Error('Timeout')); });
  });
}

function injectCmsData(html, cmsData) {
  const script = `<script>window.__CMS__ = ${JSON.stringify(cmsData)};</script>`;
  if (html.includes('</head>')) {
    html = html.replace('</head>', script + '</head>');
  } else {
    html = script + html;
  }
  return html;
}

async function main() {
  console.log(`\n🔌 Injecting CMS data from ${API_BASE}...\n`);

  let cmsData;
  try {
    cmsData = await fetch(`${API_BASE}/api/public/cms-data`);
    console.log('✓ Fetched CMS data from API');
  } catch (err) {
    console.warn(`⚠️  Could not fetch CMS data: ${err.message}`);
    console.warn('⚠️  Using empty defaults — CMS-driven content will not render');
    cmsData = {};
  }

  let injected = 0;
  let errors = 0;

  for (const file of HTML_FILES) {
    const filePath = path.resolve(file);
    try {
      let html = fs.readFileSync(filePath, 'utf-8');
      html = injectCmsData(html, cmsData);
      fs.writeFileSync(filePath, html, 'utf-8');
      console.log(`  ✓ ${file}`);
      injected++;
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n✅ Done: ${injected} files injected, ${errors} errors\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
