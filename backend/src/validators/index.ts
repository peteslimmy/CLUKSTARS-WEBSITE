import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const twoFactorSchema = z.object({
  token: z.string().length(6),
});

export const organizationSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  address: z.string().optional(),
  officeHours: z.string().optional(),
  registrationNumber: z.string().optional(),
  foundedYear: z.number().int().optional(),
});

export const brandSettingsSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  fontHeading: z.string().optional(),
  fontBody: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  customCss: z.string().optional(),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
  label: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  roleId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export const roleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.object({
    resource: z.string(),
    action: z.string(),
  })),
});

export const pageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  template: z.string().optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImageUrl: z.string().optional(),
  author: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const navbarSettingsSchema = z.object({
  links: z.string().optional(),
  style: z.string().optional(),
});

export const footerSettingsSchema = z.object({
  columns: z.string().optional(),
  copyright: z.string().optional(),
});

export const seoSettingsSchema = z.object({
  defaultTitle: z.string().optional(),
  defaultDesc: z.string().optional(),
  ogImageUrl: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  metaJson: z.string().optional(),
});

export const teamMemberSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  title: z.string().min(1),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  tags: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const serviceCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const serviceSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  imageUrl: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const caseStudySchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  client: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImageUrl: z.string().optional(),
  result: z.string().optional(),
  sector: z.string().optional(),
  metrics: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const homepageStatSchema = z.object({
  number: z.string().min(1),
  symbol: z.string().optional(),
  label: z.string().min(1),
  italicText: z.string().optional(),
  explanationTitle: z.string().optional(),
  explanationText: z.string().optional(),
  highlights: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const aboutValueSchema = z.object({
  icon: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const aboutStatSchema = z.object({
  number: z.string().min(1),
  label: z.string().min(1),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const globalBlockSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  content: z.string().optional(),
});

export const formSubmissionSchema = z.object({
  formType: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
  data: z.string().optional(),
  status: z.enum(['UNREAD', 'READ', 'REPLIED', 'SPAM']).optional(),
});
