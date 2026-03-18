"use client"

import Link from "next/link"
import { Calendar, Image, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "@/lib/utils"

interface PostCardProps {
  post: {
    id: string
    title: string
    description?: string
    images: {
      square: { base64: string }
    }
    createdAt: Date | string
  }
  onDelete?: (id: string) => void
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete && confirm("¿Estás seguro de eliminar este post?")) {
      onDelete(post.id)
    }
  }

  return (
    <Link href={`/posts/${post.id}`}>
      <div className="group bg-surface/50 border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300">
        <div className="aspect-square relative bg-zinc-900 overflow-hidden">
          <img
            src={`data:image/png;base64,${post.images.square.base64}`}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <div className="flex items-center gap-2 text-white text-sm">
              <Image className="w-4 h-4" />
              Ver detalles
            </div>
          </div>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="absolute top-2 right-2 p-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold mb-1 truncate">{post.title}</h3>
          {post.description && (
            <p className="text-sm text-zinc-500 mb-2 line-clamp-2">{post.description}</p>
          )}
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Calendar className="w-3 h-3" />
            {formatDistanceToNow(new Date(post.createdAt))}
          </div>
        </div>
      </div>
    </Link>
  )
}
