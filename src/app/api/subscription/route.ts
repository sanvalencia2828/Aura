import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createSubscription, PLANS } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { plan } = await request.json()

    if (!plan || !["pro", "premium"].includes(plan)) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 })
    }

    const planDetails = PLANS[plan as keyof typeof PLANS]
    
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    const subscription = await createSubscription({
      userId: session.user.id,
      plan: plan as "pro" | "premium",
      status: "active",
      startedAt: new Date(),
      expiresAt,
    })

    return NextResponse.json({
      success: true,
      subscription,
      message: `Te has suscrito al plan ${planDetails.name}`,
    })
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json({ error: "Error al crear suscripción" }, { status: 500 })
  }
}
