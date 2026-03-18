"use client"

interface ProofLevel {
  name: string
  minPosts: number
  badge: string
  color: string
}

interface ProofBadgeProps {
  level: ProofLevel | null
  postCount: number
  compact?: boolean
}

export default function ProofBadge({ level, postCount, compact = false }: ProofBadgeProps) {
  if (!level) {
    return (
      <div className={`bg-surface/50 border border-border rounded-xl p-4 ${compact ? "text-center" : ""}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-2xl">
            🎯
          </div>
          <div>
            <p className="text-sm text-zinc-400">Sin nivel aún</p>
            <p className="text-xs text-zinc-500">Crea tu primer post para comenzar</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`bg-surface/50 border rounded-xl p-4 ${compact ? "text-center" : ""}`}
      style={{ borderColor: `${level.color}40` }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
          style={{ backgroundColor: `${level.color}20` }}
        >
          {level.badge}
        </div>
        <div>
          <p className="font-semibold" style={{ color: level.color }}>
            {level.name}
          </p>
          <p className="text-sm text-zinc-400">
            {postCount} post{postCount !== 1 ? "s" : ""} creado{postCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  )
}
