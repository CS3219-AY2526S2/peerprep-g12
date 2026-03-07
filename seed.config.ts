import { SeedPg } from "@snaplet/seed/adapter-pg";
import { defineConfig } from "@snaplet/seed/config";
import { Client } from "pg";

export default defineConfig({
  adapter: async () => {
    const client = new Client({
      connectionString: 'postgresql://postgres.yrjrymqlfxajeuzhbpeg:LtrhZXcD8a8JjUA0@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres',
    })
    await client.connect()
    return new SeedPg(client)
  },
  // We only want to generate data for the public schema
  select: ['!*', 'public.*'],
})