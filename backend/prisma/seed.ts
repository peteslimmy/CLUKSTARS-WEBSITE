import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISSIONS_LIST = [
  { resource: 'organization', action: 'read' },
  { resource: 'organization', action: 'update' },
  { resource: 'brand', action: 'read' },
  { resource: 'brand', action: 'update' },
  { resource: 'social', action: 'create' },
  { resource: 'social', action: 'read' },
  { resource: 'social', action: 'update' },
  { resource: 'social', action: 'delete' },
  { resource: 'users', action: 'list' },
  { resource: 'users', action: 'read' },
  { resource: 'users', action: 'create' },
  { resource: 'users', action: 'update' },
  { resource: 'users', action: 'delete' },
  { resource: 'roles', action: 'list' },
  { resource: 'roles', action: 'read' },
  { resource: 'roles', action: 'create' },
  { resource: 'roles', action: 'update' },
  { resource: 'roles', action: 'delete' },
  { resource: 'pages', action: 'list' },
  { resource: 'pages', action: 'read' },
  { resource: 'pages', action: 'create' },
  { resource: 'pages', action: 'update' },
  { resource: 'pages', action: 'delete' },
  { resource: 'blog', action: 'list' },
  { resource: 'blog', action: 'read' },
  { resource: 'blog', action: 'create' },
  { resource: 'blog', action: 'update' },
  { resource: 'blog', action: 'delete' },
  { resource: 'media', action: 'list' },
  { resource: 'media', action: 'read' },
  { resource: 'media', action: 'create' },
  { resource: 'media', action: 'delete' },
  { resource: 'forms', action: 'list' },
  { resource: 'forms', action: 'read' },
  { resource: 'forms', action: 'update' },
  { resource: 'seo', action: 'read' },
  { resource: 'seo', action: 'update' },
];

async function main() {
  console.log('Seeding database...');

  const adminRole = await prisma.role.create({
    data: {
      name: 'Super Admin',
      description: 'Full system access',
      isSystem: true,
      permissions: {
        create: PERMISSIONS_LIST.map(p => ({
          resource: p.resource,
          action: p.action,
        })),
      },
    },
  });
  console.log('Created Super Admin role');

  const editorRole = await prisma.role.create({
    data: {
      name: 'Editor',
      description: 'Can manage content but not users or settings',
      isSystem: true,
      permissions: {
        create: [
          { resource: 'pages', action: 'list' },
          { resource: 'pages', action: 'read' },
          { resource: 'pages', action: 'create' },
          { resource: 'pages', action: 'update' },
          { resource: 'blog', action: 'list' },
          { resource: 'blog', action: 'read' },
          { resource: 'blog', action: 'create' },
          { resource: 'blog', action: 'update' },
          { resource: 'media', action: 'list' },
          { resource: 'media', action: 'read' },
          { resource: 'media', action: 'create' },
          { resource: 'forms', action: 'list' },
          { resource: 'forms', action: 'read' },
          { resource: 'forms', action: 'update' },
        ],
      },
    },
  });
  console.log('Created Editor role');

  const viewerRole = await prisma.role.create({
    data: {
      name: 'Viewer',
      description: 'Read-only access to content',
      isSystem: true,
      permissions: {
        create: [
          { resource: 'pages', action: 'list' },
          { resource: 'pages', action: 'read' },
          { resource: 'blog', action: 'list' },
          { resource: 'blog', action: 'read' },
          { resource: 'media', action: 'list' },
          { resource: 'media', action: 'read' },
          { resource: 'forms', action: 'list' },
          { resource: 'forms', action: 'read' },
        ],
      },
    },
  });
  console.log('Created Viewer role');

  const passwordHash = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@clukstars.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      roleId: adminRole.id,
      status: 'ACTIVE',
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  await prisma.organization.create({
    data: {
      name: 'CLUKSTARS',
      tagline: 'Empowering Your Digital Future',
      email: 'info@clukstars.com',
      phone: '+234 XXX XXX XXXX',
      address: '33 Parakou Street, Abuja, Nigeria',
    },
  });
  console.log('Created organization');

  await prisma.brandSettings.create({
    data: {
      primaryColor: '#0F172A',
      secondaryColor: '#00897B',
      accentColor: '#38BDF8',
      fontHeading: 'Inter',
      fontBody: 'Inter',
    },
  });
  console.log('Created brand settings');

  await prisma.navbarSettings.create({
    data: {
      links: JSON.stringify([{"label":"Home","href":"/","isActive":true},{"label":"About","href":"/about","isActive":true},{"label":"Services","href":"/services","isActive":true},{"label":"Team","href":"/team","isActive":true},{"label":"Case Studies","href":"/case-studies","isActive":true},{"label":"Blog","href":"/blog","isActive":true},{"label":"Contact","href":"/contact","isActive":true}]),
    },
  });
  console.log('Created navbar settings');

  await prisma.footerSettings.create({
    data: {
      columns: JSON.stringify([{"title":"Company","links":[{"label":"About","href":"/about"},{"label":"Services","href":"/services"},{"label":"Team","href":"/team"},{"label":"Case Studies","href":"/case-studies"}]},{"title":"Support","links":[{"label":"Contact","href":"/contact"},{"label":"Privacy Policy","href":"/privacy"},{"label":"Terms of Service","href":"/terms"}]},{"title":"Connect","links":[{"label":"LinkedIn","href":"#"},{"label":"Twitter","href":"#"}]}]),
      copyright: '© 2024 CLUKSTARS. All rights reserved.',
    },
  });
  console.log('Created footer settings');

  await prisma.sEOSettings.create({
    data: {
      defaultTitle: 'CLUKSTARS - Empowering Your Digital Future',
      defaultDesc: 'CLUKSTARS delivers innovative technology solutions including AI, cloud computing, cybersecurity, and data analytics.',
    },
  });
  console.log('Created SEO settings');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
