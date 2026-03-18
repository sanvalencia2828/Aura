import { v4 as uuidv4 } from "uuid"
import * as fs from "fs"
import * as path from "path"

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  image: string
  price: number
  currency: string
  duration: string
  level: "Básico" | "Intermedio" | "Avanzado"
  category: string
  modules: CourseModule[]
  featured: boolean
  createdAt: Date
}

export interface CourseModule {
  id: string
  title: string
  description: string
  duration: string
  completed?: boolean
}

export interface UserCourse {
  id: string
  userId: string
  courseId: string
  enrolledAt: Date
  progress: number
  completedModules: string[]
  certificateUrl?: string
}

const COURSES_DB_PATH = path.join(process.cwd(), "courses.json")
const USERS_COURSES_DB_PATH = path.join(process.cwd(), "users_courses.json")

function readCourses(): Course[] {
  try {
    if (fs.existsSync(COURSES_DB_PATH)) {
      const data = fs.readFileSync(COURSES_DB_PATH, "utf8")
      const parsed = JSON.parse(data)
      return parsed.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
      }))
    }
  } catch (e) {
    console.error("Error reading courses:", e)
  }
  return []
}

function writeCourses(courses: Course[]): void {
  try {
    fs.writeFileSync(COURSES_DB_PATH, JSON.stringify(courses, null, 2))
  } catch (e) {
    console.error("Error writing courses:", e)
  }
}

function readUsersCourses(): UserCourse[] {
  try {
    if (fs.existsSync(USERS_COURSES_DB_PATH)) {
      const data = fs.readFileSync(USERS_COURSES_DB_PATH, "utf8")
      const parsed = JSON.parse(data)
      return parsed.map((uc: any) => ({
        ...uc,
        enrolledAt: new Date(uc.enrolledAt),
      }))
    }
  } catch (e) {
    console.error("Error reading users courses:", e)
  }
  return []
}

function writeUsersCourses(usersCourses: UserCourse[]): void {
  try {
    fs.writeFileSync(USERS_COURSES_DB_PATH, JSON.stringify(usersCourses, null, 2))
  } catch (e) {
    console.error("Error writing users courses:", e)
  }
}

const INITIAL_COURSES: Omit<Course, "id" | "createdAt">[] = [
  {
    title: "Español para Principiantes",
    description: "Aprende los fundamentos del español desde cero. Perfecto para quienes nunca han estudiado español antes.",
    instructor: "Instituto Ximali",
    image: "/courses/spanish-basic.jpg",
    price: 49.99,
    currency: "USD",
    duration: "8 semanas",
    level: "Básico",
    category: "Idiomas",
    featured: true,
    modules: [
      { id: "1", title: "Alfabeto y Pronunciación", description: "Aprende a pronunciar cada letra correctamente", duration: "45 min" },
      { id: "2", title: "Saludos y Presentaciones", description: "Saluda y preséntate en español", duration: "1 hora" },
      { id: "3", title: "Números y Colores", description: "Cuenta y nombra los colores básicos", duration: "45 min" },
      { id: "4", title: "Días de la Semana y Meses", description: "Aprende el calendario en español", duration: "30 min" },
    ],
  },
  {
    title: "Español Intermedio",
    description: "Mejora tu español con gramática más avanzada y conversación fluida.",
    instructor: "Instituto Ximali",
    image: "/courses/spanish-intermediate.jpg",
    price: 79.99,
    currency: "USD",
    duration: "12 semanas",
    level: "Intermedio",
    category: "Idiomas",
    featured: true,
    modules: [
      { id: "1", title: "Presente Perfecto", description: "Domina el presente perfecto", duration: "1 hora" },
      { id: "2", title: "Pretérito Indefinido", description: "Habla de eventos pasados", duration: "1 hora" },
      { id: "3", title: "Subjuntivo Presente", description: "Expresa duda y deseo", duration: "1.5 horas" },
      { id: "4", title: "Conversación Diario", description: "Práctica de conversación", duration: "45 min" },
    ],
  },
  {
    title: "Inmersión Total en Español",
    description: "Experiencia completa de inmersión para alcanzar fluidez total.",
    instructor: "Instituto Ximali",
    image: "/courses/spanish-immersion.jpg",
    price: 199.99,
    currency: "USD",
    duration: "4 semanas",
    level: "Avanzado",
    category: "Idiomas",
    featured: true,
    modules: [
      { id: "1", title: "Inmersión Cultural", description: "Historia y cultura mexicana", duration: "3 horas" },
      { id: "2", title: "Español de los Negocios", description: "Comunicación profesional", duration: "2 horas" },
      { id: "3", title: "Conversación Avanzada", description: "Debates y presentaciones", duration: "2 horas" },
      { id: "4", title: "Proyecto Final", description: "Presenta tu aprendizaje", duration: "4 horas" },
    ],
  },
  {
    title: "Taller de Escritura Creativa",
    description: "Desarrolla tu creatividad escribiendo historias en español.",
    instructor: "Instituto Ximali",
    image: "/courses/writing.jpg",
    price: 59.99,
    currency: "USD",
    duration: "6 semanas",
    level: "Intermedio",
    category: "Arte y Creatividad",
    featured: false,
    modules: [
      { id: "1", title: "Fundamentos de la Escritura", description: "Estructura narrativa básica", duration: "1 hora" },
      { id: "2", title: "Creación de Personajes", description: "Desarrolla personajes memorables", duration: "1 hora" },
      { id: "3", title: "Diálogos y Escenas", description: "Escribe conversaciones realistas", duration: "1 hora" },
    ],
  },
  {
    title: "Cultura Mexicana",
    description: "Explora la rica herencia cultural de México.",
    instructor: "Instituto Ximali",
    image: "/courses/mexico-culture.jpg",
    price: 39.99,
    currency: "USD",
    duration: "4 semanas",
    level: "Básico",
    category: "Cultura",
    featured: false,
    modules: [
      { id: "1", title: "Historia de México", description: "Desde los mayas hasta hoy", duration: "2 horas" },
      { id: "2", title: "Artes y Tradiciones", description: "Arte popular y festividades", duration: "1.5 horas" },
      { id: "3", title: "Gastronomía", description: "Cocina tradicional mexicana", duration: "1 hora" },
    ],
  },
]

