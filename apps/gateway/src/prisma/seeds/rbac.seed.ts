import { PrismaClient } from '@prisma/client';

/**
 * 初始化RBAC权限系统的种子数据
 */
export async function seedRbacData(prisma: PrismaClient) {
  // 创建基本角色
  const adminRole = await prisma.role.upsert({
    where: { Name: 'admin' },
    update: {},
    create: {
      Name: 'admin',
      Description: '系统管理员，拥有所有权限',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { Name: 'user' },
    update: {},
    create: {
      Name: 'user',
      Description: '普通用户，拥有基本权限',
    },
  });

  // 创建用户资源的权限
  const userPermissions = await Promise.all([
    prisma.permission.upsert({
      where: { Name: 'users:create' },
      update: {},
      create: {
        Name: 'users:create',
        Description: '创建用户',
        Resource: 'users',
        Action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'users:read' },
      update: {},
      create: {
        Name: 'users:read',
        Description: '读取用户信息',
        Resource: 'users',
        Action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'users:update' },
      update: {},
      create: {
        Name: 'users:update',
        Description: '更新用户信息',
        Resource: 'users',
        Action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'users:delete' },
      update: {},
      create: {
        Name: 'users:delete',
        Description: '删除用户',
        Resource: 'users',
        Action: 'delete',
      },
    }),
  ]);

  // 创建角色资源的权限
  const rolePermissions = await Promise.all([
    prisma.permission.upsert({
      where: { Name: 'roles:create' },
      update: {},
      create: {
        Name: 'roles:create',
        Description: '创建角色',
        Resource: 'roles',
        Action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'roles:read' },
      update: {},
      create: {
        Name: 'roles:read',
        Description: '读取角色信息',
        Resource: 'roles',
        Action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'roles:update' },
      update: {},
      create: {
        Name: 'roles:update',
        Description: '更新角色信息',
        Resource: 'roles',
        Action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'roles:delete' },
      update: {},
      create: {
        Name: 'roles:delete',
        Description: '删除角色',
        Resource: 'roles',
        Action: 'delete',
      },
    }),
  ]);

  // 创建权限资源的权限
  const permissionPermissions = await Promise.all([
    prisma.permission.upsert({
      where: { Name: 'permissions:create' },
      update: {},
      create: {
        Name: 'permissions:create',
        Description: '创建权限',
        Resource: 'permissions',
        Action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'permissions:read' },
      update: {},
      create: {
        Name: 'permissions:read',
        Description: '读取权限信息',
        Resource: 'permissions',
        Action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'permissions:update' },
      update: {},
      create: {
        Name: 'permissions:update',
        Description: '更新权限信息',
        Resource: 'permissions',
        Action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'permissions:delete' },
      update: {},
      create: {
        Name: 'permissions:delete',
        Description: '删除权限',
        Resource: 'permissions',
        Action: 'delete',
      },
    }),
  ]);

  // 创建应用资源的权限
  const appPermissions = await Promise.all([
    prisma.permission.upsert({
      where: { Name: 'applications:create' },
      update: {},
      create: {
        Name: 'applications:create',
        Description: '创建应用',
        Resource: 'applications',
        Action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'applications:read' },
      update: {},
      create: {
        Name: 'applications:read',
        Description: '读取应用信息',
        Resource: 'applications',
        Action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'applications:update' },
      update: {},
      create: {
        Name: 'applications:update',
        Description: '更新应用信息',
        Resource: 'applications',
        Action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'applications:delete' },
      update: {},
      create: {
        Name: 'applications:delete',
        Description: '删除应用',
        Resource: 'applications',
        Action: 'delete',
      },
    }),
  ]);

  // 创建许可证资源的权限
  const licensePermissions = await Promise.all([
    prisma.permission.upsert({
      where: { Name: 'licenses:create' },
      update: {},
      create: {
        Name: 'licenses:create',
        Description: '创建许可证',
        Resource: 'licenses',
        Action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'licenses:read' },
      update: {},
      create: {
        Name: 'licenses:read',
        Description: '读取许可证信息',
        Resource: 'licenses',
        Action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'licenses:update' },
      update: {},
      create: {
        Name: 'licenses:update',
        Description: '更新许可证信息',
        Resource: 'licenses',
        Action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'licenses:delete' },
      update: {},
      create: {
        Name: 'licenses:delete',
        Description: '删除许可证',
        Resource: 'licenses',
        Action: 'delete',
      },
    }),
  ]);

  // 创建激活记录资源的权限
  const activationPermissions = await Promise.all([
    prisma.permission.upsert({
      where: { Name: 'activations:create' },
      update: {},
      create: {
        Name: 'activations:create',
        Description: '创建激活记录',
        Resource: 'activations',
        Action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'activations:read' },
      update: {},
      create: {
        Name: 'activations:read',
        Description: '读取激活记录信息',
        Resource: 'activations',
        Action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { Name: 'activations:update' },
      update: {},
      create: {
        Name: 'activations:update',
        Description: '更新激活记录信息',
        Resource: 'activations',
        Action: 'update',
      },
    }),
  ]);

  // 为管理员角色分配所有权限
  const allPermissions = [
    ...userPermissions,
    ...rolePermissions,
    ...permissionPermissions,
    ...appPermissions,
    ...licensePermissions,
    ...activationPermissions
  ];

  // 为管理员角色分配所有权限
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        RoleId_PermissionId: {
          RoleId: adminRole.Id,
          PermissionId: permission.Id,
        },
      },
      update: {},
      create: {
        RoleId: adminRole.Id,
        PermissionId: permission.Id,
      },
    });
  }

  // 为普通用户角色分配基本权限（只有读取权限）
  const userBasicPermissions = [
    ...allPermissions.filter(p => p.Name.endsWith(':read')),
    // 添加用户可以创建激活记录的权限
    ...allPermissions.filter(p => p.Name === 'activations:create')
  ];

  for (const permission of userBasicPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        RoleId_PermissionId: {
          RoleId: userRole.Id,
          PermissionId: permission.Id,
        },
      },
      update: {},
      create: {
        RoleId: userRole.Id,
        PermissionId: permission.Id,
      },
    });
  }

  console.log('RBAC 权限系统初始化完成');
}
