const ALLOCATION_API_URL = process.env.ALLOCATION_API_URL || 'https://megasale-check.xultra.fun/api/allocations/check'

export interface AllocationData {
  wallet: string
  usdAmount: number
  megaAmount: number
  status: string
  exists: boolean
}

export interface AllocationResponse {
  success: boolean
  data?: AllocationData
  error?: string
}

export async function checkAllocation(walletAddress: string): Promise<AllocationResponse> {
  try {
    const response = await fetch(ALLOCATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wallet: walletAddress }),
    })

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`)
    }

    const data = await response.json()

    // Handle the API response format
    if (data.success === false || data.error) {
      return {
        success: false,
        error: data.error || 'Allocation not found',
      }
    }

    // Map the response to our expected format
    return {
      success: true,
      data: {
        wallet: walletAddress,
        usdAmount: data.usdAmount || data.usd_amount || 0,
        megaAmount: data.megaAmount || data.mega_amount || 0,
        status: data.status || 'unknown',
        exists: (data.usdAmount || data.usd_amount || 0) > 0,
      },
    }
  } catch (error) {
    console.error('Allocation check error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check allocation',
    }
  }
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatMEGA(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + ' MEGA'
}

export function shortenAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function isValidXHandle(handle: string): boolean {
  // Remove @ if present and validate
  const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle
  return /^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle)
}

export function normalizeXHandle(handle: string): string {
  // Remove @ prefix if present
  return handle.startsWith('@') ? handle.slice(1) : handle
}
