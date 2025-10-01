// Supabase configuration for optimal performance
export const supabaseConfig = {
  // Realtime configuration
  realtime: {
    // Limit events per second to prevent overwhelming the client
    eventsPerSecond: 10,
    // Enable heartbeat to keep connection alive
    heartbeatIntervalMs: 30000,
    // Reconnect after connection loss
    reconnectAfterMs: [1000, 2000, 5000, 10000],
  },
  
  // Auth configuration
  auth: {
    // Auto refresh tokens
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session in URL for OAuth flows
    detectSessionInUrl: true,
    // Flow type for auth
    flowType: 'pkce' as const,
  },
  
  // Global configuration
  global: {
    headers: {
      'X-Client-Info': 'freelcrm@1.0.0',
      'X-Client-Version': '1.0.0',
    },
  },
  
  // Database configuration
  db: {
    // Use connection pooling
    schema: 'public',
    // Query timeout
    queryTimeout: 30000,
  },
}

// Query optimization helpers
export const queryOptimizations = {
  // Limit results for better performance
  defaultLimit: 50,
  maxLimit: 100,
  
  // Common select patterns
  selectPatterns: {
    minimal: 'id, created_at',
    basic: 'id, name, email, created_at',
    full: '*',
  },
  
  // Cache settings
  cache: {
    // Cache duration in milliseconds
    defaultTtl: 5 * 60 * 1000, // 5 minutes
    maxTtl: 30 * 60 * 1000, // 30 minutes
  },
}

// Performance monitoring
export const performanceConfig = {
  // Enable performance monitoring
  enabled: process.env.NODE_ENV === 'development',
  
  // Log slow queries
  slowQueryThreshold: 1000, // 1 second
  
  // Log large responses
  largeResponseThreshold: 10000, // 10KB
}
