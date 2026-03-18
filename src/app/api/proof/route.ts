import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPostCountByUserId, getUserProofLevel, PROOF_LEVELS } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const postCount = await getPostCountByUserId(session.user.id)
    const currentLevel = await getUserProofLevel(session.user.id)
    const nextLevel = PROOF_LEVELS.find((level) => level.minPosts > postCount)

    return NextResponse.json({
      postCount,
      currentLevel,
      nextLevel,
      allLevels: PROOF_LEVELS,
    })
  } catch (error) {
    console.error("Error fetching proof:", error)
    return NextResponse.json({ error: "Error al obtener proof" }, { status: 500 })
  }
}