export async function getCourses(): Promise<Course[]> {
  let courses = readCourses()
  
  if (courses.length === 0) {
    courses = INITIAL_COURSES.map((course) => ({
      ...course,
      id: uuidv4(),
      createdAt: new Date(),
    }))
    writeCourses(courses)
  }
  
  return courses
}

export async function getCourseById(id: string): Promise<Course | null> {
  const courses = await getCourses()
  return courses.find((c) => c.id === id) || null
}

export async function getFeaturedCourses(): Promise<Course[]> {
  const courses = await getCourses()
  return courses.filter((c) => c.featured)
}

export async function getCoursesByCategory(category: string): Promise<Course[]> {
  const courses = await getCourses()
  return courses.filter((c) => c.category === category)
}

export async function enrollInCourse(userId: string, courseId: string): Promise<UserCourse> {
  const usersCourses = readUsersCourses()
  
  const existing = usersCourses.find(
    (uc) => uc.userId === userId && uc.courseId === courseId
  )
  
  if (existing) {
    return existing
  }
  
  const newEnrollment: UserCourse = {
    id: uuidv4(),
    userId,
    courseId,
    enrolledAt: new Date(),
    progress: 0,
    completedModules: [],
  }
  
  usersCourses.push(newEnrollment)
  writeUsersCourses(usersCourses)
  
  return newEnrollment
}

export async function getUserCourses(userId: string): Promise<(UserCourse & { course: Course })[]> {
  const usersCourses = readUsersCourses()
  const courses = await getCourses()
  
  return usersCourses
    .filter((uc) => uc.userId === userId)
    .map((uc) => ({
      ...uc,
      course: courses.find((c) => c.id === uc.courseId)!,
    }))
    .filter((uc) => uc.course)
}

export async function updateCourseProgress(
  userId: string,
  courseId: string,
  moduleId: string,
  completed: boolean
): Promise<UserCourse | null> {
  const usersCourses = readUsersCourses()
  const userCourse = usersCourses.find(
    (uc) => uc.userId === userId && uc.courseId === courseId
  )
  
  if (!userCourse) return null
  
  if (completed && !userCourse.completedModules.includes(moduleId)) {
    userCourse.completedModules.push(moduleId)
  } else if (!completed) {
    userCourse.completedModules = userCourse.completedModules.filter((id) => id !== moduleId)
  }
  
  const course = await getCourseById(courseId)
  if (course) {
    userCourse.progress = (userCourse.completedModules.length / course.modules.length) * 100
  }
  
  writeUsersCourses(usersCourses)
  return userCourse
}

export async function isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
  const usersCourses = readUsersCourses()
  return usersCourses.some((uc) => uc.userId === userId && uc.courseId === courseId)
}
