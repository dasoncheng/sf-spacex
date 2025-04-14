import { Application, PrismaClient } from '@prisma/client';

const applicationSeedData: Pick<
  Application,
  'Id' | 'Name' | 'Description' | 'AppKey'
>[] = [
  {
    Id: '89324658-bea8-4716-bf6a-0e19669a87eb',
    Name: 'Forte',
    Description: 'GIF录制应用',
    AppKey: 'e08335861d8cd18126770dd88beff934',
  },
  {
    Id: '0cc19a75-0d0f-4692-95b6-f2b88db96da6',
    Name: 'Lottery',
    Description: '直播间抽奖应用',
    AppKey: '072d1635d4261a76d534e05bb3a36f5b',
  },
];

/**
 * 初始化应用列表的种子数据
 */
export async function seedApplicationData(prisma: PrismaClient) {
  console.log('正在初始化应用列表...');
  for (const item of applicationSeedData) {
    await prisma.application.upsert({
      where: { Id: item.Id },
      update: {},
      create: item,
    });
  }
  console.log('应用列表初始化完成！');
}
