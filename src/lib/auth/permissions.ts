/**
 * Permission Checking Utilities
 * Helper functions for checking user permissions and authorization
 */

import { getAuthUser } from './session';
import { Permission, ROLE_PERMISSIONS, type AuthUser } from '@/types/auth';
import { AuthError, AuthErrorType } from '@/types/auth';

/**
 * Check if current user has a specific permission
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) {
    return false;
  }
  return hasPermission(user, permission);
}

/**
 * Check if user has specific permission (sync version)
 */
export function hasPermission(user: AuthUser, permission: Permission): boolean {
  const userPermissions = ROLE_PERMISSIONS[user.userType] || [];
  return userPermissions.includes(permission);
}

/**
 * Require a specific permission (throws error if not authorized)
 */
export async function requirePermission(permission: Permission): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new AuthError(AuthErrorType.UNAUTHORIZED, 'Authentication required');
  }
  if (!hasPermission(user, permission)) {
    throw new AuthError(
      AuthErrorType.FORBIDDEN,
      `Permission '${permission}' required`,
      { requiredPermission: permission }
    );
  }
  return user;
}

/**
 * Check if current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getAuthUser();
  return user?.userType === 'admin';
}

/**
 * Require admin access (throws error if not admin)
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new AuthError(AuthErrorType.UNAUTHORIZED, 'Authentication required');
  }
  if (user.userType !== 'admin') {
    throw new AuthError(AuthErrorType.FORBIDDEN, 'Admin access required');
  }
  return user;
}

/**
 * Check if current user is an agent
 */
export async function isAgent(): Promise<boolean> {
  const user = await getAuthUser();
  return user?.userType === 'agent';
}

/**
 * Require agent access (throws error if not agent)
 */
export async function requireAgent(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new AuthError(AuthErrorType.UNAUTHORIZED, 'Authentication required');
  }
  if (user.userType !== 'agent') {
    throw new AuthError(AuthErrorType.FORBIDDEN, 'Agent access required');
  }
  return user;
}

/**
 * Check if current user is a human
 */
export async function isHuman(): Promise<boolean> {
  const user = await getAuthUser();
  return user?.userType === 'human';
}

/**
 * Require human access (throws error if not human)
 */
export async function requireHuman(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new AuthError(AuthErrorType.UNAUTHORIZED, 'Authentication required');
  }
  if (user.userType !== 'human') {
    throw new AuthError(AuthErrorType.FORBIDDEN, 'Human access required');
  }
  return user;
}

/**
 * Check if user can view debates
 */
export async function canViewDebates(): Promise<boolean> {
  return checkPermission(Permission.VIEW_DEBATES);
}

/**
 * Check if user can vote on debates
 */
export async function canVoteOnDebates(): Promise<boolean> {
  return checkPermission(Permission.VOTE_ON_DEBATES);
}

/**
 * Check if user can submit arguments
 */
export async function canSubmitArguments(): Promise<boolean> {
  return checkPermission(Permission.SUBMIT_ARGUMENTS);
}

/**
 * Check if user can create prompts
 */
export async function canCreatePrompts(): Promise<boolean> {
  return checkPermission(Permission.CREATE_PROMPTS);
}

/**
 * Check if user can manage prompts
 */
export async function canManagePrompts(): Promise<boolean> {
  return checkPermission(Permission.MANAGE_PROMPTS);
}

/**
 * Check if user can register as agent
 */
export async function canRegisterAsAgent(): Promise<boolean> {
  return checkPermission(Permission.REGISTER_AS_AGENT);
}

/**
 * Check if user can manage agents
 */
export async function canManageAgents(): Promise<boolean> {
  return checkPermission(Permission.MANAGE_AGENTS);
}

/**
 * Check if user can view all stats
 */
export async function canViewAllStats(): Promise<boolean> {
  return checkPermission(Permission.VIEW_ALL_STATS);
}

/**
 * Check if user can manage users
 */
export async function canManageUsers(): Promise<boolean> {
  return checkPermission(Permission.MANAGE_USERS);
}

/**
 * Check if user can moderate content
 */
export async function canModerateContent(): Promise<boolean> {
  return checkPermission(Permission.MODERATE_CONTENT);
}

/**
 * Get all permissions for current user
 */
export async function getUserPermissions(): Promise<Permission[]> {
  const user = await getAuthUser();
  if (!user) {
    return [];
  }
  return ROLE_PERMISSIONS[user.userType] || [];
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(permissions: Permission[]): Promise<boolean> {
  const userPermissions = await getUserPermissions();
  return permissions.some(permission => userPermissions.includes(permission));
}

/**
 * Check if user has all of the specified permissions
 */
export async function hasAllPermissions(permissions: Permission[]): Promise<boolean> {
  const userPermissions = await getUserPermissions();
  return permissions.every(permission => userPermissions.includes(permission));
}

/**
 * Require any of the specified permissions
 */
export async function requireAnyPermission(permissions: Permission[]): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new AuthError(AuthErrorType.UNAUTHORIZED, 'Authentication required');
  }
  if (!await hasAnyPermission(permissions)) {
    throw new AuthError(
      AuthErrorType.FORBIDDEN,
      `One of the following permissions required: ${permissions.join(', ')}`,
      { requiredPermissions: permissions }
    );
  }
  return user;
}

/**
 * Require all of the specified permissions
 */
export async function requireAllPermissions(permissions: Permission[]): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new AuthError(AuthErrorType.UNAUTHORIZED, 'Authentication required');
  }
  if (!await hasAllPermissions(permissions)) {
    throw new AuthError(
      AuthErrorType.FORBIDDEN,
      `All of the following permissions required: ${permissions.join(', ')}`,
      { requiredPermissions: permissions }
    );
  }
  return user;
}
