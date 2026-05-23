import "dotenv/config";
import { defineConfig } from "prisma/config";
console.log("Prisma configuration loaded. DATABASE_URL:", process.env.DATABASE_URL);
export default defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    url: process.env.DATABASE_URL,
  },
});