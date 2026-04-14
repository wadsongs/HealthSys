import { getToken } from "@/lib/auth-storage"

type ServiceName = "usuarios" | "pacientes" | "prontuario"

const BASE_URLS: Record<ServiceName, string> = {
  usuarios: process.env.NEXT_PUBLIC_USUARIOS_API_URL ?? "http://localhost:8081",
  pacientes: process.env.NEXT_PUBLIC_PACIENTES_API_URL ?? "http://localhost:8082",
  prontuario: process.env.NEXT_PUBLIC_PRONTUARIO_API_URL ?? "http://localhost:8083",
}

interface RequestOptions extends RequestInit {
  auth?: boolean
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const data = await response.json()
    if (typeof data?.message === "string") return data.message
    if (typeof data?.error === "string") return data.error
  } catch {
    // noop
  }
  return `Erro ${response.status}: ${response.statusText}`
}

export async function apiRequest<T>(
  service: ServiceName,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers = new Headers(options.headers)
  const hasJsonBody = Boolean(options.body)

  if (hasJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json")
  }

  if (options.auth) {
    const token = getToken()
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }

  const response = await fetch(`${BASE_URLS[service]}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
