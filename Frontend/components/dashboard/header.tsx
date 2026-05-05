"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, Radio, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getStoredUser } from "@/lib/auth-storage"
import { listarPacientesRecentes } from "@/lib/api/pacientes"
import type { PacienteResponse } from "@/lib/api/types"
import { useRealtimeNotifications } from "@/components/providers/realtime-notifications-provider"
import { formatRelativeTime } from "@/lib/format-relative"

export function DashboardHeader() {
  const { items: alertasTempoReal, clear: limparAlertas, connected: wsConectado } =
    useRealtimeNotifications()
  const [userName, setUserName] = useState("Usuário")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState("Colaborador")
  const [notificacoes, setNotificacoes] = useState<PacienteResponse[]>([])

  const contagemBadge =
    alertasTempoReal.length > 0 ? alertasTempoReal.length : notificacoes.length

  const limparTodasNotificacoes = () => {
    limparAlertas()
    setNotificacoes([])
  }

  useEffect(() => {
    const { nome, email, perfil } = getStoredUser()
    if (nome) setUserName(nome)
    if (email) setUserEmail(email)
    if (perfil) setUserProfile(perfil)

    listarPacientesRecentes(3)
      .then(({ pacientes }) => setNotificacoes(pacientes))
      .catch(() => null)
  }, [])

  return (
    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Left side - Search */}
      <div className="flex items-center gap-4 flex-1 ml-12 lg:ml-0">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar pacientes, consultas..."
            className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Mobile Search */}
        <Button variant="ghost" size="icon" className="sm:hidden">
          <Search className="h-5 w-5" />
          <span className="sr-only">Buscar</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {contagemBadge > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {contagemBadge > 99 ? "99+" : contagemBadge}
                </Badge>
              )}
              <span className="sr-only">Notificações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between gap-2">
              <span>Notificações</span>
              {wsConectado ? (
                <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                  <Radio className="h-3 w-3 text-green-600" aria-hidden />
                  tempo real
                </span>
              ) : (
                <span className="text-xs font-normal text-muted-foreground">tempo real off</span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 pb-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full"
                onClick={limparTodasNotificacoes}
                disabled={alertasTempoReal.length === 0 && notificacoes.length === 0}
              >
                Limpar notificações
              </Button>
            </div>
            {alertasTempoReal.length > 0 && (
              <>
                <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
                  Alertas (WebSocket · RabbitMQ)
                </p>
                {alertasTempoReal.map((item) => {
                  const hrefTriagem =
                    item.tipoEvento === "TRIAGEM_CRIADA" ||
                    item.tipoEvento === "TRIAGEM_URGENTE"
                  const content = (
                    <>
                      <span className="font-medium">
                        {item.tipoEvento === "ALERGIAS_ATUALIZADAS"
                          ? "Alergias atualizadas"
                          : item.tipoEvento === "PACIENTE_CRIADO"
                            ? "Novo paciente"
                            : item.tipoEvento === "TRIAGEM_CRIADA"
                              ? "Nova triagem"
                              : item.tipoEvento === "TRIAGEM_URGENTE"
                                ? "Triagem urgente"
                                : item.tipoEvento}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {item.descricao ||
                          (item.idPaciente != null
                            ? `Paciente #${item.idPaciente}`
                            : "Evento recebido")}
                        {" — "}
                        {formatRelativeTime(item.receivedAt)}
                      </span>
                    </>
                  )
                  if (hrefTriagem) {
                    return (
                      <DropdownMenuItem key={item.id} asChild className="cursor-pointer">
                        <Link href="/dashboard/triagens" className="flex flex-col items-start gap-1">
                          {content}
                        </Link>
                      </DropdownMenuItem>
                    )
                  }
                  if (item.tipoEvento === "ALERGIAS_ATUALIZADAS" && item.idPaciente != null) {
                    return (
                      <DropdownMenuItem key={item.id} asChild className="cursor-pointer">
                        <Link
                          href={`/dashboard/pacientes/${item.idPaciente}/prontuario`}
                          className="flex flex-col items-start gap-1"
                        >
                          {content}
                        </Link>
                      </DropdownMenuItem>
                    )
                  }
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      className="flex flex-col items-start gap-1 cursor-default focus:bg-muted/50"
                    >
                      {content}
                    </DropdownMenuItem>
                  )
                })}
                <DropdownMenuSeparator />
              </>
            )}
            <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
              Cadastros recentes
            </p>
            {notificacoes.length === 0 && alertasTempoReal.length === 0 ? (
              <DropdownMenuItem disabled>
                <span className="text-muted-foreground text-sm">Nenhuma notificação</span>
              </DropdownMenuItem>
            ) : null}
            {notificacoes.map((paciente) => (
              <DropdownMenuItem
                key={paciente.id}
                className="flex flex-col items-start gap-1 cursor-pointer"
                asChild
              >
                <Link href="/dashboard/pacientes">
                  <span className="font-medium">Novo paciente registrado</span>
                  <span className="text-xs text-muted-foreground">
                    {paciente.nome} —{" "}
                    {paciente.dataCadastro ? formatRelativeTime(paciente.dataCadastro) : "—"}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-center text-primary cursor-pointer justify-center">
              <Link href="/dashboard/pacientes">Ver todos os pacientes</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="Avatar" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-xs text-muted-foreground">{userProfile}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">Minha conta</span>
                {userEmail ? (
                  <span className="text-xs font-normal text-muted-foreground">{userEmail}</span>
                ) : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Perfil</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
