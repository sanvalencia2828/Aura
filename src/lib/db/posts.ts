import { v4 as uuidv4 } from "uuid"
import * as fs from "fs"
import * as path from "path"

export interface PostImage {
  base64: string
  width: number
  height: number
}

export interface PostProof {
  issuedAt: Date
  certificateId: string
  participationType: string
}

export interface Post {
  id: string
  userId: string
  title: string
  description?: string
  images: {
    square: PostImage
    story: PostImage
    landscape: PostImage
  }
  createdAt: Date
  proofOfParticipation?: PostProof
}

export interface ProofLevel {
  name: string
  minPosts: number
  badge: string
  color: string
}

export const PROOF_LEVELS: ProofLevel[] = [
  { name: "Iniciante", minPosts: 1, badge: "🥉", color: "#cd7f32" },
  { name: "Participante", minPosts: 5, badge: "🥈", color: "#c0c0c0" },
  { name: "Creador Activo", minPosts: 10, badge: "🥇", color: "#ffd700" },
  { name: "Maestro Creador", minPosts: 25, badge: "💎", color: "#b9f2ff" },
]

const DB_PATH = path.join(process.cwd(), "posts.json")

function readPosts(): Post[] {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8")
      const parsed = JSON.parse(data)
      return parsed.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        proofOfParticipation: p.proofOfParticipation ? {
          ...p.proofOfParticipation,
          issuedAt: new Date(p.proofOfParticipation.issuedAt),
        } : undefined,
      }))
    }
  } catch (e) {
    console.error("Error reading posts:", e)
  }
  return []
}

function writePosts(posts: Post[]): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(posts, null, 2))
  } catch (e) {
    console.error("Error writing posts:", e)
  }
}

export async function createPost(input: Omit<Post, "id" | "createdAt" | "proofOfParticipation">): Promise<Post> {
  const posts = readPosts()
  
  const newPost: Post = {
    id: uuidv4(),
    ...input,
    createdAt: new Date(),
  }

  posts.push(newPost)
  writePosts(posts)

  return newPost
}

export async function getPostsByUserId(userId: string): Promise<Post[]> {
  const posts = readPosts()
  return posts.filter((p) => p.userId === userId).sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  )
}

export async function getPostById(id: string): Promise<Post | null> {
  const posts = readPosts()
  return posts.find((p) => p.id === id) || null
}

export async function getAllPosts(): Promise<Post[]> {
  const posts = readPosts()
  return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function getPostCountByUserId(userId: string): Promise<number> {
  const posts = readPosts()
  return posts.filter((p) => p.userId === userId).length
}

export async function getUserProofLevel(userId: string): Promise<ProofLevel | null> {
  const count = await getPostCountByUserId(userId)
  
  for (let i = PROOF_LEVELS.length - 1; i >= 0; i--) {
    if (count >= PROOF_LEVELS[i].minPosts) {
      return PROOF_LEVELS[i]
    }
  }
  
  return null
}

export async function deletePost(id: string): Promise<boolean> {
  const posts = readPosts()
  const index = posts.findIndex((p) => p.id === id)
  
  if (index === -1) return false
  
  posts.splice(index, 1)
  writePosts(posts)
  return true
}
