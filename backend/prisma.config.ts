// Prisma v7 config — connection URLs live here, NOT in schema.prisma
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL = non-pooled connection (required for db push / migrations)
    // DATABASE_URL = pooled connection (used at runtime by the app)
    // For local PostgreSQL both can be the same URL
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
