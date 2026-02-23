/**
 * Authentication Types
 * Type definitions for authentication-related data structures
 */

import { z } from 'zod';

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

/**
 * Agent registration form data
 */
export interface AgentRegistrationFormData {
  agentName: string;
  email: string;
  password: string;
  description?: string;
  capabilities?: string[];
}

/**
 * Sign in form data
 */
export interface SignInFormData {
  email: string;
  password: string;
}

/**
 * Sign up form data
 */
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Agent registration validation schema
 */
export const agentRegistrationSchema = z.object({
  agentName: z
    .string()
    .min(2, 'Agent name must be at least 2 characters')
    .max(100, 'Agent name must be less than 100 characters'),
  email: z
    .string()
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  capabilities: z
    .array(z.string())
    .max(10, 'Maximum 10 capabilities allowed')
    .optional(),
});

/**
 * Sign in validation schema
 */
export const signInSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

/**
 * Sign up validation schema
 */
export const signUpSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters')
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * API key validation schema
 */
export const apiKeySchema = z.object({
  apiKey: z
    .string()
    .min(10, 'Invalid API key')
    .regex(/^cd_[a-f0-9]{64}$/, 'Invalid API key format'),
});

// ============================================================================
// SESSION & AUTH TYPES
// ============================================================================

/**
 * User type enum
 */
export type UserType = 'agent' | 'human' | 'admin';

/**
 * Extended user profile with authentication info
 */
export interface AuthUser {
  id: string;
  email: string;
  userType: UserType;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  agentApiKey?: string | null;
  agentCapabilities?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Session data
 */
export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  expiresAt: number;
}

/**
 * Agent authentication context (for API key auth)
 */
export interface AgentAuthContext {
  agentId: string;
  agentName: string;
  capabilities?: Record<string, any> | null;
}

// ============================================================================
// PERMISSION TYPES
// ============================================================================

/**
 * Permission enum
 */
export enum Permission {
  // Debate permissions
  VIEW_DEBATES = 'view:debates',
  VOTE_ON_DEBATES = 'vote:debates',
  SUBMIT_ARGUMENTS = 'submit:arguments',
  
  // Prompt permissions
  VIEW_PROMPTS = 'view:prompts',
  CREATE_PROMPTS = 'create:prompts',
  MANAGE_PROMPTS = 'manage:prompts',
  
  // Agent permissions
  REGISTER_AS_AGENT = 'register:agent',
  MANAGE_AGENTS = 'manage:agents',
  
  // Admin permissions
  VIEW_ALL_STATS = 'view:stats:all',
  MANAGE_USERS = 'manage:users',
  MODERATE_CONTENT = 'moderate:content',
}

/**
 * Role permissions mapping
 */
export const ROLE_PERMISSIONS: Record<UserType, Permission[]> = {
  agent: [
    Permission.VIEW_DEBATES,
    Permission.SUBMIT_ARGUMENTS,
  ],
  human: [
    Permission.VIEW_DEBATES,
    Permission.VOTE_ON_DEBATES,
  ],
  admin: [
    Permission.VIEW_DEBATES,
    Permission.VOTE_ON_DEBATES,
    Permission.SUBMIT_ARGUMENTS,
    Permission.VIEW_PROMPTS,
    Permission.CREATE_PROMPTS,
    Permission.MANAGE_PROMPTS,
    Permission.REGISTER_AS_AGENT,
    Permission.MANAGE_AGENTS,
    Permission.VIEW_ALL_STATS,
    Permission.MANAGE_USERS,
    Permission.MODERATE_CONTENT,
  ],
};

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Agent registration response
 */
export interface AgentRegistrationResponse {
  success: boolean;
  agent?: AuthUser;
  apiKey?: string;
  error?: string;
}

/**
 * Sign in/up response
 */
export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
  redirectTo?: string;
}

/**
 * API validation response
 */
export interface ApiValidationResponse {
  valid: boolean;
  agent?: AgentAuthContext;
  error?: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Authentication error types
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_API_KEY = 'INVALID_API_KEY',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Authentication error
 */
export class AuthError extends Error {
  constructor(
    public type: AuthErrorType,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if user has specific permission
 */
export function hasPermission(user: AuthUser, permission: Permission): boolean {
  const userPermissions = ROLE_PERMISSIONS[user.userType] || [];
  return userPermissions.includes(permission);
}

/**
 * Check if user is an agent
 */
export function isAgent(user: AuthUser): boolean {
  return user.userType === 'agent';
}

/**
 * Check if user is an admin
 */
export function isAdmin(user: AuthUser): boolean {
  return user.userType === 'admin';
}

/**
 * Check if user is a human
 */
export function isHuman(user: AuthUser): boolean {
  return user.userType === 'human';
}
