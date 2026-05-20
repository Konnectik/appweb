"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ufdzcxycgprgvigyotnk.supabase.co"

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZHpjeHljZ3ByZ3ZpZ3lvdG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDMxMDQsImV4cCI6MjA4ODcxOTEwNH0.YaE1OhMC_KBf1VgqBtd7EcWDXlUMjDGAGGyk2Is5r1k"

let _client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseBrowserClient() {
  if (!_client) {
    _client = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return _client
}

export const supabase = getSupabaseBrowserClient()
