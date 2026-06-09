import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getCmsData(_req: Request, res: Response) {
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

    res.json(cmsData);
  } catch (err) {
    console.error('getCmsData error:', err);
    res.status(500).json({ error: 'Failed to fetch CMS data' });
  }
}
