import { getToken } from "@/lib/auth-storage"

type ServiceName = "usuarios" | "pacientes" | "prontuario"

const BASE_URLS: Record<ServiceName, string> = {
  usuarios: process.env.NEXT_PUBLIC_USUARIOS_API_URL ?? "http://localhost:8081",
  pacientes: process.env.NEXT_PUBLIC_PACIENTES_API_URL ?? "http://localhost:8082",
  prontuario: process.env.NEXT_PUBLIC_PRONTUARIO_API_URL ?? "http://localhost:8083",
}

interface RequestOptions extends RequestInit {
  auth?: boolean
  /** Cabeçalho `X-User-Id` (API de prontuário e outros serviços internos) */
  userId?: number
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const data = await response.json()
    if (typeof data?.message === "string" && data.message) return data.message
    if (typeof data?.mensagem === "string" && data.mensagem) return data.mensagem
    if (typeof data?.error === "string" && data.error) return data.error
    if (data?.errors && typeof data.errors === "object") {
      const first = Object.values(data.errors)[0]
      if (typeof first === "string") return first
      if (Array.isArray(first) && typeof first[0] === "string") return first[0]
    }
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

  if (options.userId != null && Number.isFinite(options.userId)) {
    headers.set("X-User-Id", String(options.userId))
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
