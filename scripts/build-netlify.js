/**
 * Netlify build script.
 * 1. Builds admin SPA
 * 2. Copies HTML files + assets into dist_public/
 * 3. Copies admin build into dist_public/admin/
 * 4. Injects CMS data into HTML files
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist_public');
const ADMIN_DIST = path.join(ROOT, 'admin', 'dist');
const UPLOADS_SRC = path.join(ROOT, 'backend', 'uploads');

const HTML_FILES = [
  'index.html', 'about.html', 'services.html', 'blog.html',
  'case-studies.html', 'team.html', 'terms.html', 'privacy.html',
  'contact.html',
];

const ASSETS = ['favicon.ico', 'robots.txt', 'sitemap.xml'].filter(function(f) {
  return fs.existsSync(path.join(ROOT, f));
});

const CMS_API_URL = process.env.CMS_API_URL || 'https://clukstars-api.onrender.com';

function log(msg) { console.log(msg); }
function warn(msg) { console.warn('⚠️ ', msg); }

// 1. Build admin
log('\n📦 Building admin SPA...');
try {
  execSync('npm ci && npm run build', { cwd: path.join(ROOT, 'admin'), stdio: 'pipe' });
  log('✓ Admin built');
} catch (err) {
  warn('Admin build failed: ' + err.message);
  warn('Proceeding without admin SPA');
}

// 2. Clean and create dist_public
log('\n📁 Preparing dist_public/...');
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}
fs.mkdirSync(DIST, { recursive: true });

// 3. Copy HTML files
for (const file of HTML_FILES) {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DIST, file));
  } else {
    warn(file + ' not found in root');
  }
}

// 4. Copy uploaded assets (logo, favicon)
if (fs.existsSync(UPLOADS_SRC)) {
  const uploadsDest = path.join(DIST, 'uploads');
  fs.mkdirSync(uploadsDest, { recursive: true });
  for (const f of fs.readdirSync(UPLOADS_SRC)) {
    const src = path.join(UPLOADS_SRC, f);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(uploadsDest, f));
    }
  }
  log('✓ Uploads copied');
}

// 5. Copy admin dist
if (fs.existsSync(ADMIN_DIST)) {
  const adminDest = path.join(DIST, 'admin');
  fs.cpSync(ADMIN_DIST, adminDest, { recursive: true });
  log('✓ Admin SPA copied');
}

// 6. Inject CMS data
log('\n🔌 Injecting CMS data from ' + CMS_API_URL + '...');
var cmsData;
try {
  const http = require(CMS_API_URL.startsWith('https') ? 'https' : 'http');
  cmsData = JSON.parse(require('child_process').execSync(
    'curl -s --max-time 10 "' + CMS_API_URL + '/api/public/cms-data"',
    { encoding: 'utf-8', timeout: 15000 }
  ));
  log('✓ Fetched CMS data from API');
} catch (err) {
  warn('Could not fetch CMS data: ' + err.message);
  warn('Using empty defaults — CMS content will not render');
  cmsData = {};
}

for (const file of HTML_FILES) {
  const filePath = path.join(DIST, file);
  if (!fs.existsSync(filePath)) continue;
  try {
    let html = fs.readFileSync(filePath, 'utf-8');
    var script = '<script>window.__CMS__ = ' + JSON.stringify(cmsData) + ';</script>';
    if (html.includes('</head>')) {
      html = html.replace('</head>', script + '</head>');
    } else {
      html = script + html;
    }
    fs.writeFileSync(filePath, html, 'utf-8');
    log('  ✓ ' + file);
  } catch (err) {
    warn('Failed to inject ' + file + ': ' + err.message);
  }
}

log('\n✅ Build complete — dist_public/ ready for publish\n');
