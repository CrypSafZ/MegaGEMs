'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatUSD, formatMEGA, shortenAddress } from '@/lib/api'
import { LeaderboardRequest } from '@/lib/supabase'
import { Loader2, Check, X, Trash2, RotateCcw, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

type Tab = 'pending' | 'approved' | 'rejected'

export function AdminRequestList() {
  const [requests, setRequests] = useState<LeaderboardRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('pending')

  async function fetchRequests() {
    setLoading(true)
    try {
      const response = await fetch('/api/requests?all=true')
      const data = await response.json()
      if (response.ok) {
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error)
      toast.error('Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  async function handleApprove(id: string) {
    setActionLoading(id)
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to approve')
      }

      toast.success('Request approved!')
      fetchRequests()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id: string) {
    setActionLoading(id)
    try {
      const response = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reject')
      }

      toast.success('Request rejected')
      fetchRequests()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this entry?')) return

    setActionLoading(id)
    try {
      const response = await fetch('/api/admin/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete')
      }

      toast.success('Entry deleted')
      fetchRequests()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredRequests = requests.filter((r) => r.status === activeTab)

  const counts = {
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === 'pending' ? 'default' : 'outline'}
          onClick={() => setActiveTab('pending')}
          className={activeTab === 'pending' ? 'gem-button text-white' : ''}
        >
          <Clock className="w-4 h-4 mr-2" />
          Pending ({counts.pending})
        </Button>
        <Button
          variant={activeTab === 'approved' ? 'default' : 'outline'}
          onClick={() => setActiveTab('approved')}
          className={activeTab === 'approved' ? 'gem-button text-white' : ''}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Approved ({counts.approved})
        </Button>
        <Button
          variant={activeTab === 'rejected' ? 'default' : 'outline'}
          onClick={() => setActiveTab('rejected')}
          className={activeTab === 'rejected' ? 'gem-button text-white' : ''}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Rejected ({counts.rejected})
        </Button>
        <Button variant="ghost" onClick={fetchRequests} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Request List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="gem-card border-0">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No {activeTab} requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="gem-card border-0">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12 ring-2 ring-primary/30">
                      <AvatarImage src={request.pfp_url} alt={request.display_name} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {request.display_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{request.display_name}</CardTitle>
                      <CardDescription>
                        <a
                          href={`https://x.com/${request.x_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          @{request.x_handle}
                        </a>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={
                      request.status === 'approved'
                        ? 'default'
                        : request.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="p-2 rounded bg-secondary/50">
                    <p className="text-muted-foreground text-xs">Wallet</p>
                    <p className="font-mono">{shortenAddress(request.wallet_address)}</p>
                  </div>
                  <div className="p-2 rounded bg-secondary/50">
                    <p className="text-muted-foreground text-xs">USD</p>
                    <p className="font-medium">{formatUSD(request.usd_amount || 0)}</p>
                  </div>
                  <div className="p-2 rounded bg-secondary/50">
                    <p className="text-muted-foreground text-xs">MEGA</p>
                    <p className="font-medium text-primary">{formatMEGA(request.mega_amount || 0)}</p>
                  </div>
                  <div className="p-2 rounded bg-secondary/50">
                    <p className="text-muted-foreground text-xs">Submitted</p>
                    <p className="font-medium">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {activeTab === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading === request.id}
                        className="gem-button text-white"
                      >
                        {actionLoading === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(request.id)}
                        disabled={actionLoading === request.id}
                      >
                        {actionLoading === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  {activeTab === 'approved' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(request.id)}
                      disabled={actionLoading === request.id}
                    >
                      {actionLoading === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove from Leaderboard
                        </>
                      )}
                    </Button>
                  )}
                  {activeTab === 'rejected' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading === request.id}
                        className="gem-button text-white"
                      >
                        {actionLoading === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Re-approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(request.id)}
                        disabled={actionLoading === request.id}
                      >
                        {actionLoading === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
