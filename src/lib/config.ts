/**
 * Gazie Commute - Application Feature Flags & Configuration
 */

export const APP_CONFIG = {
  // Pilot feature flag for Church Communities & Cell Fellowships
  CHURCH_COMMUNITIES_ENABLED: process.env.NEXT_PUBLIC_CHURCH_COMMUNITIES_ENABLED !== 'false',
  
  // Platform fee configuration
  PLATFORM_FEE_ENABLED: process.env.NEXT_PUBLIC_PLATFORM_FEE_ENABLED === 'true',
  PLATFORM_FEE_AMOUNT: parseInt(process.env.NEXT_PUBLIC_PLATFORM_FEE_AMOUNT || '100', 10),
  
  // App domain
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://gaziecommute.com'
};

export const CHURCH_COMMUNITIES_ENABLED = APP_CONFIG.CHURCH_COMMUNITIES_ENABLED;
