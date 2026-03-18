import Link from "next/link"
import { Clock, Users, Star } from "lucide-react"

interface CourseCardProps {
  course: {
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
}

const levelColors: Record<string, string> = {
  "Básico": "bg-green-500/20 text-green-400 border-green-500/30",
  "Intermedio": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Avanzado": "bg-red-500/20 text-red-400 border-red-500/30",
}

const categoryColors: Record<string, string> = {
  "Idiomas": "from-blue-500/20 to-purple-500/20",
  "Arte y Creatividad": "from-pink-500/20 to-orange-500/20",
  "Cultura": "from-green-500/20 to-teal-500/20",
  "Negocios": "from-yellow-500/20 to-red-500/20",
}

export default function CourseCard({ course }: CourseCardProps) {
  const gradientClass = categoryColors[course.category] || "from-primary/20 to-accent/20"

  return (
    <Link href={`/courses/${course.id}`}>
      <div className={`group bg-gradient-to-br ${gradientClass} border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 h-full flex flex-col`}>
        <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl opacity-30 group-hover:opacity-50 transition-opacity">
              📚
            </div>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 text-xs rounded-full border ${levelColors[course.level] || "bg-zinc-700/50 text-zinc-300 border-zinc-600/50"}`}>
              {course.level}
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <span className="text-xs text-primary/80 font-medium mb-2">
            {course.category}
          </span>

          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          <p className="text-sm text-zinc-400 mb-3 line-clamp-2 flex-1">
            {course.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.duration}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {course.modules.length} módulos
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div>
              <p className="text-xs text-zinc-500">{course.instructor}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                ${course.price}
              </p>
              <p className="text-xs text-zinc-500">{course.currency}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
