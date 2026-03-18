import { NextRequest, NextResponse } from "next/server"
import { getCourses, getFeaturedCourses, getCoursesByCategory } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")
    const category = searchParams.get("category")

    if (featured === "true") {
      const courses = await getFeaturedCourses()
      return NextResponse.json({ courses })
    }

    if (category) {
      const courses = await getCoursesByCategory(category)
      return NextResponse.json({ courses })
    }

    const courses = await getCourses()
    return NextResponse.json({ courses })
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ error: "Error al obtener cursos" }, { status: 500 })
  }
}
