"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { LogOut, User, Loader2, Image, FolderOpen, Plus, Trophy } from "lucide-react"
import ProofBadge from "@/components/posts/ProofBadge"

interface ProofData {
  postCount: number
  currentLevel: {
    name: string
    minPosts: number
    badge: string
    color: string
  } | null
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [proofData, setProofData] = useState<ProofData | null>(null)
  const [isLoadingProof, setIsLoadingProof] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    if (status === "authenticated") {
      fetchProof()
    }
  }, [status, router])

  const fetchProof = async () => {
    try {
      const response = await fetch("/api/proof")
      const data = await response.json()
      if (!data.error) {
        setProofData(data)
      }
    } catch (error) {
      console.error("Error fetching proof:", error)
    } finally {
      setIsLoadingProof(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await signOut({ callbackUrl: "/" })
  }

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-zinc-400">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bienvenido, {session.user?.name}</h1>
            <p className="text-zinc-400">{session.user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          Cerrar sesión
        </button>
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
        </span>
        Usuario autenticado - Fase 3
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold mb-6">Panel de Control</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/posts/new"
              className="group p-6 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-2xl hover:border-primary/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Crear Post</h3>
              <p className="text-sm text-zinc-400">Sube una imagen y crea un nuevo post</p>
            </Link>

            <Link
              href="/posts"
              className="group p-6 bg-surface/50 border border-border rounded-2xl hover:border-primary/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FolderOpen className="w-6 h-6 text-zinc-400" />
              </div>
              <h3 className="font-semibold mb-1">Mis Posts</h3>
              <p className="text-sm text-zinc-400">Gestiona tus publicaciones</p>
            </Link>
          </div>
        </div>

        <div>
          <div className="bg-surface/50 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Proof of Participation</h3>
            </div>
            
            {isLoadingProof ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : proofData ? (
              <ProofBadge 
                level={proofData.currentLevel} 
                postCount={proofData.postCount} 
              />
            ) : (
              <p className="text-sm text-zinc-500">Carga tu primer post para comenzar</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-12">
        <h2 className="text-2xl font-bold mb-6">Procesar Imagen Rápida</h2>
        <p className="text-zinc-400 mb-6">Sube una imagen para generar los 3 formatos optimizados sin crear un post</p>
        
        <div className="max-w-2xl">
          <div className="bg-surface/30 border border-border rounded-2xl p-8">
            <ImageUploader compact />
          </div>
        </div>
      </div>
    </div>
  )
}

function ImageUploader({ compact = false }: { compact?: boolean }) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedResult, setProcessedResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      processFile(file)
    } else {
      setError("Por favor, selecciona un archivo de imagen válido.")
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [])

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo es demasiado grande. Máximo 10MB.")
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    setProcessedResult(null)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setError(null)

    const formData = new FormData()
    formData.append("image", selectedFile)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al procesar la imagen")
      }

      const data = await response.json()
      setProcessedResult(data)
    } catch (err) {
      setError("Error al procesar la imagen. Intenta de nuevo.")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = (base64: string, filename: string) => {
    const link = document.createElement("a")
    link.href = `data:image/png;base64,${base64}`
    link.download = filename
    link.click()
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setPreview(null)
    setProcessedResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatLabels = {
    square: { name: "Cuadrado", size: "1080×1080" },
    story: { name: "Historia", size: "1080×1920" },
    landscape: { name: "Landscape", size: "1200×630" },
  }

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300 ease-out
          ${isDragging 
            ? "border-primary bg-primary/10" 
            : selectedFile 
              ? "border-border bg-surface/50 cursor-default" 
              : "border-border hover:border-primary/50 hover:bg-surface/30"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!selectedFile ? (
          <div>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Image className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Arrastra tu imagen aquí
            </h3>
            <p className="text-zinc-400 text-sm">
              PNG, JPG, WEBP • Máximo 10MB
            </p>
          </div>
        ) : (
          <div>
            <div className="relative mx-auto mb-4">
              <div className="w-32 h-32 mx-auto rounded-xl overflow-hidden border border-border">
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  resetUpload()
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="text-xs text-red-400">×</span>
              </button>
            </div>

            {!processedResult && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleUpload()
                }}
                disabled={isProcessing}
                className="px-6 py-2 bg-gradient-to-r from-primary to-accent rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Procesar"
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {processedResult && (
        <div className="mt-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 text-xs">✓</span>
            </div>
            <h3 className="font-medium">Imágenes generadas</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(formatLabels) as Array<keyof typeof formatLabels>).map((format) => {
              const label = formatLabels[format]
              const image = processedResult.formats[format]

              return (
                <div
                  key={format}
                  className="bg-surface border border-border rounded-lg overflow-hidden"
                >
                  <div 
                    className="aspect-square relative bg-zinc-900 cursor-pointer"
                    onClick={() => downloadImage(image.base64, `aura-${format}.png`)}
                  >
                    <img
                      src={`data:image/png;base64,${image.base64}`}
                      alt={label.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-2 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">{label.name}</span>
                    <button
                      onClick={() => downloadImage(image.base64, `aura-${format}.png`)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <span className="text-xs text-zinc-400">↓</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={resetUpload}
            className="mt-4 w-full py-2 border border-border rounded-lg hover:border-primary/50 transition-colors text-zinc-400 text-sm"
          >
            Procesar otra imagen
          </button>
        </div>
      )}
    </div>
  )
}
