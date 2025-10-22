export interface CloudflareBindings {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  RESEND_API_KEY: string;
  BETTER_AUTH_URL: string;
  AI: Ai;
  VECTORIZE: Vectorize;
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
