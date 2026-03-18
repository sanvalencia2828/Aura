"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Star, BookOpen, User, Loader2, Check, Lock, Play } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  image: string
  price: number
  currency: string
  duration: string
  level: string
  category: string
  modules: {
    id: string
    title: string
    description: string
    duration: string
  }[]
}

const levelColors: Record<string, string> = {
  "Básico": "bg-green-500/20 text-green-400 border-green-500/30",
  "Intermedio": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Avanzado": "bg-red-500/20 text-red-400 border-red-500/30",
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [enrolled, setEnrolled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchCourse(params.id as string)
    }
  }, [params.id])

  const fetchCourse = async (id: string) => {
    try {
      const response = await fetch(`/api/courses/${id}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Error al cargar el curso")
      }
      
      setCourse(data.course)
      setEnrolled(data.enrolled)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!course) return

    setIsEnrolling(true)
    setError("")

    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: "POST",
      })
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login")
          return
        }
        throw new Error(data.error || "Error al inscribirse")
      }

      setEnrolled(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsEnrolling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/courses" className="text-primary hover:underline">
            Volver a cursos
          </Link>
        </div>
      </div>
    )
  }

  if (!course) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link 
        href="/courses"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a cursos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 rounded-2xl overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 relative flex items-center justify-center">
              <div className="text-8xl opacity-30">📚</div>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1 text-sm rounded-full border ${levelColors[course.level] || "bg-zinc-700/50 text-zinc-300 border-zinc-600/50"}`}>
                  {course.level}
                </span>
                <span className="px-3 py-1 text-sm rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
                  {course.category}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h1 className="text-2xl font-bold mb-3">{course.title}</h1>
              <p className="text-zinc-400 mb-4">{course.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {course.instructor}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  {course.modules.length} módulos
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Contenido del Curso
            </h2>

            <div className="space-y-3">
              {course.modules.map((module, index) => (
                <div
                  key={module.id}
                  className="bg-surface/50 border border-border rounded-xl p-4 flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    enrolled 
                      ? "bg-primary/20 text-primary" 
                      : "bg-zinc-800 text-zinc-500"
                  }`}>
                    {enrolled ? index + 1 : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{module.title}</h3>
                    <p className="text-sm text-zinc-500">{module.description}</p>
                  </div>
                  <span className="text-sm text-zinc-500">{module.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="bg-surface/50 border border-border rounded-2xl p-6">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-primary">${course.price}</p>
                <p className="text-sm text-zinc-500">{course.currency}</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {enrolled ? (
                <div className="space-y-3">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                    <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="font-medium text-green-400">Ya estás inscrito</p>
                  </div>
                  <button className="w-full py-3 bg-gradient-to-r from-primary to-accent rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" />
                    Continuar Aprendiendo
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="w-full py-3 bg-gradient-to-r from-primary to-accent rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isEnrolling ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Inscribiéndose...
                    </>
                  ) : (
                    <>
                      Inscribirse Ahora
                    </>
                  )}
                </button>
              )}

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm font-medium mb-3">Este curso incluye:</p>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Acceso de por vida
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    {course.modules.length} módulos de video
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Certificado de finalización
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Soporte de instructor
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
