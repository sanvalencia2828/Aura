"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import CourseCard from "@/components/courses/CourseCard"
import { Loader2, BookOpen, Award } from "lucide-react"

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
  modules: { id: string }[]
}

const CATEGORIES = ["Todos", "Idiomas", "Arte y Creatividad", "Cultura", "Negocios"]

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      const data = await response.json()
      if (data.courses) {
        setCourses(data.courses)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCourses = selectedCategory === "Todos"
    ? courses
    : courses.filter((c) => c.category === selectedCategory)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-sm text-primary/80 font-medium">ximimalab</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Catálogo de Cursos</h1>
          <p className="text-zinc-400">Aprende con los mejores instructores</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
            🎓
          </div>
          <div>
            <h2 className="font-semibold text-lg">Instituto Ximali</h2>
            <p className="text-sm text-zinc-400">
              Centro de aprendizaje de idiomas y cultura
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === category
                ? "bg-primary text-white"
                : "bg-surface/50 text-zinc-400 hover:text-white border border-border hover:border-primary/30"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-surface/30 rounded-2xl border border-border">
          <Award className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
          <h3 className="text-xl font-semibold mb-2">No hay cursos disponibles</h3>
          <p className="text-zinc-400">Pronto añadiremos más cursos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-zinc-500 text-sm">
          ¿Eres instructor?{" "}
          <Link href="#" className="text-primary hover:underline">
            Conviértete en instructor
          </Link>
        </p>
      </div>
    </div>
  )
}
