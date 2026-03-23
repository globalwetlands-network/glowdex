/**
 * API Configuration
 */

// Use the environment variable VITE_API_BASE_URL if provided,
// otherwise default to '/api' (handled by Vite proxy in dev)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Default timeout for API requests in milliseconds
export const DEFAULT_API_TIMEOUT =
  Number(import.meta.env.VITE_API_TIMEOUT_MS) || 30000;
