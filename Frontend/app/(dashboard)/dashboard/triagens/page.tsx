"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ClipboardList,
  Clock3,
  Loader2,
  PlusCircle,
  RefreshCw,
  Search,
  Siren,
  UserRound,
  Timer,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { criarTriagem, listarTriagens, atualizarStatusTriagem } from "@/lib/api/triagem"
import { listarPacientes } from "@/lib/api/pacientes"
import type { NivelRiscoTriagem, PacienteResponse, StatusTriagem, TriagemResponse } from "@/lib/api/types"
import { toast } from "sonner"

const prioridadeClasses: Record<NivelRiscoTriagem, string> = {
  VERMELHO: "bg-red-500/15 text-red-700 border-red-500/30",
  LARANJA: "bg-orange-500/15 text-orange-700 border-orange-500/30",
  AMARELO: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  VERDE: "bg-green-500/15 text-green-700 border-green-500/30",
  AZUL: "bg-blue-500/15 text-blue-700 border-blue-500/30",
}

const prioridadeLabel: Record<NivelRiscoTriagem, string> = {
  VERMELHO: "Vermelho",
  LARANJA: "Laranja",
  AMARELO: "Amarelo",
  VERDE: "Verde",
  AZUL: "Azul",
}

const statusLabel: Record<StatusTriagem, string> = {
  AGUARDANDO: "Aguardando",
  EM_ATENDIMENTO: "Em atendimento",
  FINALIZADO: "Finalizado",
  TRANSFERIDO: "Transferido",
  DESISTIU: "Desistiu",
}

