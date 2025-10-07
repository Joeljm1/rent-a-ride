import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/e4b280aeaabcdf9dc80498d76942dc68b426a53b08ceff0dbd8cb451ddc62a72.sqlite",
  },
});
