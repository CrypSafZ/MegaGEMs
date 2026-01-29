import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-sm text-muted-foreground">
            made by{' '}
            <Link
              href="https://x.com/0xAlphaGEMs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              @0xAlphaGEMs
            </Link>
          </p>
          <p className="text-xs text-muted-foreground/60">
            MegaGEMs Leaderboard
          </p>
        </div>
      </div>
    </footer>
  )
}
