/**
 * Decodifica payload JWT (sem validar assinatura). Usado só para ler claims como `id`.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const pad = base64.length % 4
    if (pad) base64 += "=".repeat(4 - pad)
    const json = atob(base64)
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

export function readUserIdFromToken(token: string): number | null {
  const payload = decodeJwtPayload(token)
  if (!payload) return null
  const id = payload.id
  if (typeof id === "number" && Number.isFinite(id)) return id
  if (typeof id === "string") {
    const n = Number(id)
    return Number.isFinite(n) ? n : null
  }
  return null
}
