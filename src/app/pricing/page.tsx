"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, X, Loader2, Crown, Zap, Star, Lock, ArrowLeft } from "lucide-react"

interface PlanData {
  name: string
  price: number
  features: string[]
}

interface SubscriptionData {
  currentPlan: string
  postCount: number
  plans: {
    free: PlanData
    pro: PlanData
    premium: PlanData
  }
  lockedFeatures: {
    name: string
    requiredPosts: number
    postsNeeded: number
    requiredPlan: string
  }[]
}

const PLAN_ICONS = {
  free: Star,
  pro: Zap,
  premium: Crown,
}

const PLAN_COLORS = {
  free: "from-zinc-600 to-zinc-700",
  pro: "from-blue-600 to-indigo-700",
  premium: "from-purple-600 to-pink-700",
}

export default function PricingPage() {
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/subscription/status")
      const result = await response.json()
      if (!result.error) {
        setData(result)
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (plan: string) => {
    setIsSubscribing(plan)
    setMessage("")

    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(`¡Te has suscrito al plan ${plan} exitosamente!`)
        fetchStatus()
      } else {
        setMessage(result.error || "Error al procesar la suscripción")
      }
    } catch (error) {
      setMessage("Error al procesar la suscripción")
    } finally {
      setIsSubscribing(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-400">Error al cargar la información</p>
        <Link href="/dashboard" className="text-primary hover:underline mt-4 inline-block">
          Volver al dashboard
        </Link>
      </div>
    )
  }

  const plans = ["free", "pro", "premium"] as const

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al dashboard
        </Link>
        
        <h1 className="text-4xl font-bold mb-4">Elige tu Plan</h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Desbloquea funciones premium con nuestra suscripción o gana acceso gratis creando contenido
        </p>
        
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
          <span className="text-primary font-medium">Tus posts:</span>
          <span className="font-bold">{data.postCount}</span>
        </div>
      </div>

      {message && (
        <div className={`max-w-md mx-auto mb-8 p-4 rounded-xl text-center ${
          message.includes("exitosamente") 
            ? "bg-green-500/10 border border-green-500/30 text-green-400"
            : "bg-red-500/10 border border-red-500/30 text-red-400"
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
        {plans.map((planKey) => {
          const plan = data.plans[planKey]
          const Icon = PLAN_ICONS[planKey]
          const isCurrentPlan = data.currentPlan === planKey
          const isUpgrade = planKey !== "free"

          return (
            <div
              key={planKey}
              className={`relative bg-gradient-to-br ${PLAN_COLORS[planKey]} rounded-2xl overflow-hidden ${
                planKey === "premium" ? "ring-2 ring-purple-500" : ""
              }`}
            >
              {planKey === "premium" && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-center py-1 text-xs font-semibold">
                  Más Popular
                </div>
              )}

              <div className="p-6 pt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p className="text-3xl font-bold">
                      ${plan.price}
                      {plan.price > 0 && <span className="text-sm font-normal text-zinc-300">/mes</span>}
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(planKey)}
                  disabled={isCurrentPlan || isSubscribing !== null}
                  className={`w-full py-3 rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? "bg-white/20 cursor-default"
                      : isUpgrade
                        ? "bg-white text-zinc-900 hover:bg-white/90"
                        : "bg-zinc-600 hover:bg-zinc-500"
                  }`}
                >
                  {isSubscribing === planKey ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : isCurrentPlan ? (
                    "Plan Actual"
                  ) : isUpgrade ? (
                    `Suscribirse`
                  ) : (
                    "Plan Gratuito"
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {data.lockedFeatures.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Desbloquea más funciones
          </h2>
          
          <div className="bg-surface/50 border border-border rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.lockedFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-background/50 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{feature.name}</h4>
                    <p className="text-sm text-zinc-500">
                      {feature.postsNeeded > 0 
                        ? `Necesitas ${feature.postsNeeded} posts más`
                        : `Requiere plan ${feature.requiredPlan}`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-zinc-400">
                      {feature.requiredPosts} posts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 text-center text-zinc-500 text-sm">
        <p>¿Preguntas? <Link href="#" className="text-primary hover:underline">Contacta soporte</Link></p>
      </div>
    </div>
  )
}