function formatarDataHora(valor?: string) {
  if (!valor) return "—"
  const data = new Date(valor)
  if (isNaN(data.getTime())) return "—"
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

export default function TriagensPage() {
  const [triagens, setTriagens] = useState<TriagemResponse[]>([])
  const [pacientes, setPacientes] = useState<PacienteResponse[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingId, setIsUpdatingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    pacienteId: "",
    sintomas: "",
    observacoes: "",
    prioridade: "VERDE" as NivelRiscoTriagem,
  })

  const carregarDados = async () => {
    setIsLoading(true)
    try {
      const [paginaTriagens, dadosPacientes] = await Promise.all([
        listarTriagens("size=200&sort=dataHoraEntrada,desc"),
        listarPacientes(),
      ])
      setTriagens(paginaTriagens.content)
      setPacientes(dadosPacientes)
    } catch (err) {
      toast.error("Erro ao carregar triagens", {
        description: err instanceof Error ? err.message : "Verifique se o backend de triagem está disponível.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void carregarDados()
  }, [])

  const filtradas = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return triagens
    return triagens.filter(
      (triagem) =>
        triagem.nomePaciente.toLowerCase().includes(query) ||
        (triagem.sintomas ?? "").toLowerCase().includes(query) ||
        prioridadeLabel[triagem.nivelRisco].toLowerCase().includes(query)
    )
  }, [searchTerm, triagens])

  const aguardando = useMemo(
    () => triagens.filter((triagem) => triagem.status === "AGUARDANDO").length,
    [triagens]
  )

  const criticos = useMemo(
    () =>
      triagens.filter((triagem) => triagem.nivelRisco === "VERMELHO" || triagem.nivelRisco === "LARANJA").length,
    [triagens]
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.pacienteId || !formData.sintomas.trim()) {
      toast.error("Preencha todos os campos obrigatórios da triagem.")
      return
    }

    const pacienteSelecionado = pacientes.find((paciente) => paciente.id === Number(formData.pacienteId))
    if (!pacienteSelecionado) {
      toast.error("Paciente inválido. Selecione um paciente cadastrado.")
      return
    }

    setIsSaving(true)
    try {
      const novaTriagem = await criarTriagem({
        pacienteId: pacienteSelecionado.id,
        nomePaciente: pacienteSelecionado.nome,
        nivelRisco: formData.prioridade,
        sintomas: formData.sintomas.trim(),
        observacoes: formData.observacoes.trim() || undefined,
      })

      setTriagens((atual) => [novaTriagem, ...atual])
      setFormData({
        pacienteId: "",
        sintomas: "",
        observacoes: "",
        prioridade: "VERDE",
      })

      toast.success("Triagem registrada com sucesso.")
    } catch (err) {
      toast.error("Erro ao registrar triagem", {
        description: err instanceof Error ? err.message : "Tente novamente em instantes.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAtualizarStatus = async (id: number, status: StatusTriagem) => {
    setIsUpdatingId(id)
    try {
      const atualizada = await atualizarStatusTriagem(id, status)
      setTriagens((atual) => atual.map((item) => (item.id === id ? atualizada : item)))
      toast.success(`Status atualizado para ${statusLabel[status]}.`)
    } catch (err) {
      toast.error("Erro ao atualizar status", {
        description: err instanceof Error ? err.message : "Tente novamente em instantes.",
      })
    } finally {
      setIsUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Triagem</h1>
          <p className="text-muted-foreground">
            Classificação de risco e controle da fila de atendimento.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit gap-2">
          <ClipboardList className="h-4 w-4" />
          Protocolo de Manchester
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Na fila</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{aguardando}</span>
            <Clock3 className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Casos críticos</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{criticos}</span>
            <Siren className="h-5 w-5 text-destructive" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em atendimento</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {triagens.filter((triagem) => triagem.status === "EM_ATENDIMENTO").length}
            </span>
            <Timer className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total no turno</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{triagens.length}</span>
            <UserRound className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle>Fila de triagem</CardTitle>
            <CardDescription>Pacientes aguardando classificação e encaminhamento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente, queixa ou prioridade..."
                className="pl-10"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button variant="outline" className="gap-2" onClick={() => void carregarDados()} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Atualizar
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead className="hidden lg:table-cell">Queixa</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead className="hidden sm:table-cell">Descrição</TableHead>
                    <TableHead>Chegada</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtradas.map((triagem) => {
                    const bloqueado = isUpdatingId === triagem.id
                    return (
                    <TableRow key={triagem.id}>
                      <TableCell className="font-medium">{triagem.nomePaciente}</TableCell>
                      <TableCell className="hidden lg:table-cell">{triagem.sintomas || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={prioridadeClasses[triagem.nivelRisco]}>
                          {prioridadeLabel[triagem.nivelRisco]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {triagem.descricaoRisco}
                      </TableCell>
                      <TableCell>{formatarDataHora(triagem.dataHoraEntrada ?? triagem.dataCadastro)}</TableCell>
                      <TableCell>
                        <Badge variant={triagem.status === "AGUARDANDO" ? "secondary" : "default"}>
                          {statusLabel[triagem.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {triagem.status === "AGUARDANDO" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={bloqueado}
                              onClick={() => void handleAtualizarStatus(triagem.id, "EM_ATENDIMENTO")}
                            >
                              {bloqueado ? <Loader2 className="h-4 w-4 animate-spin" /> : "Iniciar"}
                            </Button>
                          )}
                          {triagem.status === "EM_ATENDIMENTO" && (
                            <Button
                              size="sm"
                              disabled={bloqueado}
                              onClick={() => void handleAtualizarStatus(triagem.id, "FINALIZADO")}
                            >
                              {bloqueado ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finalizar"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {!isLoading && filtradas.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum paciente encontrado para o filtro informado.
              </p>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando triagens...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Nova triagem</CardTitle>
            <CardDescription>Registre rapidamente o paciente na fila.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Select
                  value={formData.pacienteId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, pacienteId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes.map((paciente) => (
                      <SelectItem key={paciente.id} value={String(paciente.id)}>
                        {paciente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sintomas">Queixa principal</Label>
                <Textarea
                  id="sintomas"
                  placeholder="Descreva a queixa em poucas palavras"
                  value={formData.sintomas}
                  onChange={(event) => setFormData((prev) => ({ ...prev, sintomas: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(value: NivelRiscoTriagem) =>
                    setFormData((prev) => ({ ...prev, prioridade: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VERMELHO">Vermelho - Emergente</SelectItem>
                    <SelectItem value="LARANJA">Laranja - Muito urgente</SelectItem>
                    <SelectItem value="AMARELO">Amarelo - Urgente</SelectItem>
                    <SelectItem value="VERDE">Verde - Pouco urgente</SelectItem>
                    <SelectItem value="AZUL">Azul - Não urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Informações complementares da triagem"
                  value={formData.observacoes}
                  onChange={(event) => setFormData((prev) => ({ ...prev, observacoes: event.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                {isSaving ? "Registrando..." : "Adicionar à fila"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
