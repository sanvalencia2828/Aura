"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Loader2, Trophy, Medal } from "lucide-react"
import PostCard from "@/components/posts/PostCard"
import ProofBadge from "@/components/posts/ProofBadge"

interface Post {
  id: string
  title: string
  description?: string
  images: {
    square: { base64: string }
  }
  createdAt: string
}

interface ProofData {
  postCount: number
  currentLevel: {
    name: string
    minPosts: number
    badge: string
    color: string
  } | null
  allLevels: {
    name: string
    minPosts: number
    badge: string
    color: string
  }[]
}

export default function PostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [proofData, setProofData] = useState<ProofData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProofLoading, setIsProofLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
    fetchProof()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts")
      const data = await response.json()
      if (data.posts) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProof = async () => {
    try {
      const response = await fetch("/api/proof")
      const data = await response.json()
      if (!data.error) {
        setProofData(data)
      }
    } catch (error) {
      console.error("Error fetching proof:", error)
    } finally {
      setIsProofLoading(false)
    }
  }

  const handleDeletePost = async (id: string) => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setPosts(posts.filter((p) => p.id !== id))
        fetchProof()
      }
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis Posts</h1>
          <p className="text-zinc-400">Gestiona tus creaciones</p>
        </div>
        <Link
          href="/posts/new"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl font-medium hover:opacity-90 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Post
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="bg-surface/50 border border-border rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Proof of Participation</h2>
              </div>
              
              {isProofLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : proofData ? (
                <>
                  <ProofBadge 
                    level={proofData.currentLevel} 
                    postCount={proofData.postCount} 
                  />
                  
                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="text-sm font-medium mb-3 text-zinc-400">Progreso</h3>
                    <div className="space-y-2">
                      {proofData.allLevels.map((level) => {
                        const isAchieved = proofData.postCount >= level.minPosts
                        const progress = Math.min(
                          100,
                          ((proofData.postCount - level.minPosts) / 
                            ((proofData.allLevels[proofData.allLevels.indexOf(level) + 1]?.minPosts || level.minPosts + 10) - level.minPosts)) * 100
                        )
                        
                        return (
                          <div key={level.name} className="flex items-center gap-3">
                            <span className="text-lg">{level.badge}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className={isAchieved ? "text-white" : "text-zinc-500"}>
                                  {level.name}
                                </span>
                                <span className="text-zinc-500">
                                  {level.minPosts} posts
                                </span>
                              </div>
                              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${isAchieved ? 100 : Math.max(0, progress)}%`,
                                    backgroundColor: isAchieved ? level.color : "#3f3f46"
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-surface/30 rounded-2xl border border-border">
              <Medal className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
              <h3 className="text-xl font-semibold mb-2">Aún no tienes posts</h3>
              <p className="text-zinc-400 mb-6">Crea tu primer post para comenzar tu journey</p>
              <Link
                href="/posts/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl font-medium hover:opacity-90 transition-all"
              >
                <Plus className="w-5 h-5" />
                Crear mi primer post
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onDelete={handleDeletePost} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
