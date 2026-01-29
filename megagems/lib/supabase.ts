import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create client only if credentials are available
let supabaseInstance: SupabaseClient | null = null

export const supabase = (() => {
  if (supabaseUrl && supabaseAnonKey) {
    if (!supabaseInstance) {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
    }
    return supabaseInstance
  }
  return null
})()

// Server-side client with service role key for admin operations
export function createServerSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase credentials not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.')
  }

  return createClient(url, serviceKey)
}

// Database types
export type RequestStatus = 'pending' | 'approved' | 'rejected'

export interface LeaderboardRequest {
  id: string
  wallet_address: string
  display_name: string
  x_handle: string
  pfp_url: string
  status: RequestStatus
  usd_amount: number | null
  mega_amount: number | null
  created_at: string
  updated_at: string
}

export interface LeaderboardMember extends LeaderboardRequest {
  rank?: number
}
