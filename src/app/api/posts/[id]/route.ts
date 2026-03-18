import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPostById, deletePost } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const post = await getPostById(id)

    if (!post) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 })
    }

    if (post.userId !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para ver este post" }, { status: 403 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json({ error: "Error al obtener post" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const post = await getPostById(id)

    if (!post) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 })
    }

    if (post.userId !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para eliminar este post" }, { status: 403 })
    }

    const deleted = await deletePost(id)

    return NextResponse.json({ success: deleted })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ error: "Error al eliminar post" }, { status: 500 })
  }
}
