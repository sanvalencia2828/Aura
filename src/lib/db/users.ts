import { v4 as uuidv4 } from "uuid"
import * as fs from "fs"
import * as path from "path"

export interface User {
  id: string
  name: string
  email: string
  password: string
  image?: string
  createdAt: Date
}

const DB_PATH = path.join(process.cwd(), "users.json")

function readUsers(): User[] {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8")
      const parsed = JSON.parse(data)
      return parsed.map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt),
      }))
    }
  } catch (e) {
    console.error("Error reading users:", e)
  }
  return []
}

function writeUsers(users: User[]): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2))
  } catch (e) {
    console.error("Error writing users:", e)
  }
}

export async function createUser(input: Omit<User, "id" | "createdAt">): Promise<User | null> {
  const users = readUsers()
  
  const existing = users.find((u) => u.email === input.email)
  if (existing) {
    return null
  }

  const newUser: User = {
    id: uuidv4(),
    ...input,
    createdAt: new Date(),
  }

  users.push(newUser)
  writeUsers(users)

  return newUser
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = readUsers()
  return users.find((u) => u.email === email) || null
}

export async function getUserById(id: string): Promise<User | null> {
  const users = readUsers()
  return users.find((u) => u.id === id) || null
}
