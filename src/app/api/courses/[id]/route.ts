import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getCourseById, isUserEnrolled, enrollInCourse } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const course = await getCourseById(id)

    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    const session = await auth()
    let enrolled = false

    if (session?.user?.id) {
      enrolled = await isUserEnrolled(session.user.id, id)
    }

    return NextResponse.json({ course, enrolled })
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json({ error: "Error al obtener curso" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const course = await getCourseById(id)

    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    const enrollment = await enrollInCourse(session.user.id, id)

    return NextResponse.json({ success: true, enrollment })
  } catch (error) {
    console.error("Error enrolling in course:", error)
    return NextResponse.json({ error: "Error al inscribirse" }, { status: 500 })
  }
}
