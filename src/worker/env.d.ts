export interface CloudflareBindings {
  DB: D1Database;
  KV: KVNamespace;
  RESEND_API_KEY: string;
  BETTER_AUTH_URL: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends CloudflareBindings {
      // Additional environment variables can be added here
      RESEND_API_KEY: string;
      BETTER_AUTH_URL: string;
    }
  }
}
