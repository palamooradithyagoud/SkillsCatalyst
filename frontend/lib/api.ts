/**
 * Compatibility Facade for SkillsCatalyst Frontend API Layer
 *
 * This file preserves 100% backward compatibility with all existing imports
 * throughout the application (`@/lib/api`). All underlying logic is now cleanly
 * modularized into domain-specific modules in `@/lib/api/*`.
 */

export * from "./api/client";
export * from "./api/learning";
export * from "./api/playlists";
export * from "./api/progress";
export * from "./api/roadmaps";
export * from "./api/dashboard";
export * from "./api/practice";
export * from "./api/career";
export * from "./api/profile";
