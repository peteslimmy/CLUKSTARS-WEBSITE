import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  firstName: z.string().max(200).optional(),
  lastName: z.string().max(200).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(128),
});

export const twoFactorSchema = z.object({
  token: z.string().length(6),
});

export const organizationSchema = z.object({
  name: z.string().min(1).max(200),
  tagline: z.string().max(500).optional(),
  description: z.string().max(50000).optional(),
  email: z.string().email().max(320).optional(),
  phone: z.string().max(100).optional(),
  phone2: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  officeHours: z.string().max(200).optional(),
  registrationNumber: z.string().max(100).optional(),
  foundedYear: z.number().int().optional(),
});

export const brandSettingsSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  fontHeading: z.string().max(100).optional(),
  fontBody: z.string().max(100).optional(),
  logoUrl: z.string().max(1000).optional(),
  faviconUrl: z.string().max(1000).optional(),
  customCss: z.string().max(100000).optional(),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1).max(100),
  url: z.string().url().max(2000).refine((val) => {
    try {
      const url = new URL(val);
      if (!['https:', 'http:'].includes(url.protocol)) return false;
      if (process.env.NODE_ENV === 'production' && url.protocol === 'http:') return false;
      return true;
    } catch {
      return false;
    }
  }, { message: 'Invalid URL format' }),
  label: z.string().max(200).optional(),
  icon: z.string().max(100).optional(),
  sortOrder: z.number().int().optional(),
});

export const userSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128).optional(),
  firstName: z.string().max(200).optional(),
  lastName: z.string().max(200).optional(),
  roleId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export const roleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  permissions: z.array(z.object({
    resource: z.string().max(100),
    action: z.string().max(100),
  })),
});

export const pageSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  metaTitle: z.string().max(200).optional(),
  metaDesc: z.string().max(500).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  template: z.string().max(100).optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  excerpt: z.string().max(2000).optional(),
  content: z.string().max(100000).optional(),
  coverImageUrl: z.string().max(1000).optional(),
  author: z.string().max(200).optional(),
  tags: z.string().max(2000).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const navbarSettingsSchema = z.object({
  links: z.string().max(50000).optional(),
  style: z.string().max(100).optional(),
});

export const footerSettingsSchema = z.object({
  columns: z.string().max(50000).optional(),
  copyright: z.string().max(2000).optional(),
});

export const seoSettingsSchema = z.object({
  defaultTitle: z.string().max(200).optional(),
  defaultDesc: z.string().max(1000).optional(),
  ogImageUrl: z.string().max(1000).optional(),
  googleAnalyticsId: z.string().max(100).optional(),
  metaJson: z.string().max(50000).optional(),
});

export const teamMemberSchema = z.object({
  firstName: z.string().min(1).max(200),
  lastName: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  bio: z.string().max(50000).optional(),
  photoUrl: z.string().max(1000).optional(),
  email: z.string().email().max(320).optional().or(z.literal('')),
  tags: z.string().max(2000).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const serviceCategorySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(50000).optional(),
  icon: z.string().max(100).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const serviceSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(50000).optional(),
  icon: z.string().max(100).optional(),
  imageUrl: z.string().max(1000).optional(),
  categoryId: z.string().max(100).optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const caseStudySchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  client: z.string().max(200).optional(),
  excerpt: z.string().max(2000).optional(),
  content: z.string().max(100000).optional(),
  coverImageUrl: z.string().max(1000).optional(),
  result: z.string().max(2000).optional(),
  sector: z.string().max(200).optional(),
  metrics: z.string().max(50000).optional(),
  tags: z.string().max(2000).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const homepageStatSchema = z.object({
  number: z.string().min(1).max(50),
  symbol: z.string().max(50).optional(),
  label: z.string().min(1).max(200),
  italicText: z.string().max(200).optional(),
  explanationTitle: z.string().max(200).optional(),
  explanationText: z.string().max(5000).optional(),
  highlights: z.string().max(50000).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const aboutValueSchema = z.object({
  icon: z.string().max(100).optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(50000).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const aboutStatSchema = z.object({
  number: z.string().min(1).max(50),
  label: z.string().min(1).max(200),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const globalBlockSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.string().max(100).optional(),
  content: z.string().max(100000).optional(),
});

export const formSubmissionSchema = z.object({
  formType: z.string().max(100).optional(),
  name: z.string().max(200).optional(),
  email: z.string().email().max(320).optional(),
  phone: z.string().max(100).optional(),
  message: z.string().max(10000).optional(),
  data: z.string().max(50000).optional(),
  status: z.enum(['UNREAD', 'READ', 'REPLIED', 'SPAM']).optional(),
});