"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ImageUploader from "@/components/upload/ImageUploader"
import { ArrowLeft, Loader2, Check } from "lucide-react"

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [images, setImages] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleImagesProcessed = useCallback((processedImages: any) => {
    setImages(processedImages)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("El título es requerido")
      return
    }

    if (!images) {
      setError("Debes procesar una imagen primero")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          images,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el post")
      }

      setSuccess(true)
      
      setTimeout(() => {
        router.push("/posts")
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link 
        href="/posts"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a mis posts
      </Link>

      <h1 className="text-3xl font-bold mb-8">Crear Nuevo Post</h1>

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="font-medium text-green-400">¡Post creado exitosamente!</p>
            <p className="text-sm text-zinc-400">Redirigiendo a tus posts...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Título del post *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="Ej: Mi primer diseño para Instagram"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Descripción (opcional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary/50 transition-colors resize-none"
            placeholder="Describe tu post..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Imagen *
          </label>
          <ImageUploader onImagesProcessed={handleImagesProcessed} compact />
          {!images && (
            <p className="text-xs text-zinc-500 mt-2">
              Procesa una imagen para continuar
            </p>
          )}
          {images && (
            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Imagen lista para usar
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !images}
          className="w-full py-3 bg-gradient-to-r from-primary to-accent rounded-xl font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creando post...
            </>
          ) : (
            "Crear Post"
          )}
        </button>
      </form>
    </div>
  )
}
