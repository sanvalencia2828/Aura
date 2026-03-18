import { v4 as uuidv4 } from "uuid"
import * as fs from "fs"
import * as path from "path"

export interface Subscription {
  id: string
  userId: string
  plan: "free" | "pro" | "premium"
  status: "active" | "cancelled" | "expired"
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  startedAt: Date
  expiresAt?: Date
  createdAt: Date
}

export interface FeatureAccess {
  name: string
  description: string
  requiredPosts: number
  requiredPlan: "free" | "pro" | "premium"
  isPremium: boolean
}

export const FEATURES: FeatureAccess[] = [
  {
    name: "Procesamiento de Imágenes",
    description: "Redimensiona imágenes a múltiples formatos",
    requiredPosts: 0,
    requiredPlan: "free",
    isPremium: false,
  },
  {
    name: "Creación de Posts",
    description: "Crea y guarda posts con tus imágenes",
    requiredPosts: 0,
    requiredPlan: "free",
    isPremium: false,
  },
  {
    name: "Cursos Básicos",
    description: "Acceso a cursos de nivel básico",
    requiredPosts: 3,
    requiredPlan: "free",
    isPremium: false,
  },
  {
    name: "Cursos Intermedios",
    description: "Acceso a cursos de nivel intermedio",
    requiredPosts: 5,
    requiredPlan: "pro",
    isPremium: true,
  },
  {
    name: "Certificados de Cursos",
    description: "Descarga certificados de finalización",
    requiredPosts: 8,
    requiredPlan: "pro",
    isPremium: true,
  },
  {
    name: "Todos los Cursos",
    description: "Acceso completo al catálogo incluyendo avanzados",
    requiredPosts: 15,
    requiredPlan: "premium",
    isPremium: true,
  },
  {
    name: "Mentoría Personalizada",
    description: "1 sesión de mentoría con instructor",
    requiredPosts: 20,
    requiredPlan: "premium",
    isPremium: true,
  },
  {
    name: "Contenido Exclusivo",
    description: "Materiales y recursos premium",
    requiredPosts: 25,
    requiredPlan: "premium",
    isPremium: true,
  },
]

export const PLANS = {
  free: {
    name: "Gratuito",
    price: 0,
    features: ["Procesamiento de Imágenes", "Creación de Posts", "Cursos Básicos"],
  },
  pro: {
    name: "Pro",
    price: 19.99,
    features: [
      "Todo lo de Gratuito",
      "Cursos Intermedios",
      "Certificados de Cursos",
      "Soporte prioritario",
    ],
  },
  premium: {
    name: "Premium",
    price: 49.99,
    features: [
      "Todo lo de Pro",
      "Todos los Cursos",
      "Mentoría Personalizada",
      "Contenido Exclusivo",
      "Acceso anticipado a nuevos cursos",
    ],
  },
}

const SUBSCRIPTIONS_DB_PATH = path.join(process.cwd(), "subscriptions.json")

function readSubscriptions(): Subscription[] {
  try {
    if (fs.existsSync(SUBSCRIPTIONS_DB_PATH)) {
      const data = fs.readFileSync(SUBSCRIPTIONS_DB_PATH, "utf8")
      const parsed = JSON.parse(data)
      return parsed.map((s: any) => ({
        ...s,
        startedAt: new Date(s.startedAt),
        expiresAt: s.expiresAt ? new Date(s.expiresAt) : undefined,
        createdAt: new Date(s.createdAt),
      }))
    }
  } catch (e) {
    console.error("Error reading subscriptions:", e)
  }
  return []
}

function writeSubscriptions(subscriptions: Subscription[]): void {
  try {
    fs.writeFileSync(SUBSCRIPTIONS_DB_PATH, JSON.stringify(subscriptions, null, 2))
  } catch (e) {
    console.error("Error writing subscriptions:", e)
  }
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const subscriptions = readSubscriptions()
  const active = subscriptions.find(
    (s) => s.userId === userId && s.status === "active"
  )
  return active || null
}

export async function createSubscription(input: Omit<Subscription, "id" | "createdAt">): Promise<Subscription> {
  const subscriptions = readSubscriptions()
  
  const existing = subscriptions.find(
    (s) => s.userId === input.userId && s.status === "active"
  )
  
  if (existing) {
    existing.plan = input.plan
    existing.status = input.status
    existing.stripeCustomerId = input.stripeCustomerId
    existing.stripeSubscriptionId = input.stripeSubscriptionId
    existing.expiresAt = input.expiresAt
    writeSubscriptions(subscriptions)
    return existing
  }
  
  const newSubscription: Subscription = {
    id: uuidv4(),
    ...input,
    createdAt: new Date(),
  }
  
  subscriptions.push(newSubscription)
  writeSubscriptions(subscriptions)
  
  return newSubscription
}

export async function cancelSubscription(userId: string): Promise<boolean> {
  const subscriptions = readSubscriptions()
  const subscription = subscriptions.find(
    (s) => s.userId === userId && s.status === "active"
  )
  
  if (!subscription) return false
  
  subscription.status = "cancelled"
  writeSubscriptions(subscriptions)
  return true
}

export async function checkFeatureAccess(
  userId: string,
  postCount: number,
  featureName: string
): Promise<{ hasAccess: boolean; reason?: string }> {
  const feature = FEATURES.find((f) => f.name === featureName)
  
  if (!feature) {
    return { hasAccess: false, reason: "Feature no encontrada" }
  }
  
  const subscription = await getUserSubscription(userId)
  const userPlan = subscription?.plan || "free"
  
  const planHierarchy = { free: 0, pro: 1, premium: 2 }
  const hasRequiredPlan = planHierarchy[userPlan] >= planHierarchy[feature.requiredPlan]
  
  if (!hasRequiredPlan) {
    if (feature.requiredPosts > 0) {
      const remainingPosts = feature.requiredPosts - postCount
      return {
        hasAccess: false,
        reason: `Necesitas ${remainingPosts} posts más o upgrade a ${feature.requiredPlan}`,
      }
    }
    return {
      hasAccess: false,
      reason: `Requiere plan ${feature.requiredPlan}`,
    }
  }
  
  if (feature.requiredPosts > 0 && postCount < feature.requiredPosts) {
    const remainingPosts = feature.requiredPosts - postCount
    return {
      hasAccess: false,
      reason: `Completa ${remainingPosts} posts más para desbloquear`,
    }
  }
  
  return { hasAccess: true }
}

export async function getUserUnlockedFeatures(
  userId: string,
  postCount: number
): Promise<FeatureAccess[]> {
  const unlocked: FeatureAccess[] = []
  
  for (const feature of FEATURES) {
    const access = await checkFeatureAccess(userId, postCount, feature.name)
    if (access.hasAccess) {
      unlocked.push(feature)
    }
  }
  
  return unlocked
}
