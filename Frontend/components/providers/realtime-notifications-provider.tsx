"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Client, IMessage } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { toast } from "sonner"
import { getToken } from "@/lib/auth-storage"

export interface RealtimeNotificationItem {
  id: string
  tipoEvento: string
  descricao?: string | null
  idPaciente?: number | null
  dataEvento?: string | null
  receivedAt: number
}

type NotificationsContextValue = {
  items: RealtimeNotificationItem[]
  clear: () => void
  connected: boolean
}

const NotificationsContext = createContext<NotificationsContextValue>({
  items: [],
  clear: () => {},
  connected: false,
})

function tituloParaTipo(tipo: string): string {
  switch (tipo) {
    case "ALERGIAS_ATUALIZADAS":
      return "Alergias atualizadas"
    case "PACIENTE_CRIADO":
      return "Novo paciente"
    case "TRIAGEM_CRIADA":
      return "Nova triagem"
    case "TRIAGEM_URGENTE":
      return "Triagem urgente"
    default:
      return "Notificação do sistema"
  }
}

function subtitulo(item: RealtimeNotificationItem): string {
  const partes: string[] = []
  if (item.descricao) partes.push(item.descricao)
  if (item.idPaciente != null) partes.push(`Paciente #${item.idPaciente}`)
  return partes.join(" · ") || "Evento assíncrono (RabbitMQ)"
}

export function RealtimeNotificationsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [items, setItems] = useState<RealtimeNotificationItem[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) return

    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
    const wsUrl = `${base.replace(/\/$/, "")}/ws?access_token=${encodeURIComponent(token)}`

    const client = new Client({
      reconnectDelay: 5000,
      webSocketFactory: () => new SockJS(wsUrl) as unknown as WebSocket,
      onConnect: () => {
        setConnected(true)
        client.subscribe("/topic/notifications", (message: IMessage) => {
          try {
            const body = JSON.parse(message.body as string) as {
              id?: string
              tipoEvento?: string
              descricao?: string | null
              idPaciente?: number | null
              dataEvento?: string | null
            }
            const item: RealtimeNotificationItem = {
              id: body.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              tipoEvento: body.tipoEvento ?? "EVENTO",
              descricao: body.descricao,
              idPaciente: body.idPaciente,
              dataEvento: body.dataEvento,
              receivedAt: Date.now(),
            }
            setItems((prev) => [item, ...prev].slice(0, 50))

            const title = tituloParaTipo(item.tipoEvento)
            const description = subtitulo(item)
            if (item.tipoEvento === "TRIAGEM_URGENTE") {
              toast.error(title, { description })
            } else {
              toast.info(title, { description })
            }
          } catch {
            // payload inválido — ignora
          }
        })
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
      onStompError: () => setConnected(false),
    })

    client.activate()
    return () => {
      void client.deactivate()
      setConnected(false)
    }
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo(
    () => ({ items, clear, connected }),
    [items, clear, connected]
  )

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useRealtimeNotifications() {
  return useContext(NotificationsContext)
}
