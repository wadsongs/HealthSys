"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users,
  ClipboardList,
  Stethoscope,
  BedDouble,
  TrendingUp,
  UserPlus,
  Calendar,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { listarPacientesRecentes } from "@/lib/api/pacientes"
import { listarTriagensPorStatus } from "@/lib/api/triagem"
import type { PacienteResponse } from "@/lib/api/types"
import { formatRelativeTime } from "@/lib/format-relative"

export default function DashboardPage() {
  const [totalPacientes, setTotalPacientes] = useState<number | null>(null)
  const [triagensAguardando, setTriagensAguardando] = useState<number | null>(null)
  const [recentes, setRecentes] = useState<PacienteResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      listarPacientesRecentes(5),
      listarTriagensPorStatus("AGUARDANDO").catch(() => null),
    ])
      .then(([pacientesResult, triagensPendentes]) => {
        setRecentes(pacientesResult.pacientes)
        setTotalPacientes(pacientesResult.total)
        setTriagensAguardando(
          triagensPendentes != null ? triagensPendentes.length : null
        )
      })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Aqui está o resumo do dia.
          </p>
        </div>
        <Link href="/dashboard/pacientes/novo">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total de Pacientes — dado real */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Pacientes
            </CardTitle>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                totalPacientes?.toLocaleString("pt-BR") ?? "—"
              )}
            </div>
            {!loading && totalPacientes !== null && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-success/10 text-success border-0 gap-1">
                  <TrendingUp className="h-3 w-3" />
                  cadastrados
                </Badge>
                <span className="text-xs text-muted-foreground">no sistema</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Triagens Pendentes — status AGUARDANDO */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Triagens Pendentes
            </CardTitle>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : triagensAguardando != null ? (
                triagensAguardando.toLocaleString("pt-BR")
              ) : (
                "—"
              )}
            </div>
            {!loading && triagensAguardando != null && (
              <span className="text-xs text-muted-foreground">
                aguardando classificação / fila
              </span>
            )}
            {!loading && triagensAguardando === null && (
              <span className="text-xs text-muted-foreground">
                não foi possível carregar a triagem
              </span>
            )}
          </CardContent>
        </Card>

        {/* Consultas Hoje — módulo não disponível */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consultas Hoje
            </CardTitle>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <span className="text-xs text-muted-foreground">módulo não disponível</span>
          </CardContent>
        </Card>

        {/* Leitos Ocupados — módulo não disponível */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leitos Ocupados
            </CardTitle>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <BedDouble className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <span className="text-xs text-muted-foreground">módulo não disponível</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Atividades Recentes — dados reais */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimos pacientes cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando atividades...
              </div>
            ) : recentes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhuma atividade recente
              </p>
            ) : (
              <div className="space-y-4">
                {recentes.map((paciente) => (
                  <div
                    key={paciente.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 bg-primary/10 text-primary">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Novo paciente registrado</p>
                      <p className="text-sm text-muted-foreground truncate">{paciente.nome}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {paciente.dataCadastro ? formatRelativeTime(paciente.dataCadastro) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link href="/dashboard/pacientes">
              <Button variant="outline" className="w-full mt-4">
                Ver todos os pacientes
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Próximas Consultas — módulo não disponível */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
            <CardDescription>Agenda de hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
              <Calendar className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Módulo de agendamento não disponível
              </p>
            </div>
            <Button variant="outline" className="w-full mt-4" disabled>
              Ver agenda completa
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <span className="text-2xl font-bold">
                    {totalPacientes?.toLocaleString("pt-BR") ?? "—"}
                  </span>
                  <span className="text-sm text-muted-foreground">pacientes</span>
                </>
              )}
            </div>
            <Progress value={100} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação - UTI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">—</span>
              <span className="text-sm text-muted-foreground">módulo não disponível</span>
            </div>
            <Progress value={0} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação - Enfermaria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">—</span>
              <span className="text-sm text-muted-foreground">módulo não disponível</span>
            </div>
            <Progress value={0} className="h-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
