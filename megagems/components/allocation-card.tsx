'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatUSD, formatMEGA, isValidEthereumAddress, shortenAddress } from '@/lib/api'
import { Loader2, Search, Wallet, DollarSign, Gem, AlertCircle, CheckCircle2 } from 'lucide-react'

interface AllocationResult {
  wallet: string
  usdAmount: number
  megaAmount: number
  status: string
  exists: boolean
}

export function AllocationCard() {
  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AllocationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCheck() {
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address')
      return
    }

    if (!isValidEthereumAddress(walletAddress.trim())) {
      setError('Please enter a valid Ethereum address')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/check-allocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: walletAddress.trim() }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to check allocation')
      }

      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Search Input */}
      <Card className="gem-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-primary" />
            <span>Check Allocation</span>
          </CardTitle>
          <CardDescription>
            Enter any wallet address to check its MegaETH allocation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="gem-input flex-1"
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            />
            <Button
              onClick={handleCheck}
              disabled={loading}
              className="gem-button text-white font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Check
                </>
              )}
            </Button>
          </div>
          {error && (
            <div className="flex items-center space-x-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="gem-card border-0 gem-glow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {result.exists ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <span>Allocation Found</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Wallet */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">Wallet</span>
              </div>
              <span className="font-mono text-sm">{shortenAddress(result.wallet)}</span>
            </div>

            {/* USD Amount */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">USD Allocation</span>
              </div>
              <span className="font-bold text-lg">{formatUSD(result.usdAmount)}</span>
            </div>

            {/* MEGA Amount */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Gem className="w-4 h-4" />
                <span className="text-sm">MEGA Tokens</span>
              </div>
              <span className="font-bold text-lg text-primary">{formatMEGA(result.megaAmount)}</span>
            </div>

            {/* Status */}
            {result.status && (
              <div className="text-center pt-2">
                <span className="text-sm text-muted-foreground">
                  Status: <span className="text-foreground capitalize">{result.status}</span>
                </span>
              </div>
            )}

            {!result.exists && (
              <div className="text-center pt-2 text-yellow-500 text-sm">
                This wallet has no allocation
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
