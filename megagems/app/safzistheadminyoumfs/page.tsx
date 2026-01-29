import { AdminRequestList } from '@/components/admin-request-list'
import { Shield } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold shimmer-text">
            Admin Panel
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Manage leaderboard requests. Approve, reject, or remove members.
        </p>
      </div>

      {/* Admin Request List */}
      <AdminRequestList />
    </div>
  )
}
