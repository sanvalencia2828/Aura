import { ReactNode } from "react"
import Link from "next/link"
import { Layers } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Layers className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                AURA
              </span>
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
