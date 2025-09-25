import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Ensure settings exist
  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: { referralBonusKES: 100, activationFeeKES: 300, withdrawDay: 'Friday' }
  });

  // Create an admin user (login with phone "admin" for admin routes)
  const adminPass = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { phone: 'admin' },
    update: {},
    create: {
      fullName: 'Administrator',
      phone: 'admin',
      passwordHash: adminPass,
      referralCode: '99999999',
      isActive: true,
      level: 'Leader'
    }
  });

  console.log('Seed complete');
}

main().finally(async () => {
  await prisma.$disconnect();
});
