/**
 * frontend/lib/validation.ts
 * Shared client-side validation logic for username, full name, and registration fields.
 * Must match the backend validation service (backend/services/validation_service.py).
 */

export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

export const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "root",
  "system",
  "support",
  "owner",
  "api",
  "auth",
  "login",
  "signup",
  "register",
  "null",
  "undefined",
  "skillscatalyst",
  "guest",
  "test",
  "official",
  "help",
  "terms",
  "privacy",
  "dashboard",
  "settings",
  "profile",
  "explore",
  "learning",
]);

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Normalizes username by trimming surrounding whitespace and converting to lowercase.
 */
export function normalizeUsername(username: string | null | undefined): string {
  if (!username) return "";
  return username.trim().toLowerCase();
}

/**
 * Validates a username according to platform policy:
 * - 3 to 30 characters
 * - ASCII letters, numbers, and underscores only
 * - Not in reserved usernames list
 */
export function validateUsername(username: string | null | undefined): ValidationResult {
  if (username === null || username === undefined) {
    return { isValid: false, error: "Username is required." };
  }

  const clean = username.trim();
  if (!clean) {
    return { isValid: false, error: "Username is required." };
  }

  if (clean.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters long." };
  }

  if (clean.length > 30) {
    return { isValid: false, error: "Username cannot exceed 30 characters." };
  }

  if (!USERNAME_REGEX.test(clean)) {
    return {
      isValid: false,
      error: "Username can only contain letters, numbers, and underscores.",
    };
  }

  if (RESERVED_USERNAMES.has(clean.toLowerCase())) {
    return {
      isValid: false,
      error: `The username '${clean}' is reserved. Please choose another.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates a user's full name:
 * - Required, non-empty, non-whitespace
 * - Minimum 2 characters, maximum 100 characters
 */
export function validateFullName(name: string | null | undefined): ValidationResult {
  if (name === null || name === undefined) {
    return { isValid: false, error: "Full name is required." };
  }

  const clean = name.trim();
  if (!clean) {
    return { isValid: false, error: "Full name is required." };
  }

  if (clean.length < 2) {
    return { isValid: false, error: "Full name must be at least 2 characters long." };
  }

  if (clean.length > 100) {
    return { isValid: false, error: "Full name cannot exceed 100 characters." };
  }

  return { isValid: true };
}

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

/**
 * Validates an email address format:
 * - Required, non-empty
 * - Standard email regex match
 */
export function validateEmail(email: string | null | undefined): ValidationResult {
  if (email === null || email === undefined) {
    return { isValid: false, error: "Email address is required." };
  }

  const clean = email.trim();
  if (!clean) {
    return { isValid: false, error: "Email address is required." };
  }

  if (!EMAIL_REGEX.test(clean)) {
    return { isValid: false, error: "Please enter a valid email address." };
  }

  return { isValid: true };
}

/**
 * Validates a password according to platform policy:
 * - Required, non-empty
 * - Minimum 6 characters (preserves existing registration policy)
 */
export function validatePassword(password: string | null | undefined): ValidationResult {
  if (password === null || password === undefined || password.length === 0) {
    return { isValid: false, error: "Password is required." };
  }

  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters long." };
  }

  return { isValid: true };
}

