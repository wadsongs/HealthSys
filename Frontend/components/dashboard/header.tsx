"use client"

import { useEffect, useState } from "react"
import { Bell, Search, User } from "lucide-react"
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

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "—"
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "agora mesmo"
  if (mins < 60) return `há ${mins} minuto${mins !== 1 ? "s" : ""}`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `há ${hours} hora${hours !== 1 ? "s" : ""}`
  const days = Math.floor(hours / 24)
  return `há ${days} dia${days !== 1 ? "s" : ""}`
}

export function DashboardHeader() {
  const [userName, setUserName] = useState("Usuário")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState("Colaborador")
  const [notificacoes, setNotificacoes] = useState<PacienteResponse[]>([])

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
              {notificacoes.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {notificacoes.length}
                </Badge>
              )}
              <span className="sr-only">Notificações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notificacoes.length === 0 ? (
              <DropdownMenuItem disabled>
                <span className="text-muted-foreground text-sm">Nenhuma notificação</span>
              </DropdownMenuItem>
            ) : (
              notificacoes.map((paciente) => (
                <DropdownMenuItem
                  key={paciente.id}
                  className="flex flex-col items-start gap-1 cursor-pointer"
                >
                  <span className="font-medium">Novo paciente registrado</span>
                  <span className="text-xs text-muted-foreground">
                    {paciente.nome} —{" "}
                    {paciente.dataCadastro ? formatRelativeTime(paciente.dataCadastro) : "—"}
                  </span>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-primary cursor-pointer justify-center">
              Ver todos os pacientes
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
