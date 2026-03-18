import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserSubscription, getPostCountByUserId, getUserUnlockedFeatures, FEATURES, PLANS } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const subscription = await getUserSubscription(session.user.id)
    const postCount = await getPostCountByUserId(session.user.id)
    const unlockedFeatures = await getUserUnlockedFeatures(session.user.id, postCount)

    const lockedFeatures = FEATURES.filter(
      (f) => !unlockedFeatures.find((uf) => uf.name === f.name)
    )

    return NextResponse.json({
      subscription,
      postCount,
      currentPlan: subscription?.plan || "free",
      plans: PLANS,
      unlockedFeatures: unlockedFeatures.map((f) => f.name),
      lockedFeatures: lockedFeatures.map((f) => ({
        ...f,
        postsNeeded: f.requiredPosts - postCount > 0 ? f.requiredPosts - postCount : 0,
      })),
    })
  } catch (error) {
    console.error("Error fetching subscription status:", error)
    return NextResponse.json({ error: "Error al obtener estado" }, { status: 500 })
  }
}
