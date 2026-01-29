import { AllocationCard } from '@/components/allocation-card'
import { Search } from 'lucide-react'

export default function CheckPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Search className="w-8 h-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold shimmer-text">
            Check Allocation
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Enter any wallet address to check its MegaETH token sale allocation.
        </p>
      </div>

      {/* Allocation Checker */}
      <AllocationCard />
    </div>
  )
}
