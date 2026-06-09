const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SUPER_ADMIN_ROLE_ID = '24584146-ec8c-4473-bf59-e0d1e62c8aa7';
const NEW_RESOURCES = ['sections', 'blocks'];
const ACTIONS = ['list', 'read', 'create', 'update', 'delete'];

async function seedPermissions() {
  try {
    let addedCount = 0;
    
    for (const resource of NEW_RESOURCES) {
      for (const action of ACTIONS) {
        const existing = await prisma.permission.findUnique({
          where: {
            roleId_resource_action: {
              roleId: SUPER_ADMIN_ROLE_ID,
              resource,
              action,
            },
          },
        });
        
        if (!existing) {
          await prisma.permission.create({
            data: {
              roleId: SUPER_ADMIN_ROLE_ID,
              resource,
              action,
            },
          });
          addedCount++;
        }
      }
    }
    
    console.log(`✓ Added ${addedCount} new permissions (sections, blocks) to Super Admin role`);
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seedPermissions();