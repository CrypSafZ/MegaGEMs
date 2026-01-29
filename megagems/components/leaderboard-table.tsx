'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatUSD, formatMEGA } from '@/lib/api'
import { LeaderboardMember } from '@/lib/supabase'
import { Loader2, Trophy, Medal, Award, Users, DollarSign, Gem } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaderboardData {
  members: LeaderboardMember[]
  totals: {
    totalUsd: number
    totalMega: number
    memberCount: number
  }
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="rank-gold w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">
        <Trophy className="w-4 h-4" />
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="rank-silver w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">
        <Medal className="w-4 h-4" />
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="rank-bronze w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">
        <Award className="w-4 h-4" />
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-medium text-sm">
      #{rank}
    </div>
  )
}

export function LeaderboardTable() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch('/api/leaderboard')
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch leaderboard')
        }

        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading leaderboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (!data || data.members.length === 0) {
    return (
      <div className="text-center py-20">
        <Gem className="w-16 h-16 mx-auto text-primary/40 mb-4" />
        <p className="text-muted-foreground text-lg">No members yet</p>
        <p className="text-muted-foreground/60 text-sm mt-2">
          Be the first to join the leaderboard!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Leaderboard Table */}
      <div className="gem-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="w-16 text-center">Rank</TableHead>
              <TableHead>Member</TableHead>
              <TableHead className="text-right">USD Allocation</TableHead>
              <TableHead className="text-right">MEGA Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.members.map((member, index) => (
              <TableRow
                key={member.id}
                className={cn(
                  'leaderboard-row border-border/30',
                  index === 0 && 'bg-yellow-500/5',
                  index === 1 && 'bg-gray-400/5',
                  index === 2 && 'bg-orange-500/5'
                )}
              >
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <RankBadge rank={member.rank || index + 1} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`https://x.com/${member.x_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="w-10 h-10 ring-2 ring-primary/30 hover:ring-primary/60 transition-all">
                        <AvatarImage src={member.pfp_url} alt={member.display_name} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {member.display_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <p className="font-medium">{member.display_name}</p>
                      <Link
                        href={`https://x.com/${member.x_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        @{member.x_handle}
                      </Link>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatUSD(member.usd_amount || 0)}
                </TableCell>
                <TableCell className="text-right font-medium text-primary">
                  {formatMEGA(member.mega_amount || 0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Totals Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="gem-card rounded-xl p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">Total Members</span>
          </div>
          <p className="text-2xl font-bold">{data.totals.memberCount}</p>
        </div>
        <div className="gem-card rounded-xl p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Total USD</span>
          </div>
          <p className="text-2xl font-bold">{formatUSD(data.totals.totalUsd)}</p>
        </div>
        <div className="gem-card rounded-xl p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-1">
            <Gem className="w-4 h-4" />
            <span className="text-sm">Total MEGA</span>
          </div>
          <p className="text-2xl font-bold text-primary">{formatMEGA(data.totals.totalMega)}</p>
        </div>
      </div>
    </div>
  )
}
