import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

/**
 * Converte respostas da API (ISO-8601, arrays Jackson antigos, dd/MM/yyyy) em Date.
 */
export function parseApiDate(value: unknown): Date | null {
  if (value == null || value === "") return null
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value
  if (typeof value === "number") {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return null
    const fromIso = new Date(trimmed)
    if (!isNaN(fromIso.getTime())) return fromIso
    const br = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(trimmed)
    if (br) {
      const day = Number(br[1])
      const month = Number(br[2])
      const year = Number(br[3])
      const h = br[4] != null ? Number(br[4]) : 0
      const min = br[5] != null ? Number(br[5]) : 0
      const s = br[6] != null ? Number(br[6]) : 0
      const d = new Date(year, month - 1, day, h, min, s)
      return isNaN(d.getTime()) ? null : d
    }
    return null
  }
  if (Array.isArray(value)) {
    const y = value[0]
    const m = value[1]
    const day = value[2]
    if (typeof y !== "number" || typeof m !== "number" || typeof day !== "number") return null
    const h = typeof value[3] === "number" ? value[3] : 0
    const min = typeof value[4] === "number" ? value[4] : 0
    const sec = typeof value[5] === "number" ? value[5] : 0
    return new Date(y, m - 1, day, h, min, sec)
  }
  return null
}

/** Texto relativo em português (ex.: "há 3 minutos"), robusto a formatos da API Java. */
export function formatRelativeTime(value: unknown): string {
  const d = parseApiDate(value)
  if (!d) return "—"
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR })
}
