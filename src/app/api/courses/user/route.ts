import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserCourses } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const enrollments = await getUserCourses(session.user.id)

    return NextResponse.json({ enrollments })
  } catch (error) {
    console.error("Error fetching user courses:", error)
    return NextResponse.json({ error: "Error al obtener cursos" }, { status: 500 })
  }
}
