import { PrismaClient } from '@prisma/client';
import { seedRbacData } from '../src/prisma/seeds/rbac.seed';
import { seedApplicationData } from '../src/prisma/seeds/application.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('开始数据库种子初始化...');

  // 初始化RBAC权限系统
  await seedRbacData(prisma);

  // 初始化应用列表
  await seedApplicationData(prisma);

  console.log('数据库种子初始化完成！');
}

main()
  .catch((e) => {
    console.error('种子初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
