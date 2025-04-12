import { SetMetadata } from '@nestjs/common';

/**
 * IS_PUBLIC_KEY 常量，用于标识公共路由的元数据键
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public 装饰器，用于标记公共路由，这些路由无需认证和权限验证
 * 例如: @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
