import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { isValidEthereumAddress, isValidXHandle } from '@/lib/api'

export const dynamic = 'force-dynamic'

// GET: Check if a wallet has an existing request or get all requests for admin
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    const all = searchParams.get('all')

    // If 'all' parameter is set, return all requests (for admin)
    if (all === 'true') {
      const { data: requests, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
      }

      return NextResponse.json({ requests })
    }

    // Otherwise check for a specific wallet
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    const { data: existing, error } = await supabase
      .from('requests')
      .select('status')
      .eq('wallet_address', wallet.toLowerCase())
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to check request' }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({
        exists: true,
        status: existing.status,
      })
    }

    return NextResponse.json({ exists: false })
  } catch (error) {
    console.error('Request check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Submit a new join request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_address, display_name, x_handle, pfp_url, usd_amount, mega_amount } = body

    // Validation
    if (!wallet_address || !isValidEthereumAddress(wallet_address)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    if (!display_name || display_name.trim().length === 0 || display_name.length > 50) {
      return NextResponse.json({ error: 'Invalid display name' }, { status: 400 })
    }

    if (!x_handle || !isValidXHandle(x_handle)) {
      return NextResponse.json({ error: 'Invalid X handle' }, { status: 400 })
    }

    if (!pfp_url) {
      return NextResponse.json({ error: 'Profile picture URL is required' }, { status: 400 })
    }

    try {
      new URL(pfp_url)
    } catch {
      return NextResponse.json({ error: 'Invalid profile picture URL' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const normalizedWallet = wallet_address.toLowerCase()

    // Check if wallet already has a request
    const { data: existing, error: checkError } = await supabase
      .from('requests')
      .select('status')
      .eq('wallet_address', normalizedWallet)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Supabase check error:', checkError)
      return NextResponse.json({ error: 'Failed to check existing request' }, { status: 500 })
    }

    if (existing) {
      if (existing.status === 'pending') {
        return NextResponse.json({ error: 'This wallet already has a pending request' }, { status: 400 })
      }
      if (existing.status === 'approved') {
        return NextResponse.json({ error: 'This wallet is already on the leaderboard' }, { status: 400 })
      }
      // If rejected, allow resubmission by updating the existing record
      if (existing.status === 'rejected') {
        const { error: updateError } = await supabase
          .from('requests')
          .update({
            display_name: display_name.trim(),
            x_handle: x_handle.replace('@', ''),
            pfp_url: pfp_url.trim(),
            usd_amount: usd_amount || 0,
            mega_amount: mega_amount || 0,
            status: 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('wallet_address', normalizedWallet)

        if (updateError) {
          console.error('Supabase update error:', updateError)
          return NextResponse.json({ error: 'Failed to resubmit request' }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Request resubmitted successfully' })
      }
    }

    // Insert new request
    const { error: insertError } = await supabase.from('requests').insert({
      wallet_address: normalizedWallet,
      display_name: display_name.trim(),
      x_handle: x_handle.replace('@', ''),
      pfp_url: pfp_url.trim(),
      usd_amount: usd_amount || 0,
      mega_amount: mega_amount || 0,
      status: 'pending',
    })

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Request submitted successfully' })
  } catch (error) {
    console.error('Submit request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
