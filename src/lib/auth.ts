import "dotenv/config";
import type {
  D1Database,
  IncomingRequestCfProperties,
} from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { withCloudflare } from "better-auth-cloudflare";
import { openAPI } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { schema } from "../db/schema";
import sendMail from "./email/email";
import { hash, verify } from "./hash";
import baseURL from "../../BaseURL";
import type { CloudflareBindings } from "../worker/env";

// const baseURL = "https://car-rental.joeltest.workers.dev";
// const baseURL = "http://localhost:5173";

// Single auth configuration that handles both CLI and runtime scenarios
// env always present but put option only for the cli schema generation
function createAuth(
  env?: CloudflareBindings,
  cf?: IncomingRequestCfProperties,
) {
  // Use actual DB for runtime, empty object for CLI
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = env ? drizzle(env.DB, { schema, logger: true }) : ({} as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kv = env?.KV as any;
  return betterAuth({
    baseURL: baseURL,
    ...withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: true,
        cf: cf || {},
        d1: env
          ? {
              db,
              options: {
                usePlural: true,
                // change for dev
                debugLogs: false,
              },
            }
          : undefined,
        kv: kv,
      },
      {
        emailAndPassword: {
          enabled: true,
          requireEmailVerification: false,

          password: {
            hash: hash,
            verify: verify,
          },
          autoSignIn: true,
        },

        emailVerification: {
          sendVerificationEmail: async ({ user, url }) => {
            // {user,url,token} , request
            if (env === undefined) {
              console.error("Env is not set");
              return;
            }
            const err = await sendMail(
              user.name,
              user.email,
              url,
              env.RESEND_API_KEY,
            );
            if (err !== null) {
              console.error("Could not send email");
            }
          },
          autoSignInAfterVerification: true,
          sendOnSignIn: true,
          sendOnSignUp: true,
        },
        rateLimit: {
          enabled: true,
        },
      },
    ),

    // Only add database adapter for CLI schema generation
    ...(env
      ? {}
      : {
          database: drizzleAdapter({} as D1Database, {
            provider: "sqlite",
            usePlural: true,
            debugLogs: true,
          }),
        }),
    trustedOrigins: [baseURL],
    plugins: [jwt(), openAPI()],
  });
}

// Export for CLI schema generation
export const auth = createAuth();

// Export for runtime usage
export { createAuth };
