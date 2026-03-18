import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createPost, getPostsByUserId, PROOF_LEVELS } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const posts = await getPostsByUserId(session.user.id)
    
    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Error al obtener posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { title, description, images } = await request.json()

    if (!title || !images) {
      return NextResponse.json({ error: "Título e imágenes son requeridos" }, { status: 400 })
    }

    const post = await createPost({
      userId: session.user.id,
      title,
      description,
      images,
    })

    const postCount = await getPostsByUserId(session.user.id)
    const proofLevel = PROOF_LEVELS.find((level, index) => {
      const nextLevel = PROOF_LEVELS[index + 1]
      return postCount.length >= level.minPosts && 
             (!nextLevel || postCount.length < nextLevel.minPosts)
    })

    return NextResponse.json({
      success: true,
      post,
      proofLevel: proofLevel || null,
    })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Error al crear post" }, { status: 500 })
  }
}
