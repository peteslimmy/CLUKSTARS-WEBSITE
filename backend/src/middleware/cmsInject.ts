import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';
import prisma from '../lib/prisma';

const PROJECT_ROOT = path.resolve(__dirname, '../../..');

export async function cmsInject(req: Request, res: Response, next: NextFunction) {
  if (!req.path.endsWith('.html')) return next();

  const filePath = path.join(PROJECT_ROOT, req.path);
  try {
    await fs.access(filePath);
  } catch {
    return next();
  }

  try {
    const [
      organization, brand, navbar, footer, seo, socialLinks,
      teamMembers, serviceCategories, caseStudies, blogPosts,
      homepageStats, aboutValues, aboutStats, globalBlocks,
    ] = await Promise.all([
      prisma.organization.findFirst(),
      prisma.brandSettings.findFirst(),
      prisma.navbarSettings.findFirst(),
      prisma.footerSettings.findFirst(),
      prisma.sEOSettings.findFirst(),
      prisma.socialLink.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.teamMember.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.serviceCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          services: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: { features: { orderBy: { sortOrder: 'asc' } } },
          },
        },
      }),
      prisma.caseStudy.findMany({ where: { status: 'PUBLISHED' }, orderBy: { publishedAt: 'desc' } }),
      prisma.blogPost.findMany({ where: { status: 'PUBLISHED' }, orderBy: { publishedAt: 'desc' } }),
      prisma.homepageStat.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.aboutValue.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.aboutStat.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.globalBlock.findMany({ orderBy: { name: 'asc' } }),
    ]);

    if (navbar && typeof navbar.links === 'string') {
      try { navbar.links = JSON.parse(navbar.links); } catch {}
    }
    if (footer && typeof footer.columns === 'string') {
      try { footer.columns = JSON.parse(footer.columns); } catch {}
    }
    const cmsData = { organization, brand, navbar, footer, seo, socialLinks, teamMembers, serviceCategories, caseStudies, blogPosts, homepageStats, aboutValues, aboutStats, globalBlocks };

    let html = await fs.readFile(filePath, 'utf-8');

    const injectScript = `<script>window.__CMS__ = ${JSON.stringify(cmsData)};</script>`;

    const applyScript = `
<script>
(function(){
  const cms = window.__CMS__;
  if (!cms) return;
  if (cms.brand) {
    const root = document.documentElement;
    if (cms.brand.primaryColor) root.style.setProperty('--cms-primary', cms.brand.primaryColor);
    if (cms.brand.secondaryColor) root.style.setProperty('--cms-secondary', cms.brand.secondaryColor);
    if (cms.brand.accentColor) root.style.setProperty('--cms-accent', cms.brand.accentColor);
    if (cms.brand.fontHeading) root.style.setProperty('--cms-font-heading', cms.brand.fontHeading);
    if (cms.brand.fontBody) root.style.setProperty('--cms-font-body', cms.brand.fontBody);
    if (cms.brand.faviconUrl) {
      const el = document.querySelector('link[rel="icon"]');
      if (el) el.href = cms.brand.faviconUrl;
    }
    if (cms.brand.logoUrl) {
      document.querySelectorAll('img[src*="logocluc"]').forEach(function(img) {
        img.setAttribute('src', cms.brand.logoUrl);
      });
    }
    if (cms.brand.customCss) {
      const s = document.createElement('style');
      s.textContent = cms.brand.customCss;
      document.head.appendChild(s);
    }
  }
  if (cms.seo) {
    if (cms.seo.defaultTitle) document.title = cms.seo.defaultTitle;
    const metas = [
      ['description', cms.seo.defaultDescription],
      ['og:title', cms.seo.defaultTitle],
      ['og:description', cms.seo.defaultDescription],
      ['og:image', cms.seo.ogImage],
      ['twitter:title', cms.seo.defaultTitle],
      ['twitter:description', cms.seo.defaultDescription],
      ['twitter:image', cms.seo.ogImage],
    ];
    metas.forEach(function(m){
      if (!m[1]) return;
      const el = document.querySelector('meta[name="'+m[0]+'"], meta[property="'+m[0]+'"]');
      if (el) el.setAttribute('content', m[1]);
    });
    if (cms.seo.gaId) {
      var ga = document.createElement('script');
      ga.async = true;
      ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + cms.seo.gaId;
      document.head.appendChild(ga);
      var gi = document.createElement('script');
      gi.textContent = 'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag("js",new Date());gtag("config","'+cms.seo.gaId+'");';
      document.head.appendChild(gi);
    }
  }
  if (cms.organization && cms.organization.foundedYear) {
    const el = document.querySelector('[data-cms-year]');
    if (el) el.textContent = cms.organization.foundedYear;
  }
})();
</script>`;

    html = html.replace('</head>', injectScript + '</head>');
    html = html.replace('</body>', applyScript + '</body>');

    res.type('html').send(html);
  } catch (err) {
    console.error('CMS inject error:', err);
    next();
  }
}
