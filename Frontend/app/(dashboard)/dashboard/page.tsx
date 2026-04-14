"use client"

import {
  Users,
  ClipboardList,
  Stethoscope,
  BedDouble,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const statsCards = [
  {
    title: "Total de Pacientes",
    value: "1.248",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
    description: "vs. mês anterior",
  },
  {
    title: "Triagens Pendentes",
    value: "8",
    change: "-3",
    changeType: "negative" as const,
    icon: ClipboardList,
    description: "aguardando avaliação",
  },
  {
    title: "Consultas Hoje",
    value: "24",
    change: "4 restantes",
    changeType: "neutral" as const,
    icon: Stethoscope,
    description: "20 realizadas",
  },
  {
    title: "Leitos Ocupados",
    value: "45/60",
    change: "75%",
    changeType: "neutral" as const,
    icon: BedDouble,
    description: "15 disponíveis",
  },
]

const recentActivities = [
  {
    id: 1,
    type: "check-in",
    title: "Novo paciente registrado",
    description: "Maria Santos - Triagem",
    time: "há 5 minutos",
    status: "pending",
    icon: UserPlus,
  },
  {
    id: 2,
    type: "consultation",
    title: "Consulta finalizada",
    description: "João Pereira - Dr. Silva",
    time: "há 15 minutos",
    status: "completed",
    icon: CheckCircle2,
  },
  {
    id: 3,
    type: "alert",
    title: "Triagem urgente",
    description: "Ana Costa - Emergência",
    time: "há 20 minutos",
    status: "urgent",
    icon: AlertCircle,
  },
  {
    id: 4,
    type: "schedule",
    title: "Consulta agendada",
    description: "Pedro Lima - Cardiologia",
    time: "há 30 minutos",
    status: "scheduled",
    icon: Calendar,
  },
  {
    id: 5,
    type: "consultation",
    title: "Consulta finalizada",
    description: "Lucia Ferreira - Dra. Santos",
    time: "há 1 hora",
    status: "completed",
    icon: CheckCircle2,
  },
]

const upcomingAppointments = [
  { patient: "Carlos Mendes", doctor: "Dr. Silva", time: "14:00", specialty: "Cardiologia" },
  { patient: "Ana Rodrigues", doctor: "Dra. Lima", time: "14:30", specialty: "Pediatria" },
  { patient: "Roberto Alves", doctor: "Dr. Costa", time: "15:00", specialty: "Ortopedia" },
  { patient: "Fernanda Santos", doctor: "Dra. Oliveira", time: "15:30", specialty: "Dermatologia" },
]

export default function DashboardPage() {
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
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                {stat.changeType === "positive" && (
                  <Badge variant="secondary" className="bg-success/10 text-success border-0 gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </Badge>
                )}
                {stat.changeType === "negative" && (
                  <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0 gap-1">
                    <Clock className="h-3 w-3" />
                    {stat.change}
                  </Badge>
                )}
                {stat.changeType === "neutral" && (
                  <Badge variant="secondary" className="bg-muted border-0">
                    {stat.change}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas atualizações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                      activity.status === "completed"
                        ? "bg-success/10 text-success"
                        : activity.status === "urgent"
                        ? "bg-destructive/10 text-destructive"
                        : activity.status === "pending"
                        ? "bg-warning/10 text-warning"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Ver todas as atividades
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
            <CardDescription>
              Agenda de hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                    {appointment.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{appointment.patient}</p>
                    <p className="text-xs text-muted-foreground">{appointment.doctor}</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {appointment.specialty}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Ver agenda completa
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação - UTI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">85%</span>
              <span className="text-sm text-muted-foreground">17/20 leitos</span>
            </div>
            <Progress value={85} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação - Enfermaria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">68%</span>
              <span className="text-sm text-muted-foreground">28/40 leitos</span>
            </div>
            <Progress value={68} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos Realizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">83%</span>
              <span className="text-sm text-muted-foreground">20/24 consultas</span>
            </div>
            <Progress value={83} className="h-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
