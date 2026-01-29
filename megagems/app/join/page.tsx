import { JoinForm } from '@/components/join-form'
import { UserPlus } from 'lucide-react'

export default function JoinPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <UserPlus className="w-8 h-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold shimmer-text">
            Join the Leaderboard
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Have a MegaETH allocation? Submit your wallet to appear on the
          community leaderboard. Your request will be reviewed before approval.
        </p>
      </div>

      {/* Join Form */}
      <JoinForm />
    </div>
  )
}
