import { NextResponse } from 'next/server'
import { createServerSupabaseClient, LeaderboardMember } from '@/lib/supabase'
import { checkAllocation } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Fetch all approved members
    const { data: members, error } = await supabase
      .from('requests')
      .select('*')
      .eq('status', 'approved')
      .order('mega_amount', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }

    // Refresh allocation data for each member
    const refreshedMembers: LeaderboardMember[] = await Promise.all(
      (members || []).map(async (member, index) => {
        try {
          const allocation = await checkAllocation(member.wallet_address)
          if (allocation.success && allocation.data) {
            // Update the cached values in the database
            await supabase
              .from('requests')
              .update({
                usd_amount: allocation.data.usdAmount,
                mega_amount: allocation.data.megaAmount,
                updated_at: new Date().toISOString(),
              })
              .eq('id', member.id)

            return {
              ...member,
              usd_amount: allocation.data.usdAmount,
              mega_amount: allocation.data.megaAmount,
              rank: index + 1,
            }
          }
        } catch (err) {
          console.error(`Failed to refresh allocation for ${member.wallet_address}:`, err)
        }
        return { ...member, rank: index + 1 }
      })
    )

    // Sort by mega_amount again after refresh
    refreshedMembers.sort((a, b) => (b.mega_amount || 0) - (a.mega_amount || 0))

    // Reassign ranks after sorting
    refreshedMembers.forEach((member, index) => {
      member.rank = index + 1
    })

    // Calculate totals
    const totals = {
      totalUsd: refreshedMembers.reduce((sum, m) => sum + (m.usd_amount || 0), 0),
      totalMega: refreshedMembers.reduce((sum, m) => sum + (m.mega_amount || 0), 0),
      memberCount: refreshedMembers.length,
    }

    return NextResponse.json({
      members: refreshedMembers,
      totals,
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
