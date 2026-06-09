# CLUKSTARS WEBSITE

Full-stack CMS-powered website with hybrid HTML + React architecture, featuring a visual page builder and comprehensive admin dashboard.

## 🚀 Features

### Public Website
- **9 HTML Pages**: Home, About, Services, Team, Case Studies, Blog, Contact, Privacy, Terms
- **CMS Injection**: All pages dynamically populated via `window.__CMS__` middleware
- **Mobile Responsive**: Tailwind CSS with adaptive layouts
- **SEO Optimized**: Meta tags, Open Graph, structured data
- **Performance**: Static HTML served via Express with CMS data injection

### Admin Dashboard
- **Authentication**: JWT-based with role-based access control (RBAC)
- **User Management**: Multi-user support with granular permissions
- **Content Management**:
  - Organization settings
  - Brand customization (colors, fonts, logo)
  - Navigation (navbar, footer)
  - Team members
  - Services & categories
  - Case studies
  - Blog posts
  - Homepage stats
  - About values/stats
  - Global content blocks
- **Visual Page Builder**: Drag-and-drop sections and blocks with rich text editing
- **Media Library**: File upload with automatic optimization

### Technical Stack
- **Backend**: Node.js + Express + TypeScript + Prisma + SQLite
- **Frontend**: React 19 + Vite + Tailwind CSS 4 + DnD Kit
- **Admin UI**: Custom React SPA with hot reload
- **Database**: SQLite (dev) / PostgreSQL (production ready)
- **Deployment**: PM2 + Nginx + SSL (Certbot)

## 📁 Project Structure

```
CLUKSTARS/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, CMS inject, error handling
│   │   ├── routes/         # API endpoints
│   │   ├── validators/     # Zod schemas
│   │   └── index.ts        # Entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Auto-generated migrations
│   ├── uploads/            # User uploads
│   └── dist/               # Compiled JS (production)
├── admin/                   # React admin SPA
│   ├── src/
│   │   ├── components/     # Reusable UI
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Admin pages
│   │   └── lib/            # API client
│   ├── public/
│   └── dist/               # Built SPA (production)
├── *.html                   # Public website pages (9 files)
├── ecosystem.config.js      # PM2 configuration
├── deploy-nginx.conf        # Nginx config template
└── DEPLOY.md                # Deployment guide
```

## 🛠️ Development

### Prerequisites
- Node.js 20+
- npm or yarn
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/peteslimmy/CLUKSTARS-WEBSITE.git
cd CLUKSTARS-WEBSITE

# Backend setup
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma generate
node seed-permissions.js
node seed-cms-data.js
node seed-sections-permissions.js
npm run dev  # Runs on http://localhost:4000

# Admin setup (new terminal)
cd admin
npm install
npm run dev  # Runs on http://localhost:5173
```

### Default Login
- **Email**: `admin@clukstars.com`
- **Password**: `Admin@123456`

### Available Scripts

**Backend** (`backend/`):
```bash
npm run dev        # Development with hot reload
npm run build      # Compile TypeScript
npm start          # Run production server
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database
```

**Admin** (`admin/`):
```bash
npm run dev        # Development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # ESLint check
```

## 🌐 Production Deployment

### Quick Deploy (VPS)

See full guide in [`DEPLOY.md`](./DEPLOY.md)

```bash
# SSH to VPS
ssh root@your-server-ip

# Clone and setup
cd /var/www
git clone https://github.com/peteslimmy/CLUKSTARS-WEBSITE.git
cd CLUKSTARS-WEBSITE

# Backend
cd backend && npm ci && npm run build
npx prisma migrate deploy
cp .env.example .env.production  # Edit with production values

# Admin
cd ../admin && npm ci && npm run build

# PM2 + Nginx
cd ..
mkdir -p pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Nginx (copy deploy-nginx.conf to /etc/nginx/sites-available/)
sudo ln -s /etc/nginx/sites-available/clukstars /etc/nginx/sites-enabled/
sudo certbot --nginx -d www.clukstars.com
```

### Environment Variables

Copy `.env.production.example` to `.env.production`:

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=file:./backend/prisma/prod.db
JWT_SECRET=<generate-strong-random-64-char-key>
JWT_REFRESH_SECRET=<generate-strong-random-64-char-key>
CORS_ORIGIN=https://www.clukstars.com
```

### CI/CD (GitHub Actions)

The workflow in `.github/workflows/deploy.yml` automatically:
1. Builds backend and admin on push to `main`
2. Deploys to VPS via SSH
3. Runs health checks

**Required GitHub Secrets**:
- `VPS_HOST`: Your server IP
- `VPS_USERNAME`: SSH username (e.g., `root`)
- `VPS_SSH_KEY`: Private SSH key
- `VPS_PORT`: SSH port (default: 22)

## 📊 Database Schema

### Core Models
- `User` - Admin users with roles
- `Role` - RBAC roles with permissions
- `Permission` - Resource + action pairs
- `Page` - CMS pages with sections/blocks
- `PageSection` - Visual page sections
- `PageBlock` - Content blocks within sections

### Content Models
- `Organization` - Company info
- `BrandSettings` - Visual identity
- `Navbar` / `Footer` - Navigation
- `TeamMember` - Staff profiles
- `Service` / `ServiceCategory` - Offerings
- `CaseStudy` - Project showcases
- `BlogPost` - News/articles
- `HomepageStat` / `AboutValue` / `AboutStat` - Content blocks
- `GlobalBlock` - Reusable sections
- `FormSubmission` - Contact form entries
- `Media` - File library

## 🔒 Security

- **JWT Authentication**: Access + refresh tokens
- **RBAC**: Granular permissions per resource/action
- **Helmet**: Security headers (CSP, X-Frame-Options, etc.)
- **Rate Limiting**: 100 requests / 15min per IP
- **CORS**: Locked to production domain
- **Input Validation**: Zod schemas on all endpoints
- **File Upload**: Type validation + size limits
- **SQL Injection Prevention**: Prisma ORM with parameterized queries

## 📈 Performance

- **Static HTML**: Root pages served directly
- **CMS Injection**: Middleware populates `window.__CMS__`
- **Vite Build**: Optimized admin bundle
- **PM2**: Process manager with auto-restart
- **Nginx**: Reverse proxy with SSL termination
- **Optional Redis**: Caching layer (not enabled by default)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Proprietary - All rights reserved.

## 📞 Support

- **GitHub**: https://github.com/peteslimmy/CLUKSTARS-WEBSITE
- **Email**: admin@clukstars.com
- **Website**: https://www.clukstars.com

---

**Built with ❤️ by CLUKSTARS Team**