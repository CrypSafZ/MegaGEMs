'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatUSD, formatMEGA, isValidEthereumAddress, isValidXHandle, normalizeXHandle } from '@/lib/api'
import { Loader2, UserPlus, Wallet, AtSign, User, Image as ImageIcon, AlertCircle, CheckCircle2, Gem } from 'lucide-react'

interface AllocationPreview {
  usdAmount: number
  megaAmount: number
}

type FormStep = 'form' | 'preview' | 'success'

export function JoinForm() {
  const [step, setStep] = useState<FormStep>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allocation, setAllocation] = useState<AllocationPreview | null>(null)

  const [formData, setFormData] = useState({
    walletAddress: '',
    xHandle: '',
    displayName: '',
    pfpUrl: '',
  })

  const [fieldErrors, setFieldErrors] = useState({
    walletAddress: '',
    xHandle: '',
    displayName: '',
    pfpUrl: '',
  })

  function validateForm(): boolean {
    const errors = {
      walletAddress: '',
      xHandle: '',
      displayName: '',
      pfpUrl: '',
    }

    if (!formData.walletAddress.trim()) {
      errors.walletAddress = 'Wallet address is required'
    } else if (!isValidEthereumAddress(formData.walletAddress.trim())) {
      errors.walletAddress = 'Invalid Ethereum address'
    }

    if (!formData.xHandle.trim()) {
      errors.xHandle = 'X handle is required'
    } else if (!isValidXHandle(formData.xHandle.trim())) {
      errors.xHandle = 'Invalid X handle (1-15 alphanumeric characters or underscores)'
    }

    if (!formData.displayName.trim()) {
      errors.displayName = 'Display name is required'
    } else if (formData.displayName.trim().length > 50) {
      errors.displayName = 'Display name must be 50 characters or less'
    }

    if (!formData.pfpUrl.trim()) {
      errors.pfpUrl = 'Profile picture URL is required'
    } else {
      try {
        new URL(formData.pfpUrl.trim())
      } catch {
        errors.pfpUrl = 'Invalid URL'
      }
    }

    setFieldErrors(errors)
    return !Object.values(errors).some((e) => e)
  }

  async function handleCheckAllocation() {
    if (!validateForm()) return

    setLoading(true)
    setError(null)

    try {
      // First check if wallet has an allocation
      const allocationRes = await fetch('/api/check-allocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: formData.walletAddress.trim() }),
      })

      const allocationData = await allocationRes.json()

      if (!allocationRes.ok || !allocationData.success) {
        throw new Error(allocationData.error || 'Failed to check allocation')
      }

      if (!allocationData.data.exists || allocationData.data.usdAmount <= 0) {
        throw new Error('This wallet has no MegaETH allocation. Only wallets with allocation can join.')
      }

      setAllocation({
        usdAmount: allocationData.data.usdAmount,
        megaAmount: allocationData.data.megaAmount,
      })

      // Check if wallet can submit
      const checkRes = await fetch(`/api/requests?wallet=${formData.walletAddress.trim()}`)
      const checkData = await checkRes.json()

      if (checkData.exists) {
        if (checkData.status === 'pending') {
          throw new Error('This wallet already has a pending request')
        }
        if (checkData.status === 'approved') {
          throw new Error('This wallet is already on the leaderboard')
        }
        // If rejected, allow resubmission
      }

      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: formData.walletAddress.trim(),
          x_handle: normalizeXHandle(formData.xHandle.trim()),
          display_name: formData.displayName.trim(),
          pfp_url: formData.pfpUrl.trim(),
          usd_amount: allocation?.usdAmount || 0,
          mega_amount: allocation?.megaAmount || 0,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <Card className="gem-card border-0 max-w-lg mx-auto gem-glow">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold">Request Submitted!</h3>
            <p className="text-muted-foreground">
              Your request to join the MegaGEMs leaderboard has been submitted.
              You&apos;ll appear on the leaderboard once approved.
            </p>
            {allocation && (
              <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                <p className="text-sm text-muted-foreground">Your allocation:</p>
                <p className="font-bold">{formatUSD(allocation.usdAmount)}</p>
                <p className="text-primary font-bold">{formatMEGA(allocation.megaAmount)}</p>
              </div>
            )}
            <Button
              onClick={() => {
                setStep('form')
                setFormData({ walletAddress: '', xHandle: '', displayName: '', pfpUrl: '' })
                setAllocation(null)
              }}
              variant="outline"
              className="mt-4"
            >
              Submit Another
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'preview') {
    return (
      <Card className="gem-card border-0 max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gem className="w-5 h-5 text-primary" />
            <span>Confirm Your Request</span>
          </CardTitle>
          <CardDescription>
            Review your information before submitting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">Wallet</span>
              <span className="font-mono text-sm">
                {formData.walletAddress.slice(0, 6)}...{formData.walletAddress.slice(-4)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">Display Name</span>
              <span className="font-medium">{formData.displayName}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">X Handle</span>
              <span className="text-primary">@{normalizeXHandle(formData.xHandle)}</span>
            </div>
            {allocation && (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">USD Allocation</span>
                  <span className="font-bold">{formatUSD(allocation.usdAmount)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">MEGA Tokens</span>
                  <span className="font-bold text-primary">{formatMEGA(allocation.megaAmount)}</span>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setStep('form')}
              disabled={loading}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="gem-button text-white font-medium flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gem-card border-0 max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="w-5 h-5 text-primary" />
          <span>Join the Leaderboard</span>
        </CardTitle>
        <CardDescription>
          Submit your wallet to appear on the MegaGEMs leaderboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Address */}
        <div className="space-y-2">
          <Label htmlFor="wallet" className="flex items-center space-x-2">
            <Wallet className="w-4 h-4" />
            <span>Wallet Address</span>
          </Label>
          <Input
            id="wallet"
            type="text"
            placeholder="0x..."
            value={formData.walletAddress}
            onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
            className="gem-input"
          />
          {fieldErrors.walletAddress && (
            <p className="text-sm text-destructive">{fieldErrors.walletAddress}</p>
          )}
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Display Name</span>
          </Label>
          <Input
            id="displayName"
            type="text"
            placeholder="Your display name"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            className="gem-input"
          />
          {fieldErrors.displayName && (
            <p className="text-sm text-destructive">{fieldErrors.displayName}</p>
          )}
        </div>

        {/* X Handle */}
        <div className="space-y-2">
          <Label htmlFor="xHandle" className="flex items-center space-x-2">
            <AtSign className="w-4 h-4" />
            <span>X Handle</span>
          </Label>
          <Input
            id="xHandle"
            type="text"
            placeholder="@username"
            value={formData.xHandle}
            onChange={(e) => setFormData({ ...formData, xHandle: e.target.value })}
            className="gem-input"
          />
          {fieldErrors.xHandle && (
            <p className="text-sm text-destructive">{fieldErrors.xHandle}</p>
          )}
        </div>

        {/* Profile Picture URL */}
        <div className="space-y-2">
          <Label htmlFor="pfpUrl" className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4" />
            <span>Profile Picture URL</span>
          </Label>
          <Input
            id="pfpUrl"
            type="url"
            placeholder="https://..."
            value={formData.pfpUrl}
            onChange={(e) => setFormData({ ...formData, pfpUrl: e.target.value })}
            className="gem-input"
          />
          {fieldErrors.pfpUrl && (
            <p className="text-sm text-destructive">{fieldErrors.pfpUrl}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Tip: Right-click your X profile picture and copy image URL
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-destructive text-sm p-3 rounded-lg bg-destructive/10">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          onClick={handleCheckAllocation}
          disabled={loading}
          className="gem-button text-white font-medium w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Continue
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
