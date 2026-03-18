"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Calendar, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Post {
  id: string
  title: string
  description?: string
  images: {
    square: { base64: string; width: number; height: number }
    story: { base64: string; width: number; height: number }
    landscape: { base64: string; width: number; height: number }
  }
  createdAt: string
}

const formatLabels = {
  square: { name: "Cuadrado", size: "1080×1080", ratio: "1:1" },
  story: { name: "Historia", size: "1080×1920", ratio: "9:16" },
  landscape: { name: "Landscape", size: "1200×630", ratio: "1.9:1" },
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedFormat, setSelectedFormat] = useState<keyof typeof formatLabels>("square")

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string)
    }
  }, [params.id])

  const fetchPost = async (id: string) => {
    try {
      const response = await fetch(`/api/posts/${id}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Error al cargar el post")
      }
      
      setPost(data.post)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadImage = (base64: string, filename: string) => {
    const link = document.createElement("a")
    link.href = `data:image/png;base64,${base64}`
    link.download = filename
    link.click()
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-red-400 mb-4">{error || "Post no encontrado"}</p>
          <Link href="/posts" className="text-primary hover:underline">
            Volver a mis posts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link 
        href="/posts"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a mis posts
      </Link>

      <div className="bg-surface/50 border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
          {post.description && (
            <p className="text-zinc-400 mb-3">{post.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Calendar className="w-4 h-4" />
            {formatDate(new Date(post.createdAt))}
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(Object.keys(formatLabels) as Array<keyof typeof formatLabels>).map((format) => (
              <button
                key={format}
                onClick={() => setSelectedFormat(format)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedFormat === format
                    ? "bg-primary text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {formatLabels[format].name}
              </button>
            ))}
          </div>

          <div className="relative bg-zinc-900 rounded-xl overflow-hidden mb-6">
            <img
              src={`data:image/png;base64,${post.images[selectedFormat].base64}`}
              alt={post.title}
              className="w-full h-auto max-h-[500px] object-contain mx-auto"
            />
          </div>

          <div className="flex items-center justify-between bg-zinc-900/50 rounded-xl p-4">
            <div>
              <p className="font-medium">{formatLabels[selectedFormat].name}</p>
              <p className="text-sm text-zinc-500">
                {post.images[selectedFormat].width} × {post.images[selectedFormat].height} • Ratio {formatLabels[selectedFormat].ratio}
              </p>
            </div>
            <button
              onClick={() => downloadImage(post.images[selectedFormat].base64, `aura-${post.id}-${selectedFormat}.png`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {(Object.keys(formatLabels) as Array<keyof typeof formatLabels>).map((format) => (
              <div 
                key={format}
                className="bg-zinc-900/30 rounded-xl p-3 cursor-pointer hover:bg-zinc-900/50 transition-colors"
                onClick={() => setSelectedFormat(format)}
              >
                <div className="aspect-square bg-zinc-900 rounded-lg overflow-hidden mb-2">
                  <img
                    src={`data:image/png;base64,${post.images[format].base64}`}
                    alt={formatLabels[format].name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs text-center text-zinc-500">
                  {formatLabels[format].name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(Object.keys(formatLabels) as Array<keyof typeof formatLabels>).map((format) => (
          <button
            key={format}
            onClick={() => downloadImage(post.images[format].base64, `aura-${post.id}-${format}.png`)}
            className="flex items-center justify-center gap-2 py-3 bg-surface/50 border border-border rounded-xl hover:border-primary/50 transition-colors"
          >
            <Download className="w-4 h-4" />
            {formatLabels[format].name}
          </button>
        ))}
      </div>
    </div>
  )
}
