/**
 * Persistence module - data access layer with repositories and storage.
 */

// Record types - database/storage representation
export * from './records.js';

// Repository interfaces - data access contracts
export * from './repositories.js';

// In-memory storage implementation for development/testing
export * from './memory-store.js';

// Legacy types for backward compatibility
export * from './types.js';
