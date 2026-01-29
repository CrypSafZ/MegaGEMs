import { LeaderboardTable } from '@/components/leaderboard-table'
import { Gem } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Gem className="w-10 h-10 text-primary floating" />
          <h1 className="text-4xl md:text-5xl font-bold shimmer-text">
            MegaGEMs Leaderboard
          </h1>
          <Gem className="w-10 h-10 text-primary floating" style={{ animationDelay: '1.5s' }} />
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          The community leaderboard for MegaETH allocation holders.
          Check your allocation or join to appear on the leaderboard.
        </p>
      </div>

      {/* Leaderboard */}
      <LeaderboardTable />
    </div>
  )
}
